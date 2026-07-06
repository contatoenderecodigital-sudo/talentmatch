// Edge Function: recebe a candidatura do quiz público (SECURITY.md §3b).
// Único caminho de escrita do candidato anônimo — anon NÃO tem policy de INSERT.
// Deploy: supabase functions deploy submit-quiz --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2';
import { CONSENT_VERSAO } from '../_shared/consent.ts';
import { QUIZ } from '../_shared/quiz-data.ts';
import { calculaDiscCore, matchScore, normalizaTelefone } from '../_shared/scoring.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LIMITE_POR_HORA = 5; // F1-3

function resposta(status: number, corpo: Record<string, unknown>): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resposta(405, { erro: 'metodo_invalido' });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return resposta(400, { erro: 'json_invalido' });
  }

  // ---- validação do payload (P3: nome, telefone, cidade obrigatórios) ----
  const token = body.token;
  if (typeof token !== 'string' || token.length < 16) return resposta(400, { erro: 'token_invalido' });
  if (body.consent !== true) return resposta(400, { erro: 'consentimento_obrigatorio' });
  if (body.consent_versao !== CONSENT_VERSAO) return resposta(400, { erro: 'termo_desatualizado' });

  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  const cidade = typeof body.cidade === 'string' ? body.cidade.trim() : '';
  if (nome.length < 2) return resposta(400, { erro: 'nome_invalido' });
  if (cidade.length < 2) return resposta(400, { erro: 'cidade_invalida' });

  const telefone = typeof body.telefone === 'string' ? normalizaTelefone(body.telefone) : null;
  if (!telefone) return resposta(400, { erro: 'telefone_invalido' });

  const idade =
    body.idade === null || body.idade === undefined || body.idade === '' ? null : Number(body.idade);
  if (idade !== null && (!Number.isInteger(idade) || idade < 14 || idade > 99)) {
    return resposta(400, { erro: 'idade_invalida' });
  }
  const escolaridade =
    body.escolaridade === null || body.escolaridade === undefined || body.escolaridade === ''
      ? null
      : body.escolaridade;
  if (
    escolaridade !== null &&
    !['fundamental', 'medio', 'tecnico', 'superior'].includes(escolaridade as string)
  ) {
    return resposta(400, { erro: 'escolaridade_invalida' });
  }
  if (!Array.isArray(body.respostas)) return resposta(400, { erro: 'respostas_invalidas' });

  // ---- vaga pelo token, só com link ativo (RN-02) ----
  const { data: vaga, error: vagaErr } = await supabase
    .from('vagas')
    .select('id, disc_target_d, disc_target_i, disc_target_s, disc_target_c')
    .eq('quiz_token', token)
    .eq('quiz_ativo', true)
    .maybeSingle();
  if (vagaErr) return resposta(500, { erro: 'interno' });
  if (!vaga) return resposta(404, { erro: 'link_inativo' });

  // ---- rate limit por IP (F1-3) ----
  if (ip) {
    const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('audit_log')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'candidatura_recebida')
      .eq('ip', ip)
      .gte('created_at', umaHoraAtras);
    if ((count ?? 0) >= LIMITE_POR_HORA) return resposta(429, { erro: 'muitos_envios' });
  }

  // ---- scoring (valida quantidade, ids e duplicatas das respostas) ----
  let vetor;
  try {
    vetor = calculaDiscCore(QUIZ, body.respostas as { pergunta_id: string; opcao_id: string }[]);
  } catch (e) {
    return resposta(400, { erro: 'respostas_invalidas', detalhe: (e as Error).message });
  }
  const score = matchScore(vetor, {
    d: vaga.disc_target_d,
    i: vaga.disc_target_i,
    s: vaga.disc_target_s,
    c: vaga.disc_target_c,
  });

  // ---- dedup por telefone (RN-04 / P5 delegada: refazer a mesma vaga = rejeita) ----
  const { data: existente } = await supabase
    .from('candidatos')
    .select('id')
    .eq('telefone', telefone)
    .maybeSingle();

  let candidatoId: string;
  if (existente) {
    candidatoId = existente.id;
    const { data: dup } = await supabase
      .from('candidaturas')
      .select('id')
      .eq('vaga_id', vaga.id)
      .eq('candidato_id', candidatoId)
      .maybeSingle();
    if (dup) return resposta(409, { erro: 'ja_respondeu' });
    // F1-4: dados cadastrais valem pelo envio mais recente
    await supabase
      .from('candidatos')
      .update({ nome, cidade, idade, escolaridade })
      .eq('id', candidatoId);
  } else {
    const { data: novo, error: novoErr } = await supabase
      .from('candidatos')
      .insert({ nome, telefone, cidade, idade, escolaridade })
      .select('id')
      .single();
    if (novoErr || !novo) return resposta(500, { erro: 'interno' });
    candidatoId = novo.id;
  }

  const { data: candidatura, error: candErr } = await supabase
    .from('candidaturas')
    .insert({
      vaga_id: vaga.id,
      candidato_id: candidatoId,
      respostas: body.respostas,
      disc_d: vetor.d,
      disc_i: vetor.i,
      disc_s: vetor.s,
      disc_c: vetor.c,
      score,
      consent_versao: CONSENT_VERSAO,
      consent_at: new Date().toISOString(),
      consent_pool: body.consent_pool === true,
    })
    .select('id')
    .single();
  if (candErr || !candidatura) {
    if (candErr?.code === '23505') return resposta(409, { erro: 'ja_respondeu' });
    return resposta(500, { erro: 'interno' });
  }

  // Auditoria com IP (metadata sem dado pessoal — anonimização barata, SECURITY.md §6)
  await supabase.from('audit_log').insert({
    action: 'candidatura_recebida',
    entity_type: 'candidatura',
    entity_id: candidatura.id,
    metadata: { vaga_id: vaga.id, score },
    ip,
  });

  return resposta(201, { ok: true });
});
