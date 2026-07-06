// Scoring do quiz DISC + leitura em linguagem simples + alvos por cargo.
// Fontes únicas: docs/disc-quiz.json, docs/disc-leituras.md, docs/disc-alvos-cargo.md.
import quiz from '@/docs/disc-quiz.json';

export type Eixo = 'd' | 'i' | 's' | 'c';
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

export const QUIZ = quiz;
export const TOTAL_PERGUNTAS = quiz.perguntas.length;
// Toda opção soma exatamente 4 pontos (3 principal + 1 secundário) — validado em teste.
const PONTOS_POR_RESPOSTA = 4;
const DENOMINADOR = TOTAL_PERGUNTAS * PONTOS_POR_RESPOSTA; // 48

/** Calcula o vetor DISC normalizado (0–100 por eixo; eixos somam ~100). */
export function calculaDisc(respostas: RespostaQuiz[]): VetorDisc {
  if (respostas.length !== TOTAL_PERGUNTAS) {
    throw new Error(`Esperadas ${TOTAL_PERGUNTAS} respostas, recebidas ${respostas.length}`);
  }
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
    d: Math.round((100 * soma.d) / DENOMINADOR),
    i: Math.round((100 * soma.i) / DENOMINADOR),
    s: Math.round((100 * soma.s) / DENOMINADOR),
    c: Math.round((100 * soma.c) / DENOMINADOR),
  };
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
