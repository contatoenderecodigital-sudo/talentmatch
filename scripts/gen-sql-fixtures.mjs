// Gera supabase/tests/match_score_test.sql a partir de lib/fixtures/matching-fixtures.json.
// Garante que SQL e TS testam EXATAMENTE os mesmos casos (CLAUDE.md §4).
// Rodar: node scripts/gen-sql-fixtures.mjs  (o arquivo gerado é commitado)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = JSON.parse(readFileSync(join(raiz, 'lib/fixtures/matching-fixtures.json'), 'utf8'));

const linhas = fixtures.casos
  .map((c) => {
    const [d, i, s, cc] = c.v;
    const [dt, it, st, ct] = c.alvo;
    return `  select '${c.nome}' as caso, public.match_score(${d}, ${i}, ${s}, ${cc}, ${dt}, ${it}, ${st}, ${ct}) as obtido, ${c.score} as esperado`;
  })
  .join('\nunion all\n');

const sql = `-- GERADO por scripts/gen-sql-fixtures.mjs a partir de lib/fixtures/matching-fixtures.json.
-- NAO editar na mao. Rodar num banco com as migrations aplicadas:
--   psql -f supabase/tests/match_score_test.sql
-- Saida esperada: zero linhas (toda divergencia aparece listada).

select caso, obtido, esperado from (
${linhas}
) t
where obtido is distinct from esperado;
`;

writeFileSync(join(raiz, 'supabase/tests/match_score_test.sql'), sql);
console.log('supabase/tests/match_score_test.sql gerado com', fixtures.casos.length, 'casos.');
