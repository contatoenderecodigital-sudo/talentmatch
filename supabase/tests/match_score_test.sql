-- GERADO por scripts/gen-sql-fixtures.mjs a partir de lib/fixtures/matching-fixtures.json.
-- NAO editar na mao. Rodar num banco com as migrations aplicadas:
--   psql -f supabase/tests/match_score_test.sql
-- Saida esperada: zero linhas (toda divergencia aparece listada).

select caso, obtido, esperado from (
  select 'fit alto atendimento' as caso, public.match_score(17, 48, 25, 10, 15, 40, 30, 15) as obtido, 95 as esperado
union all
  select 'perfil D em vaga I' as caso, public.match_score(40, 15, 30, 15, 15, 40, 30, 15) as obtido, 82 as esperado
union all
  select 'perfil SC em vaga I' as caso, public.match_score(10, 15, 40, 35, 15, 40, 30, 15) as obtido, 83 as esperado
union all
  select 'vetor identico ao alvo' as caso, public.match_score(15, 40, 30, 15, 15, 40, 30, 15) as obtido, 100 as esperado
union all
  select 'distancia maxima teorica' as caso, public.match_score(0, 0, 0, 0, 100, 100, 100, 100) as obtido, 0 as esperado
union all
  select 'caixa perfil C' as caso, public.match_score(8, 17, 33, 42, 10, 20, 35, 35) as obtido, 96 as esperado
union all
  select 'zeros contra zeros' as caso, public.match_score(0, 0, 0, 0, 0, 0, 0, 0) as obtido, 100 as esperado
) t
where obtido is distinct from esperado;
