# TalentMatch (nome provisório — ver docs/decisoes-ui.md)

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

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
```

CI roda os três em todo push (`.github/workflows/ci.yml`).

## Estrutura

Ver seção 5 do CLAUDE.md. Resumo: `app/` (rotas expo-router — `(auth)` e `(empresa)` protegidas,
`q/` é o quiz público), `lib/` (supabase, matching, disc, billing), `supabase/` (migrations e edge
functions), `docs/` (PRD, quiz, decisões).
