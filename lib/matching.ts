// Espelho TS da função SQL public.match_score (CLAUDE.md §4).
// A implementação vive em supabase/functions/_shared/scoring.ts (compartilhada com a
// Edge Function submit-quiz). Os MESMOS casos de lib/fixtures/matching-fixtures.json
// rodam aqui e no SQL (supabase/tests/match_score_test.sql, gerado por script).
export { MAX_DIST, matchScore } from '@/supabase/functions/_shared/scoring';
export type { VetorDisc } from '@/supabase/functions/_shared/scoring';
