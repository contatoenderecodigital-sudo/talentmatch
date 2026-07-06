// Núcleo PURO de scoring — usado pelo app (lib/disc.ts, lib/matching.ts) e pela
// Edge Function submit-quiz. Uma implementação só: zero deriva entre client e servidor.
// Sem imports: roda em Metro, Vitest e Deno.

export interface VetorDisc {
  d: number;
  i: number;
  s: number;
  c: number;
}

export interface RespostaQuiz {
  pergunta_id: string;
  opcao_id: string;
}

export interface QuizSchema {
  perguntas: {
    id: string;
    texto: string;
    opcoes: { id: string; texto: string; pesos: VetorDisc }[];
  }[];
}

// Toda opção soma exatamente 4 pontos (3 principal + 1 secundário) — invariante testada.
const PONTOS_POR_RESPOSTA = 4;

/** Vetor DISC normalizado (0–100 por eixo; eixos somam ~100). Fórmula: docs/disc-quiz.json. */
export function calculaDiscCore(quiz: QuizSchema, respostas: RespostaQuiz[]): VetorDisc {
  const total = quiz.perguntas.length;
  if (respostas.length !== total) {
    throw new Error(`Esperadas ${total} respostas, recebidas ${respostas.length}`);
  }
  const denominador = total * PONTOS_POR_RESPOSTA; // 48
  const soma: VetorDisc = { d: 0, i: 0, s: 0, c: 0 };
  const respondidas = new Set<string>();

  for (const r of respostas) {
    if (respondidas.has(r.pergunta_id)) {
      throw new Error(`Pergunta respondida duas vezes: ${r.pergunta_id}`);
    }
    const pergunta = quiz.perguntas.find((p) => p.id === r.pergunta_id);
    if (!pergunta) throw new Error(`Pergunta desconhecida: ${r.pergunta_id}`);
    const opcao = pergunta.opcoes.find((o) => o.id === r.opcao_id);
    if (!opcao) throw new Error(`Opção inválida ${r.opcao_id} pra ${r.pergunta_id}`);
    respondidas.add(r.pergunta_id);
    soma.d += opcao.pesos.d;
    soma.i += opcao.pesos.i;
    soma.s += opcao.pesos.s;
    soma.c += opcao.pesos.c;
  }

  return {
    d: Math.round((100 * soma.d) / denominador),
    i: Math.round((100 * soma.i) / denominador),
    s: Math.round((100 * soma.s) / denominador),
    c: Math.round((100 * soma.c) / denominador),
  };
}

export const MAX_DIST = 200; // sqrt(4 * 100^2)

/** Espelho TS da função SQL public.match_score (CLAUDE.md §4). */
export function matchScore(v: VetorDisc, alvo: VetorDisc): number {
  const dist = Math.sqrt(
    (v.d - alvo.d) ** 2 + (v.i - alvo.i) ** 2 + (v.s - alvo.s) ** 2 + (v.c - alvo.c) ** 2
  );
  return Math.round((1 - dist / MAX_DIST) * 100);
}

/** Normaliza telefone BR: só dígitos, DDD + número (10–11). Null se inválido. */
export function normalizaTelefone(bruto: string): string | null {
  let t = bruto.replace(/\D/g, '');
  if (t.startsWith('55') && t.length > 11) t = t.slice(2); // remove código do país
  if (t.length < 10 || t.length > 11) return null;
  if (t.startsWith('0')) return null;
  return t;
}
