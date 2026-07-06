// GERADO por scripts/gen-quiz-data.mjs a partir de docs/disc-quiz.json — NAO editar na mao.
import type { QuizSchema } from './scoring.ts';

export const QUIZ_VERSAO = "1.0.0";

export const QUIZ: QuizSchema = {
  "perguntas": [
    {
      "id": "q01",
      "texto": "Chega um cliente nervoso, reclamando alto. O que você faz primeiro?",
      "opcoes": [
        {
          "id": "q01d",
          "texto": "Assumo a situação e vou direto atrás da solução",
          "pesos": {
            "d": 3,
            "i": 1,
            "s": 0,
            "c": 0
          }
        },
        {
          "id": "q01i",
          "texto": "Converso com calma e tento deixar o clima mais leve",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q01s",
          "texto": "Escuto tudo com paciência, sem interromper",
          "pesos": {
            "d": 0,
            "i": 0,
            "s": 3,
            "c": 1
          }
        },
        {
          "id": "q01c",
          "texto": "Confirmo o que aconteceu e sigo o procedimento da loja",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q02",
      "texto": "Num dia muito corrido, com a loja cheia, você:",
      "opcoes": [
        {
          "id": "q02d",
          "texto": "Toma a frente e vai resolvendo o que aparece",
          "pesos": {
            "d": 3,
            "i": 0,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q02i",
          "texto": "Fala com todo mundo e mantém o time animado",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 0,
            "c": 1
          }
        },
        {
          "id": "q02s",
          "texto": "Segue firme no seu ritmo, sem se desesperar",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 3,
            "c": 0
          }
        },
        {
          "id": "q02c",
          "texto": "Organiza as tarefas por ordem de importância",
          "pesos": {
            "d": 0,
            "i": 1,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q03",
      "texto": "O que mais te dá satisfação no trabalho?",
      "opcoes": [
        {
          "id": "q03d",
          "texto": "Bater a meta ou vencer um desafio difícil",
          "pesos": {
            "d": 3,
            "i": 1,
            "s": 0,
            "c": 0
          }
        },
        {
          "id": "q03i",
          "texto": "Conhecer e conversar com gente nova todo dia",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q03s",
          "texto": "Ajudar de verdade um cliente ou um colega",
          "pesos": {
            "d": 0,
            "i": 0,
            "s": 3,
            "c": 1
          }
        },
        {
          "id": "q03c",
          "texto": "Entregar tudo certinho, sem nenhum erro",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q04",
      "texto": "Seu chefe muda tudo de última hora. Como você reage?",
      "opcoes": [
        {
          "id": "q04d",
          "texto": "Gosto! Mudança pra mim é desafio",
          "pesos": {
            "d": 3,
            "i": 0,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q04i",
          "texto": "Topo na hora e ainda ajudo a animar o resto do time",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 0,
            "c": 1
          }
        },
        {
          "id": "q04s",
          "texto": "Prefiro aviso com antecedência, mas me adapto",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 3,
            "c": 0
          }
        },
        {
          "id": "q04c",
          "texto": "Pergunto os detalhes pra fazer certo do jeito novo",
          "pesos": {
            "d": 0,
            "i": 1,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q05",
      "texto": "Trabalhando em grupo, você costuma ser quem:",
      "opcoes": [
        {
          "id": "q05d",
          "texto": "Decide o que fazer quando ninguém se resolve",
          "pesos": {
            "d": 3,
            "i": 1,
            "s": 0,
            "c": 0
          }
        },
        {
          "id": "q05i",
          "texto": "Puxa a conversa e conecta as pessoas",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q05s",
          "texto": "Apoia quem precisa e mantém o grupo unido",
          "pesos": {
            "d": 0,
            "i": 0,
            "s": 3,
            "c": 1
          }
        },
        {
          "id": "q05c",
          "texto": "Confere se está tudo certo antes de entregar",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q06",
      "texto": "Você descobre um jeito mais rápido de fazer uma tarefa:",
      "opcoes": [
        {
          "id": "q06d",
          "texto": "Já começo a fazer do jeito novo",
          "pesos": {
            "d": 3,
            "i": 0,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q06i",
          "texto": "Conto pra todo mundo, empolgado",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 0,
            "c": 1
          }
        },
        {
          "id": "q06s",
          "texto": "Testo com calma antes de mudar de vez",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 3,
            "c": 0
          }
        },
        {
          "id": "q06c",
          "texto": "Só mudo depois de ter certeza de que não dá problema",
          "pesos": {
            "d": 0,
            "i": 1,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q07",
      "texto": "Uma tarefa repetitiva, o dia inteiro:",
      "opcoes": [
        {
          "id": "q07d",
          "texto": "Me entedia rápido — prefiro desafio novo",
          "pesos": {
            "d": 3,
            "i": 1,
            "s": 0,
            "c": 0
          }
        },
        {
          "id": "q07i",
          "texto": "Vai bem, desde que tenha gente pra conversar por perto",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q07s",
          "texto": "Tranquilo — gosto de rotina e pego o ritmo",
          "pesos": {
            "d": 0,
            "i": 0,
            "s": 3,
            "c": 1
          }
        },
        {
          "id": "q07c",
          "texto": "Gosto — dá pra caprichar em cada detalhe",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q08",
      "texto": "Quando você comete um erro no trabalho:",
      "opcoes": [
        {
          "id": "q08d",
          "texto": "Corrijo rápido e sigo em frente",
          "pesos": {
            "d": 3,
            "i": 0,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q08i",
          "texto": "Admito na boa e desfaço o mal-estar conversando",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 0,
            "c": 1
          }
        },
        {
          "id": "q08s",
          "texto": "Peço desculpa e tomo cuidado dobrado depois",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 3,
            "c": 0
          }
        },
        {
          "id": "q08c",
          "texto": "Analiso o que causou o erro pra nunca mais repetir",
          "pesos": {
            "d": 0,
            "i": 1,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q09",
      "texto": "Prazo apertado pra entregar algo importante:",
      "opcoes": [
        {
          "id": "q09d",
          "texto": "Acelero — pressão me deixa ligado",
          "pesos": {
            "d": 3,
            "i": 1,
            "s": 0,
            "c": 0
          }
        },
        {
          "id": "q09i",
          "texto": "Chamo os colegas e a gente faz junto",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q09s",
          "texto": "Mantenho o passo constante, sem pânico",
          "pesos": {
            "d": 0,
            "i": 0,
            "s": 3,
            "c": 1
          }
        },
        {
          "id": "q09c",
          "texto": "Reorganizo a ordem pra caber tudo sem perder qualidade",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q10",
      "texto": "Um cliente não sabe o que quer:",
      "opcoes": [
        {
          "id": "q10d",
          "texto": "Recomendo direto o que resolve o problema dele",
          "pesos": {
            "d": 3,
            "i": 0,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q10i",
          "texto": "Puxo papo até descobrir do que ele gosta",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 0,
            "c": 1
          }
        },
        {
          "id": "q10s",
          "texto": "Dou tempo e acompanho sem pressionar",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 3,
            "c": 0
          }
        },
        {
          "id": "q10c",
          "texto": "Explico as diferenças de cada opção, uma por uma",
          "pesos": {
            "d": 0,
            "i": 1,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q11",
      "texto": "Você prefere um trabalho onde:",
      "opcoes": [
        {
          "id": "q11d",
          "texto": "Você tem liberdade pra decidir como fazer as coisas",
          "pesos": {
            "d": 3,
            "i": 1,
            "s": 0,
            "c": 0
          }
        },
        {
          "id": "q11i",
          "texto": "Você fala com muita gente o dia todo",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q11s",
          "texto": "O ambiente é estável e o time é unido",
          "pesos": {
            "d": 0,
            "i": 0,
            "s": 3,
            "c": 1
          }
        },
        {
          "id": "q11c",
          "texto": "As regras são claras e tudo é organizado",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 0,
            "c": 3
          }
        }
      ]
    },
    {
      "id": "q12",
      "texto": "Seus colegas diriam que você é:",
      "opcoes": [
        {
          "id": "q12d",
          "texto": "Decidido(a) — resolve e não enrola",
          "pesos": {
            "d": 3,
            "i": 0,
            "s": 1,
            "c": 0
          }
        },
        {
          "id": "q12i",
          "texto": "Comunicativo(a) — conversa com todo mundo",
          "pesos": {
            "d": 0,
            "i": 3,
            "s": 0,
            "c": 1
          }
        },
        {
          "id": "q12s",
          "texto": "Parceiro(a) — firme e sempre disposto(a) a ajudar",
          "pesos": {
            "d": 1,
            "i": 0,
            "s": 3,
            "c": 0
          }
        },
        {
          "id": "q12c",
          "texto": "Detalhista — tudo que faz, faz bem feito",
          "pesos": {
            "d": 0,
            "i": 1,
            "s": 0,
            "c": 3
          }
        }
      ]
    }
  ]
};
