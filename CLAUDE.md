# Contexto do Projeto (CLAUDE.md) — v2

> **Hierarquia de autoridade:** `CONCEITO-v2.md` é a fonte de verdade do produto e **prevalece
> sobre este arquivo** em qualquer conflito. Este arquivo e o `SECURITY.md` têm a mesma autoridade
> entre si e definem COMO construir. Leia os três inteiros antes de qualquer tarefa.
> Nunca invente requisito que não está aqui ou nos docs. Se algo estiver ambíguo, pergunte antes de codar.
>
> **Nome:** o produto se chama **DeuVaga** (nome oficial, decisão do dono em 2026-07-05 — INPI
> sem resultados e domínios .com/.ai disponíveis, ver `docs/decisoes-ui.md`). Usar no nome de
> exibição do app, no bundle id/package (`com.deuvaga.app`) e na pasta do repo.

---

## 1. O que é o produto (MVP v2)

App B2B de **triagem comportamental pra contratação** em cargos de alta rotatividade
(varejo, atendimento, produção, food). Não é marketplace no MVP.

- **Empresa** (cliente pagante, única com conta): cria vaga com alvo DISC (o app sugere um alvo
  padrão por tipo de cargo), **gera um link/QR público do quiz** e distribui pros candidatos que
  ela mesma atraiu (Instagram, WhatsApp, mural, indicação).
- **Candidato** (sem conta no MVP): abre o link no navegador, dá o consentimento LGPD e responde o
  quiz DISC em 3–4 minutos. Responder o quiz **é** a candidatura dele àquela vaga.
- **Deck**: a empresa vê os candidatos daquela vaga ranqueados por % de fit DISC, com leitura em
  linguagem simples ("comunicativo, bom pra atendimento"). O swipe é só o gesto de revisar/
  descartar dentro da própria lista — ele atualiza o status da candidatura.
- **Contato é revelado em um lado só:** quando a empresa marca o candidato como "quero
  entrevistar", o contato (telefone/WhatsApp) é revelado. Não existe match mútuo no MVP.
- **Pós-MVP (Etapa 2 do CONCEITO-v2 §6):** conta de candidato, deck de vagas pro candidato,
  match mútuo e busca no pool. Nada disso entra no MVP.

O score é um **algoritmo de compatibilidade determinístico** (seção 4). Não é machine learning.
Camada de LLM entra só no roadmap (pós-MVP), nunca no MVP.

---

## 2. Stack (decisões fechadas, não trocar sem me perguntar)

| Camada | Escolha | Motivo |
|---|---|---|
| App (web + iOS + Android) | **Expo (React Native) + expo-router** | 1 codebase pros 3 alvos |
| Linguagem | **TypeScript strict** | sem `any` sem justificativa |
| Backend / DB / Auth / Storage | **Supabase** (Postgres + RLS) | já domino, RLS resolve segurança |
| Matching | **função SQL / Postgres RPC** | roda perto do dado, barato |
| Billing B2B | **interface `BillingProvider` + mock no MVP** | gateway não decidido (P16); cobrança real é pós-validação |
| Build / deploy stores | **EAS Build + EAS Submit** | pipeline oficial Expo |
| Estado de servidor | **@tanstack/react-query** | cache + sync com Supabase |
| Forms | **react-hook-form + zod** | validação tipada |
| UI | escolher 1 e padronizar (nativewind OU tamagui) | decidir na Fase 2 (pendência P12), não misturar |

**Não usar:** Firebase, Redux, styled-components legado, nenhum backend Node separado
(tudo que for servidor mora em Supabase Edge Functions).

**Billing desacoplado (decisão do dono):** o MVP **não integra gateway de pagamento nenhum** —
nem Pagar.me nem outro. Existe a interface `BillingProvider` (`lib/billing/provider.ts`) e uma
única implementação no MVP, `MockBillingProvider`, que apenas grava `empresas.plano_tier` e marca
`plano_status = 'ativa'`, sem cobrança real. O resto do app só conhece a interface e os campos
`plano_tier`/`plano_status` — nenhum import de SDK de gateway fora de `lib/billing/`. Quando o
gateway for escolhido (pendência P16), implementa-se a interface na Fase PAG sem tocar no resto.

**Pendência P11:** alvo do MVP (web-first vs lojas desde já). Até decisão, o build prioriza web;
EAS/lojas ficam na Fase 8.

---

## 3. Modelo de dados (Supabase / Postgres)

Tabelas principais (DDL completo + RLS na Fase 3; matriz de RLS detalhada em `docs/data-model.md`
na Fase 1):

- `profiles` — 1:1 com auth.users. `id`, `role` ('empresa'), timestamps. **Candidato não tem
  profile no MVP.** ('admin' entra se P15 = sim.)
- `empresas` — `id`, `profile_id`, `nome`, `cnpj`, `cidade`, `plano_tier`, `plano_status`.
  `plano_tier`/`plano_status` são escritos **só** pelo `BillingProvider` (mock no MVP — seção 2).
- `vagas` — `id`, `empresa_id`, `titulo`, `descricao`, `modalidade` ('remoto'|'presencial'|'hibrido'),
  `escolaridade_min` (nullable), `periodo` ('integral'|'meio'|'flexivel'), `cidade`,
  `status` ('aberta'|'pausada'|'fechada'), `disc_target_d/i/s/c` (int 0–100),
  **`quiz_token`** (não adivinhável, ≥128 bits, unique), **`quiz_ativo`** (bool — o link público é
  `/q/{quiz_token}` e morre quando a vaga pausa/fecha).
- `candidatos` — `id`, `profile_id` (**nullable** — null no MVP; preenchido na Etapa 2 se o
  candidato criar conta), `nome`, `telefone` (**obrigatório, unique — chave de dedup**), `cidade`,
  `idade` (nullable), `escolaridade` (nullable), `created_at`.
  **Sem email, sem CPF, sem foto, sem bio no MVP** (minimização, ver SECURITY.md §5).
- `candidaturas` — `id`, `vaga_id`, `candidato_id`, `respostas` (jsonb — respostas brutas do quiz),
  `disc_d/i/s/c` (int 0–100, calculados), `score` (int 0–100, fit com o alvo da vaga),
  `status` ('novo'|'visto'|'descartado'|'entrevistar'), `consent_versao`, `consent_at`,
  `created_at`. Unique (`vaga_id`, `candidato_id`). O consentimento vive aqui porque é dado por
  candidatura (P2).
- `audit_log` — ver SECURITY.md §6.

**Removido do MVP:** `swipes` e `matches` bilaterais (modelo antigo). O gesto de swipe do deck
apenas atualiza `candidaturas.status`. Reintroduzir só na Etapa 2, com spec própria.

**Regras de acesso obrigatórias (detalhe em SECURITY.md §1):**
- Empresa só lê/edita o próprio registro e as próprias vagas/candidaturas.
- O deck vem de RPC/view que expõe **só os campos do card** (nome NÃO incluso? — incluso: nome,
  cidade, idade, escolaridade, DISC, score, leitura). `telefone` **nunca** aparece no card.
- `telefone` só é lido pela empresa dona da vaga **após** `candidaturas.status = 'entrevistar'`,
  via RPC própria que valida o status e grava no audit_log.
- Candidato anônimo **não insere direto no banco**: a resposta do quiz entra por Edge Function
  (SECURITY.md §3b).

**Dedup / repetição (pendência P5):** mesma pessoa (mesmo telefone) respondendo pra OUTRA vaga
cria nova candidatura reutilizando o registro de `candidatos`. Refazer o quiz da MESMA vaga:
comportamento em aberto — até decisão, a Edge Function rejeita a duplicata com mensagem amigável.

---

## 4. Lógica de matching (MVP, determinística)

**Contexto v2:** o deck de uma vaga mostra **apenas quem respondeu ao link daquela vaga**. Não há
descoberta global, então o "filtro duro" do modelo antigo muda de papel:

**Critérios objetivos (não eliminam por padrão):**
- `modalidade`, `periodo` e `cidade` **saem do filtro do MVP** — são informação da vaga exibida na
  página do quiz; quem respondeu já se candidatou àquela vaga específica.
- `escolaridade` e `idade` são **opcionais** no quiz (P3). Campo vazio **nunca** elimina nem
  penaliza. Quando preenchido e abaixo do mínimo da vaga: comportamento em aberto
  (**pendência P6** — eliminar do deck vs exibir com alerta; recomendação registrada: exibir com
  alerta).
- Escala ordenada de escolaridade (pra comparação com `escolaridade_min`):
  `fundamental` = 1, `medio` = 2, `tecnico` = 3, `superior` = 4.

**Score DISC (ordena o deck):**
Vetor da candidatura `[d,i,s,c]` vs vetor alvo da vaga `[d,i,s,c]`, cada eixo 0–100.

```
dist    = sqrt( (d-dt)^2 + (i-it)^2 + (s-st)^2 + (c-ct)^2 )
maxDist = sqrt( 4 * 100^2 ) = 200
score   = round( (1 - dist / maxDist) * 100 )
```

Score é o `%` de compatibilidade do card. Deck ordena por score desc.
Implementar como função SQL `match_score(...)` + RPC `get_deck(vaga_id)` que devolve o deck
ordenado **só com os campos do card** (sem telefone).

**Espelho TS:** `lib/matching.ts` replica a lógica pra testes no front. Obrigatório: **fixtures
compartilhadas** — os mesmos vetores de teste rodam contra a função SQL e contra o TS e têm que
dar o mesmo score. Sem isso, a fase não passa.

**Quiz DISC:** ~12 perguntas, cada uma soma pesos nos eixos. Normalizar cada eixo pra 0–100 no
fim, com o caso de borda (eixo com soma zero) definido. Schema do quiz em `docs/disc-quiz.json`
(fonte única, app lê de lá — gerado na Fase 1).

**Leitura em linguagem simples:** mapeamento determinístico perfil DISC → frases do card, definido
em `docs/disc-leituras.md` (gerado na Fase 1). Não improvisar frase no código.

**Alvos DISC sugeridos por cargo:** tabela em `docs/disc-alvos-cargo.md` (gerado na Fase 1,
validado por mim — pendência da seção 10 do CONCEITO-v2).

---

## 5. Estrutura de pastas

```
app/                # rotas (expo-router)
  (auth)/           # login/cadastro DA EMPRESA (candidato não tem conta)
  (empresa)/        # onboarding, vagas, deck por vaga, funil, plano
  q/[token].tsx     # página PÚBLICA do quiz (candidato, sem conta, via link/QR)
components/         # UI reutilizável
lib/
  supabase.ts       # client
  matching.ts       # espelho do score SQL (fixtures compartilhadas)
  disc.ts           # scoring do quiz
  billing/          # BillingProvider (interface) + MockBillingProvider; gateway real só na Fase PAG
hooks/              # react-query hooks
types/              # tipos gerados do Supabase (supabase gen types)
supabase/
  migrations/       # SQL versionado
  functions/        # edge functions (submit do quiz, billing, etc.)
docs/               # PRD, data-model, disc-quiz.json, disc-leituras, decisões
```

---

## 6. Roadmap por fases (cada fase entrega algo testável)

- **Fase 0** — Setup: **repo git FORA do OneDrive, caminho sem acento/espaço (ex: `C:\dev\<nome>`)**,
  Expo, Supabase project, `.env`, CI mínimo (lint + typecheck + testes). EAS só se P11 mantiver lojas.
  **Checkpoint de identidade git, antes do primeiro commit:** mostrar ao dono `git config
  user.name`, `git config user.email` e `git remote -v` (se houver), dizer qual conta/identidade
  está ativa e se existe credencial global que possa vazar pro projeto. **Nenhum commit nem remote
  antes da confirmação do dono.** Identidade errada corrige-se com config **local do repo**
  (`git config user.name/user.email`, sem `--global`), pra não misturar com outras contas.
- **Fase 1** — Spec: **ler o CONCEITO-v2.md** (o PDF do pitch antigo é só referência histórica; em
  conflito, o CONCEITO-v2 manda) e gerar `docs/PRD.md`, `docs/data-model.md` (com matriz de RLS),
  `docs/disc-quiz.json`, `docs/disc-leituras.md`, `docs/disc-alvos-cargo.md` e `docs/decisions.md`
  (carregando as pendências P5–P15 da revisão). **Sem código de app ainda.** Eu reviso.
- **Fase 2** — Scaffold + auth **da empresa** (email+senha). Não existe escolha de papel: só
  empresa tem conta no MVP. Decidir e registrar a lib de UI (P12).
- **Fase 3** — Migrations do schema completo (seção 3) + RLS + tipos gerados + seed de dev.
- **Fase 4** — Empresa: onboarding, criar vaga com alvo DISC (com sugestão por cargo), **gerar
  link/QR público do quiz**, listar/editar/pausar/fechar vagas (pausar/fechar desativa o link),
  seleção de plano via **BillingProvider mock** (grava o tier e marca `plano_status = 'ativa'`,
  sem cobrança; tiers placeholder até P7).
- **Fase 5** — Candidato: página pública `/q/{token}` — consentimento LGPD versionado + dados
  mínimos (nome, telefone, cidade obrigatórios; idade, escolaridade opcionais) + quiz DISC.
  Envio via **Edge Function** (valida token, rate limit, dedup por telefone). `lib/disc.ts` com testes.
- **Fase 6** — Deck da empresa: RPC `get_deck(vaga_id)` + score SQL com espelho testado em
  `lib/matching.ts`, UI de swipe atualizando `candidaturas.status`, leitura em linguagem simples.
- **Fase 7** — Contato e funil: ação "quero entrevistar" revela contato (RPC + audit_log), lista
  de entrevistas, botão de WhatsApp. Teste obrigatório: contato bloqueado antes do status.
- **Fase 8** — Polish, build web, e (conforme P11) assets de loja + EAS Submit iOS/Android.
- **Fase PAG (opcional, pós-validação — FORA do MVP)** — billing real: implementar o
  `BillingProvider` com o gateway escolhido (pendência P16), Edge Function + webhook com
  assinatura/idempotência (SECURITY.md §7) e NF-e (P14). Critério de desacoplamento: entra sem
  mudar **nada** fora de `lib/billing/` e das edge functions de billing.
- **Pós-MVP (Etapa 2 do CONCEITO-v2 §6)** — conta de candidato, deck de vagas, match mútuo, busca
  no pool. Pré-condição: consentimento compatível (SECURITY.md §5) e spec própria revisada.

**Regra:** não pular fase. Não começar código de app antes da Fase 1 estar revisada por mim.

---

## 7. Como você (Claude Code) deve trabalhar

1. **Planeje antes de codar.** Toda tarefa não-trivial: primeiro um plano curto (arquivos que vai mexer, ordem, riscos). Espera meu OK.
2. **Commits pequenos e atômicos**, mensagem no imperativo em PT ou EN, consistente.
3. **TypeScript strict.** Sem `any` sem comentário justificando.
4. **Nada de segredo hardcoded.** Tudo em `.env` / secrets do Supabase.
5. **RLS não é opcional.** Toda tabela nova nasce com policy. Sem policy = não terminado.
6. **Teste o caminho crítico:** scoring DISC e score de fit têm testes unitários (vitest/jest),
   com fixtures compartilhadas entre SQL e TS (seção 4).
7. Se um requisito estiver faltando ou ambíguo, **pare e pergunte.** Não preencha lacuna com
   suposição. As pendências conhecidas (P5–P15) estão em `docs/revisao.md` seção 4.
   **Exceção — UI (regra 9):** lacuna de tela/layout/interação não é motivo pra perguntar.
8. Respostas: diretas, sem enrolação, sem texto motivacional. Entregue o artefato.
9. **Autonomia de UI.** Onde faltar especificação de tela, layout, campo ou fluxo de interface,
   NÃO pergunte. Escolha o padrão mais simples e convencional pra um app mobile (o que a maioria
   dos apps faz), implemente, e registre a decisão em `docs/decisoes-ui.md` com uma linha
   explicando o que escolheu e por quê. O dono revisa essas decisões depois, em lote.
   **Isso vale só pra telas secundárias e padrões de UI. NÃO vale pra:** segurança, RLS, modelo
   de dados, billing e regra de negócio do produto — nesses, lacuna continua sendo "pare e
   pergunte" (regra 7).

---

## 8. Pré-requisitos externos (eu providencio, você me lembra quando bloquear)

- Conta Supabase (projeto criado)
- Conta Expo / EAS (só necessária se P11 mantiver lojas)
- Apple Developer Program (US$99/ano) — só na Fase 8, se P11 mantiver iOS
- Google Play Console (US$25 única vez) — só na Fase 8, se P11 mantiver Android
- Conta no gateway de pagamento (a escolher — P16), com recorrência — só na Fase PAG, pós-validação
- Política de privacidade + termos hospedados (exigência da LGPD; das lojas, se P11)

---

## 9. Decisões em aberto (não preencher com suposição)

Pendências que só o dono decide, detalhadas em `docs/revisao.md` seção 4:
**P5** (repetição/refazer quiz) · **P6** (requisito objetivo não cumprido: eliminar vs alertar) ·
**P7** (números dos tiers) · **P8** (MFA obrigatório desde o dia 1) · **P9** (escopo do
consentimento pra Etapa 2) · **P10** (prazo de retenção) · **P11** (web-first vs lojas) ·
**P12** (nativewind vs tamagui) · **P13** resolvida (nome oficial: DeuVaga — ver
`docs/decisoes-ui.md`) · **P14** (NF-e automática vs manual,
junto da Fase PAG) · **P15** (role admin) · **P16** (qual gateway de pagamento — decidir antes da
Fase PAG; nada no MVP depende disso). Se uma fase esbarrar numa delas, pare e pergunte.
