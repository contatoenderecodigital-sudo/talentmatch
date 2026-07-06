# DeuVaga

Triagem comportamental (DISC) pra contratação em cargos de alta rotatividade.
Especificação: leia **CONCEITO-v2.md** (produto — prevalece em conflito), **CLAUDE.md** (como
construir) e **SECURITY.md** (segurança/LGPD), nesta ordem.

## Rodar

```bash
npm install
cp .env.example .env   # preencha com URL e anon key do Supabase
npm run web            # navegador (alvo principal do MVP)
npm run android        # emulador/dispositivo Android (Expo Go)
npm run ios            # simulador iOS (precisa de macOS) ou Expo Go
```

## Backend (uma vez por ambiente)

O banco e as functions moram em `supabase/`. Pra aplicar num projeto Supabase:

```bash
npx supabase login                      # abre o navegador
npx supabase link --project-ref <ref>   # ref do projeto (dashboard > Settings)
npx supabase db push                    # aplica supabase/migrations/
npx supabase functions deploy submit-quiz --no-verify-jwt
npx supabase functions deploy lgpd-request --no-verify-jwt
```

Alternativa sem CLI: colar `supabase/migrations/*.sql` no SQL Editor do dashboard (as functions
exigem o CLI). Depois valide a segurança num banco de teste/staging:
`supabase/tests/rls_invasao_test.sql` (só linhas PASS) e `supabase/tests/match_score_test.sql`
(saída vazia).

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
```

CI roda os três + checagem de arquivos gerados em todo push (`.github/workflows/ci.yml`).

Arquivos gerados (NÃO editar na mão — regenerar quando a fonte mudar):
- `supabase/functions/_shared/quiz-data.ts` ← `docs/disc-quiz.json` (`node scripts/gen-quiz-data.mjs`)
- `supabase/tests/match_score_test.sql` ← `lib/fixtures/matching-fixtures.json` (`node scripts/gen-sql-fixtures.mjs`)

## Build web (produção)

```bash
EXPO_PUBLIC_APP_URL=https://SEU-DOMINIO npx expo export --platform web
```

Servir a pasta `dist/` em qualquer host estático. `EXPO_PUBLIC_APP_URL` é a base do link
público do quiz (o que vai no QR code).

## Estrutura

Ver seção 5 do CLAUDE.md. Resumo: `app/` (rotas expo-router — `(auth)` e `(empresa)` protegidas,
`q/` é o quiz público), `lib/` (supabase, matching, disc, billing), `supabase/` (migrations e edge
functions), `docs/` (PRD, quiz, decisões).
