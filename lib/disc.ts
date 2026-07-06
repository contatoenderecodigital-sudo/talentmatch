// Quiz DISC no app: leitura em linguagem simples + alvos por cargo + wrapper do scoring.
// Fontes únicas: docs/disc-quiz.json, docs/disc-leituras.md, docs/disc-alvos-cargo.md.
// O cálculo em si vive em supabase/functions/_shared/scoring.ts (compartilhado com a EF).
import quiz from '@/docs/disc-quiz.json';
import {
  calculaDiscCore,
  type RespostaQuiz,
  type VetorDisc,
} from '@/supabase/functions/_shared/scoring';

export type Eixo = 'd' | 'i' | 's' | 'c';
export type { RespostaQuiz, VetorDisc };

export const QUIZ = quiz;
export const TOTAL_PERGUNTAS = quiz.perguntas.length;

/** Calcula o vetor DISC normalizado (0–100 por eixo; eixos somam ~100). */
export function calculaDisc(respostas: RespostaQuiz[]): VetorDisc {
  return calculaDiscCore(quiz, respostas);
}

// ---- Leitura em linguagem simples (docs/disc-leituras.md) ----

const ORDEM_DESEMPATE: Eixo[] = ['d', 'i', 's', 'c'];

const ROTULO: Record<Eixo, string> = {
  d: 'Direto e decidido',
  i: 'Comunicativo',
  s: 'Constante e parceiro',
  c: 'Caprichoso e detalhista',
};

const FRASE_DOMINANTE: Record<Eixo, string> = {
  d: 'Resolve rápido, gosta de meta e não foge de problema — bom pra correria, cobrança de resultado e liderar a frente de trabalho.',
  i: 'Conversa fácil, anima o ambiente e conquista o cliente — bom pra atendimento, vendas e qualquer função com gente o dia todo.',
  s: 'Estável, paciente e leal ao time — aguenta rotina e função repetitiva sem perder a qualidade do trato.',
  c: 'Organizado, segue o processo e confere antes de entregar — bom pra caixa, estoque, controle e tarefa de precisão.',
};

const FRASE_SECUNDARIA: Record<Eixo, string> = {
  d: 'Também tem iniciativa: quando precisa, toma a frente.',
  i: 'Também se dá bem com gente: comunica sem travar.',
  s: 'Também é constante: mantém o ritmo e apoia o time.',
  c: 'Também é cuidadoso: presta atenção no detalhe.',
};

/** Eixos ordenados do dominante pro menor, com desempate fixo D→I→S→C. */
export function eixosOrdenados(vetor: VetorDisc): Eixo[] {
  return [...ORDEM_DESEMPATE].sort((a, b) => {
    if (vetor[b] !== vetor[a]) return vetor[b] - vetor[a];
    return ORDEM_DESEMPATE.indexOf(a) - ORDEM_DESEMPATE.indexOf(b);
  });
}

export function leituraDoPerfil(vetor: VetorDisc): { rotulo: string; texto: string } {
  const [dominante, secundario] = eixosOrdenados(vetor) as [Eixo, Eixo];
  return {
    rotulo: ROTULO[dominante],
    texto: `${FRASE_DOMINANTE[dominante]} ${FRASE_SECUNDARIA[secundario]}`,
  };
}

// ---- Alvos sugeridos por cargo (docs/disc-alvos-cargo.md) ----

export interface AlvoCargo {
  id: string;
  nome: string;
  alvo: VetorDisc;
}

export const ALVOS_CARGO: AlvoCargo[] = [
  { id: 'atendimento', nome: 'Atendimento / vendas de loja', alvo: { d: 15, i: 40, s: 30, c: 15 } },
  { id: 'balcao_food', nome: 'Balcão / food (atendente)', alvo: { d: 15, i: 35, s: 35, c: 15 } },
  { id: 'caixa', nome: 'Caixa', alvo: { d: 10, i: 20, s: 35, c: 35 } },
  { id: 'estoque', nome: 'Estoque / reposição', alvo: { d: 15, i: 10, s: 45, c: 30 } },
  { id: 'producao', nome: 'Produção / cozinha', alvo: { d: 15, i: 10, s: 40, c: 35 } },
  { id: 'entregador', nome: 'Entregador', alvo: { d: 25, i: 15, s: 40, c: 20 } },
  { id: 'recepcao_sac', nome: 'Recepção / SAC / telefone', alvo: { d: 10, i: 35, s: 35, c: 20 } },
  { id: 'servicos_gerais', nome: 'Serviços gerais / limpeza', alvo: { d: 10, i: 10, s: 50, c: 30 } },
  { id: 'lider', nome: 'Líder de turno / gerente de loja', alvo: { d: 35, i: 30, s: 20, c: 15 } },
  { id: 'telemarketing', nome: 'Telemarketing / vendas ativas', alvo: { d: 25, i: 40, s: 20, c: 15 } },
];

export const ALVO_NEUTRO: VetorDisc = { d: 20, i: 30, s: 30, c: 20 };

// ---- Escala ordenada de escolaridade (CLAUDE.md §4) ----

const ESCALA_ESCOLARIDADE: Record<string, number> = {
  fundamental: 1,
  medio: 2,
  tecnico: 3,
  superior: 4,
};

/**
 * Requisito objetivo (RN-09 / P6 delegada: exibir com alerta, nunca eliminar).
 * Campo vazio NUNCA sinaliza. Retorna true só se preenchido e abaixo do mínimo da vaga.
 */
export function escolaridadeAbaixo(
  escolaridade: string | null,
  minimo: string | null
): boolean {
  if (!escolaridade || !minimo) return false;
  const e = ESCALA_ESCOLARIDADE[escolaridade];
  const m = ESCALA_ESCOLARIDADE[minimo];
  if (e === undefined || m === undefined) return false;
  return e < m;
}
