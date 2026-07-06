// Espelho TS da função SQL public.match_score (CLAUDE.md §4).
// Regra: os MESMOS casos de lib/fixtures/matching-fixtures.json rodam aqui e no SQL
// (supabase/tests/match_score_test.sql, gerado por scripts/gen-sql-fixtures.mjs).
import type { VetorDisc } from './disc';

export const MAX_DIST = 200; // sqrt(4 * 100^2)

export function matchScore(v: VetorDisc, alvo: VetorDisc): number {
  const dist = Math.sqrt(
    (v.d - alvo.d) ** 2 + (v.i - alvo.i) ** 2 + (v.s - alvo.s) ** 2 + (v.c - alvo.c) ** 2
  );
  return Math.round((1 - dist / MAX_DIST) * 100);
}
