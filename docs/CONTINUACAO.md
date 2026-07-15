# DeuVaga — estado do projeto e como continuar (handoff)

> Documento de retomada. Se você (ou o Claude Code) está abrindo o projeto num PC novo,
> leia isto primeiro. Data do handoff: 2026-07-15.

## O que é

App B2B de triagem comportamental (DISC) pra contratação em cargos de alta rotatividade.
Especificação completa (leia nesta ordem, a primeira prevalece em conflito):
`CONCEITO-v2.md` → `CLAUDE.md` → `SECURITY.md`. Decisões e pendências em `docs/decisions.md`
e `docs/decisoes-ui.md`.

## Onde está hospedado

- **Repositório GitHub:** `contatoenderecodigital-sudo/talentmatch` (o nome do repo ficou
  "talentmatch"; o produto é DeuVaga — só cosmético, não atrapalha).
- **Frontend (Vercel):** https://talentmatch-mgs4.vercel.app
- **Backend (Supabase):** projeto `rzipzupabebqdgceiemk`
  (URL `https://rzipzupabebqdgceiemk.supabase.co`).

## Status por fase (MVP)

Fases 0 a 8 **concluídas e commitadas**. Tudo em `main`.
- Fase 0 setup · Fase 1 spec · Fase 2 auth empresa · Fase 3 schema+RLS+RPCs · Fase 4 vagas+plano
  mock · Fase 5 quiz público + Edge Functions · Fase 6 deck · Fase 7 contato/funil · Fase 8 LGPD+polish.
- Testes: 26 unitários (`npm test`), typecheck e lint passando. CI no GitHub Actions.

## O que já está no ar

- Banco: migrations `20260706000001_schema_inicial.sql` e `20260706000002_grants.sql` aplicadas.
- Edge Functions `submit-quiz` e `lgpd-request` deployadas.
- Frontend buildando como SPA na Vercel com as 3 env vars.

## PENDÊNCIA ABERTA (onde paramos)

Estávamos no **teste de ponta a ponta**. Última correção aplicada: a migration de GRANTs
(`20260706000002_grants.sql`) pra resolver "permission denied for table empresas" no onboarding.

**Confirmar no PC novo:** rodar `npx supabase db push` (aplica a migration de grants se ainda
não foi) e refazer o fluxo: criar empresa → plano → vaga → link do quiz → responder como
candidato (aba anônima) → ver no deck → "quero entrevistar" → contato revelado.

Se aparecer "permission denied" em outra tabela, faltou grant pra ela — adicionar numa migration
nova (padrão: `grant select/insert/update ... to authenticated`, MENOS `candidatos`, que fica
sem grant de propósito — telefone só via RPC `revelar_contato`).

## Setup no PC novo (passo a passo)

Pré-requisitos: Node 24+, git, conta GitHub `contatoenderecodigital-sudo`.

```bash
git clone https://github.com/contatoenderecodigital-sudo/talentmatch.git deuvaga
cd deuvaga
npm install
```

**Recriar o `.env`** (ele NÃO vai pro git, por segurança — SECURITY.md §2). Crie o arquivo
`.env` na raiz copiando de `.env.example` e preencha:
```
EXPO_PUBLIC_SUPABASE_URL=https://rzipzupabebqdgceiemk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key do projeto — Supabase Dashboard > Settings > API>
```
(A anon key é a mesma que está no `.env` do PC atual, ou no dashboard do Supabase. NÃO use a
service_role.)

**Rodar:**
```bash
npm run web        # abre no navegador
npm run typecheck
npm test
```

**Supabase CLI** (só se for aplicar migrations/functions do PC novo):
```bash
npx supabase login
npx supabase link --project-ref rzipzupabebqdgceiemk
npx supabase db push
```

## Identidade git (importante — não misturar contas)

O repo usa config **local** (não global): user `contatoenderecodigital-sudo`. No PC novo,
depois do clone, fixe local pra não vazar outra conta:
```bash
git config user.name "contatoenderecodigital-sudo"
git config user.email "contatoenderecodigital-sudo@users.noreply.github.com"
```

## Pendências de produto (do dono, não bloqueiam o teste)

Ver `docs/decisions.md` §2. Números dos tiers (P7) e alvos DISC por cargo são placeholders a
validar com clientes reais. Texto de privacidade precisa de revisão jurídica antes de escalar.
MFA da empresa está opcional no MVP (P8).
