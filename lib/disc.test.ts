import { describe, expect, it } from 'vitest';
import {
  ALVOS_CARGO,
  calculaDisc,
  eixosOrdenados,
  escolaridadeAbaixo,
  leituraDoPerfil,
  QUIZ,
  type RespostaQuiz,
} from './disc';

function respostasTodas(eixo: 'd' | 'i' | 's' | 'c'): RespostaQuiz[] {
  return QUIZ.perguntas.map((p) => ({ pergunta_id: p.id, opcao_id: `${p.id}${eixo}` }));
}

describe('invariantes do schema do quiz (docs/disc-quiz.json)', () => {
  it('tem 12 perguntas com 4 opções cada', () => {
    expect(QUIZ.perguntas).toHaveLength(12);
    for (const p of QUIZ.perguntas) expect(p.opcoes).toHaveLength(4);
  });

  it('toda opção soma exatamente 4 pontos (3 principal + 1 secundário)', () => {
    for (const p of QUIZ.perguntas) {
      for (const o of p.opcoes) {
        const soma = o.pesos.d + o.pesos.i + o.pesos.s + o.pesos.c;
        expect(soma, `${o.id}`).toBe(4);
        expect(Math.max(o.pesos.d, o.pesos.i, o.pesos.s, o.pesos.c)).toBe(3);
      }
    }
  });

  it('o schema é balanceado: 48 pontos possíveis por eixo', () => {
    const total = { d: 0, i: 0, s: 0, c: 0 };
    for (const p of QUIZ.perguntas)
      for (const o of p.opcoes) {
        total.d += o.pesos.d;
        total.i += o.pesos.i;
        total.s += o.pesos.s;
        total.c += o.pesos.c;
      }
    expect(total).toEqual({ d: 48, i: 48, s: 48, c: 48 });
  });
});

describe('calculaDisc', () => {
  it('todas as respostas D → [75, 13, 13, 0]', () => {
    expect(calculaDisc(respostasTodas('d'))).toEqual({ d: 75, i: 13, s: 13, c: 0 });
  });

  it('todas as respostas I → [0, 75, 13, 13]', () => {
    expect(calculaDisc(respostasTodas('i'))).toEqual({ d: 0, i: 75, s: 13, c: 13 });
  });

  it('mix D/I/S/C alternado → [19, 31, 19, 31]', () => {
    const eixos = ['d', 'i', 's', 'c'] as const;
    const respostas = QUIZ.perguntas.map((p, idx) => ({
      pergunta_id: p.id,
      opcao_id: `${p.id}${eixos[idx % 4]}`,
    }));
    expect(calculaDisc(respostas)).toEqual({ d: 19, i: 31, s: 19, c: 31 });
  });

  it('rejeita quiz incompleto', () => {
    expect(() => calculaDisc(respostasTodas('d').slice(0, 11))).toThrow(/12 respostas/);
  });

  it('rejeita pergunta duplicada', () => {
    const r = respostasTodas('d');
    r[1] = { ...r[0]! };
    expect(() => calculaDisc(r)).toThrow(/duas vezes/);
  });

  it('rejeita opção inexistente', () => {
    const r = respostasTodas('d');
    r[0] = { pergunta_id: 'q01', opcao_id: 'q01x' };
    expect(() => calculaDisc(r)).toThrow(/Opção inválida/);
  });
});

describe('leituraDoPerfil (fixtures de docs/disc-leituras.md)', () => {
  it('[17,48,25,10] → dominante I, secundário S', () => {
    const l = leituraDoPerfil({ d: 17, i: 48, s: 25, c: 10 });
    expect(l.rotulo).toBe('Comunicativo');
    expect(l.texto).toContain('Conversa fácil');
    expect(l.texto).toContain('Também é constante');
  });

  it('[10,15,40,35] → dominante S, secundário C', () => {
    const l = leituraDoPerfil({ d: 10, i: 15, s: 40, c: 35 });
    expect(l.rotulo).toBe('Constante e parceiro');
    expect(l.texto).toContain('Também é cuidadoso');
  });

  it('empate total → ordem fixa D depois I', () => {
    expect(eixosOrdenados({ d: 25, i: 25, s: 25, c: 25 })).toEqual(['d', 'i', 's', 'c']);
    const l = leituraDoPerfil({ d: 25, i: 25, s: 25, c: 25 });
    expect(l.rotulo).toBe('Direto e decidido');
    expect(l.texto).toContain('Também se dá bem com gente');
  });

  it('[60,10,20,10] → dominante D, secundário S', () => {
    const l = leituraDoPerfil({ d: 60, i: 10, s: 20, c: 10 });
    expect(l.rotulo).toBe('Direto e decidido');
    expect(l.texto).toContain('Também é constante');
  });
});

describe('escolaridadeAbaixo (RN-09: vazio nunca sinaliza)', () => {
  it('vazio nunca alerta', () => {
    expect(escolaridadeAbaixo(null, 'superior')).toBe(false);
    expect(escolaridadeAbaixo('medio', null)).toBe(false);
    expect(escolaridadeAbaixo(null, null)).toBe(false);
  });
  it('abaixo do mínimo alerta', () => {
    expect(escolaridadeAbaixo('fundamental', 'medio')).toBe(true);
    expect(escolaridadeAbaixo('medio', 'superior')).toBe(true);
  });
  it('igual ou acima não alerta', () => {
    expect(escolaridadeAbaixo('medio', 'medio')).toBe(false);
    expect(escolaridadeAbaixo('superior', 'tecnico')).toBe(false);
  });
});

describe('alvos por cargo (docs/disc-alvos-cargo.md)', () => {
  it('todo alvo soma 100 e respeita o teto de 75 por eixo', () => {
    for (const cargo of ALVOS_CARGO) {
      const { d, i, s, c } = cargo.alvo;
      expect(d + i + s + c, cargo.id).toBe(100);
      for (const v of [d, i, s, c]) expect(v).toBeLessThanOrEqual(75);
    }
  });
});
