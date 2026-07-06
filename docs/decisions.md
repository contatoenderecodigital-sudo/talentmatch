# Decisões — resolvidas, abertas e propostas da Fase 1

> Regra: pendência aberta NÃO se preenche com suposição (CLAUDE.md §7). Lacuna de UI é exceção
> (regra 9) e vai pro `decisoes-ui.md`. Histórico completo da revisão: `docs/revisao.md`.

## 1. Resolvidas (pelo dono)

| # | Decisão | Resposta |
|---|---|---|
| P1 | Autoridade dos docs | CONCEITO-v2.md prevalece; CLAUDE/SECURITY/PROMPTS reescritos pela v2 (2026-07-04) |
| P2 | Revelação de contato | Unilateral: empresa marca "quero entrevistar" → contato revelado. Sem match mútuo no MVP |
| P3 | Dados do candidato | Obrigatórios: nome, telefone/WhatsApp, cidade + respostas. Opcionais: idade, escolaridade. Sem email/CPF/foto |
| P4 | Fonte da Fase 1 | CONCEITO-v2.md (PDF antigo é só histórico) |
| P13 | Nome | **DeuVaga** (oficial, 2026-07-05; INPI sem resultados, .com/.ai livres) |
| — | Billing | Fora do MVP: interface `BillingProvider` + mock; gateway só na Fase PAG (P16) |

## 2. Pendências delegadas (2026-07-06)

> O dono delegou: **"pode fazer tudo sem pausar"**. As recomendações da tabela abaixo passam a
> valer como decisão de trabalho — reversíveis, é só responder pelo número que eu ajusto.
> Adotadas: P5=a (rejeitar refazer), P6=b (exibir com alerta), P7=placeholders (Básico 1 vaga
> ativa/30 análises-mês; Intermediário 3/100; Alto volume ilimitado — mock, sem cobrança),
> P8=b (MFA opcional no MVP, aviso forte no onboarding — SECURITY.md §3 ajustado),
> P9=a (termo prevê pool da Etapa 2 como opt-in separado — campo `consent_pool`),
> P10=12 meses, P11=web-first, P12=nativewind, P14=manual, P15=só dashboard, P16=Fase PAG.

| # | Pergunta | Opções | Recomendação | Bloqueia |
|---|---|---|---|---|
| P5 | Refazer quiz da MESMA vaga | (a) rejeitar (b) sobrescrever | (a) rejeitar — já é o default implementado na EF | Fase 5 (só se quiser (b)) |
| P6 | Requisito objetivo não cumprido (ex: escolaridade abaixo do mínimo) | (a) eliminar do deck (b) exibir com alerta | (b) — campo é opcional; eliminar por dado ausente/parcial joga fora candidato bom | Fase 6 |
| P7 | Números dos tiers | definir 3 faixas (vagas ativas / análises-mês) | placeholder nomeado no mock; validar com 3–5 donos antes de fixar | Fase 4 (só nomes), Fase PAG (números reais) |
| P8 | MFA obrigatório pra empresa desde o dia 1 | (a) sim (b) opcional no MVP | (b) com aviso forte no onboarding; obrigatório na escala — mas SECURITY.md hoje diz (a), vale até você trocar | Fase 2 |
| P9 | Escopo do consentimento | (a) termo já prevê pool/Etapa 2 como opt-in (b) restrito à vaga + re-consentimento depois | (a) — re-consentir candidato anônimo em massa depois é quase impossível | Fase 5 (texto do termo) |
| P10 | Prazo de retenção/expurgo | 6 / 12 / 24 meses | 12 meses | Fase 5 ir pro ar |
| P11 | Alvo do MVP | (a) web-first (b) lojas desde já | (a) — candidato já é browser; loja só encarece o caminho até a 1ª venda | Fase 8 |
| P12 | Lib de UI | nativewind / tamagui | nativewind | Fase 2 |
| P14 | NF-e | automática (emissor) / manual | manual nos primeiros clientes | Fase PAG |
| P15 | Role admin | criar 'admin' / só dashboard | só dashboard no MVP | leitura do audit_log no app |
| P16 | Gateway de pagamento | Pagar.me / outro | sem pressa — nada no MVP depende | Fase PAG |

## 3. Propostas da Fase 1 (decisões técnicas minhas — aprovar ou vetar na revisão)

| # | Proposta | Onde está |
|---|---|---|
| F1-1 | Plano só muda via RPC `selecionar_plano` (chamada pelo `MockBillingProvider`); trigger bloqueia UPDATE direto de `plano_*` | data-model §1/§3 |
| F1-2 | Vaga não é deletável no MVP — só fechada (preserva candidaturas e auditoria) | data-model §1 |
| F1-3 | Rate limit do quiz: máx. 5 envios/hora por IP, contando no audit_log (sem tabela nova) | data-model §4 |
| F1-4 | Nova candidatura do mesmo telefone atualiza os dados cadastrais do candidato pro envio mais recente | data-model §1 |
| F1-5 | Score congelado no envio: editar o alvo DISC da vaga depois NÃO recalcula candidaturas já recebidas | PRD RN-05 |
| F1-6 | Canal LGPD sem conta: tabela `lgpd_pedidos` + Edge Function; processamento manual pelo dono no MVP | data-model §1/§4, PRD RN-13 |
| F1-7 | Normalização do quiz por distribuição: toda opção soma 4 pontos (3+1), denominador fixo 48, eixos somam ~100, máx. 75/eixo. Alvos por cargo seguem a mesma escala | disc-quiz.json §formula |
| F1-8 | Desempate da leitura: ordem fixa D→I→S→C pro dominante e pro secundário | disc-leituras.md §1 |
| F1-9 | Leitura montada no app a partir do vetor (RPC não devolve texto) | disc-leituras.md §4 |
| F1-10 | Empresa NÃO tem SELECT em `candidatos` (telefone mora lá); card via `get_deck`, contato via `revelar_contato` | data-model §2 |

## 4. Como responder

Responde por número (ex: "P6: b", "F1-4: ok", "F1-3: troca pra 10/h"). Incorporo nos docs e nas
fases seguintes. O que não for respondido continua aberto e trava a fase correspondente da coluna
"Bloqueia".
