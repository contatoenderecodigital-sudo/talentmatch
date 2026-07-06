import { describe, expect, it } from 'vitest';
import fixtures from '@/lib/fixtures/matching-fixtures.json';
import type { VetorDisc } from './disc';
import { matchScore } from './matching';

function vetor([d, i, s, c]: number[]): VetorDisc {
  return { d: d!, i: i!, s: s!, c: c! };
}

describe('matchScore (fixtures compartilhadas com o SQL)', () => {
  for (const caso of fixtures.casos) {
    it(caso.nome, () => {
      expect(matchScore(vetor(caso.v), vetor(caso.alvo))).toBe(caso.score);
    });
  }

  it('é simétrico', () => {
    const a = vetor([17, 48, 25, 10]);
    const b = vetor([15, 40, 30, 15]);
    expect(matchScore(a, b)).toBe(matchScore(b, a));
  });

  it('fica sempre entre 0 e 100', () => {
    for (let k = 0; k <= 100; k += 25) {
      const s = matchScore(vetor([k, 100 - k, k, 100 - k]), vetor([50, 50, 50, 50]));
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});
