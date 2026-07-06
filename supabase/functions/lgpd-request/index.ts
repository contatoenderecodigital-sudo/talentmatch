// Edge Function: canal LGPD do candidato sem conta (RN-13 / F1-6).
// Registra o pedido de exclusão/exportação; o processamento é manual no MVP
// (dashboard + RPC processar_exclusao_lgpd).
// Deploy: supabase functions deploy lgpd-request --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2';
import { normalizaTelefone } from '../_shared/scoring.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resposta(status: number, corpo: Record<string, unknown>): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return resposta(405, { erro: 'metodo_invalido' });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return resposta(400, { erro: 'json_invalido' });
  }

  const telefone = typeof body.telefone === 'string' ? normalizaTelefone(body.telefone) : null;
  if (!telefone) return resposta(400, { erro: 'telefone_invalido' });
  const tipo = body.tipo;
  if (tipo !== 'exclusao' && tipo !== 'exportacao') return resposta(400, { erro: 'tipo_invalido' });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;

  const { error } = await supabase.from('lgpd_pedidos').insert({ telefone, tipo });
  if (error) return resposta(500, { erro: 'interno' });

  await supabase.from('audit_log').insert({
    action: 'lgpd_pedido',
    entity_type: 'lgpd',
    metadata: { tipo },
    ip,
  });

  // Resposta neutra: não revela se o telefone existe na base.
  return resposta(201, { ok: true });
});
