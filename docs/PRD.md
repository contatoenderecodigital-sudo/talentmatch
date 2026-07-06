# PRD — DeuVaga (MVP v2)

> Gerado na Fase 1 a partir do CONCEITO-v2.md (fonte de verdade), CLAUDE.md e SECURITY.md.
> Aguarda revisão do dono. Pendências abertas: ver `docs/decisions.md`.

## 1. Visão

Ferramenta B2B de triagem comportamental (DISC) pra contratação em cargos de alta rotatividade
(varejo, atendimento, produção, food). A empresa cria a vaga, distribui um link/QR público do quiz
pros candidatos que ela mesma atraiu, e recebe um ranking de fit comportamental com leitura em
linguagem simples. Funciona com 1 empresa e 0 candidatos pré-existentes — sem cold-start.

Não é marketplace no MVP (isso é Etapa 2). Não é ML: score determinístico.

## 2. Personas e jobs-to-be-done

**Empresa (cliente pagante — única com conta).** Dono ou gerente de comércio/food/produção, sem RH
estruturado, contrata "no feeling" e erra. JTBD: *"quando eu preciso contratar pra uma função
operacional, quero saber quem dos meus candidatos tem o perfil certo pra função, pra não perder o
funcionário (e o investimento) em 3 meses."*

**Candidato (usuário sem conta).** Pessoa buscando vaga operacional; chega pelo Instagram/WhatsApp/
mural da própria empresa. JTBD: *"quero me candidatar rápido, pelo celular, sem baixar app nem
criar conta."* Responder o quiz **é** a candidatura.

## 3. Fluxos e telas

### 3.1 Fluxo da empresa

| # | Tela | Conteúdo essencial |
|---|---|---|
| E1 | Cadastro/Login | email+senha, verificação de email, recuperação de senha, MFA (P8) |
| E2 | Onboarding | nome da empresa, CNPJ, cidade |
| E3 | Seleção de plano | tiers (placeholder até P7), via `BillingProvider` mock — marca ativa, sem cobrança |
| E4 | Minhas vagas (home) | lista de vagas com status, contagem de candidatos, criar vaga |
| E5 | Criar/editar vaga | título, descrição, modalidade, período, cidade, escolaridade mínima (opcional), alvo DISC (sliders pré-preenchidos pela sugestão por cargo — `docs/disc-alvos-cargo.md`) |
| E6 | Detalhe da vaga | link público `/q/{token}` + QR code, botões copiar/compartilhar, pausar/fechar (mata o link), abrir deck |
| E7 | Deck da vaga | cards ordenados por score desc: nome, cidade, idade/escolaridade (se informadas), % fit, leitura simples; gestos/botões: visto, descartar, **quero entrevistar** |
| E8 | Funil / entrevistas | candidatos com status 'entrevistar': contato revelado + botão WhatsApp; demais status listáveis |
| E9 | Conta/plano | dados da empresa, plano atual, logout |

### 3.2 Fluxo do candidato (público, `/q/{token}`)

| # | Tela | Conteúdo essencial |
|---|---|---|
| C1 | Vaga + consentimento | título, empresa, cidade, modalidade, período; texto do consentimento LGPD versionado com checkbox obrigatório ANTES de qualquer pergunta |
| C2 | Dados mínimos | nome*, telefone/WhatsApp*, cidade* (obrigatórios); idade, escolaridade (opcionais, não travam) |
| C3 | Quiz DISC | 12 perguntas de `docs/disc-quiz.json`, uma por vez, barra de progresso |
| C4 | Confirmação | "candidatura enviada" — sem mostrar score (decisão de UI, ver decisoes-ui.md) |
| C5 | Estados de erro | link inativo/vaga fechada; telefone já respondeu esta vaga (mensagem amigável, P5); falha de rede com retry |

Rodapé de todas as telas públicas: link pra política de privacidade e pro canal LGPD
("excluir/exportar meus dados" — ver RN-13).

## 4. Regras de negócio

- **RN-01 Candidatura = quiz.** Só existe candidatura com quiz completo + consentimento. Resposta
  incompleta não grava nada.
- **RN-02 Link público.** Um `quiz_token` por vaga (≥128 bits, unique). Link ativo somente com
  vaga `aberta`. Pausar/fechar desativa; reabrir reativa o MESMO token.
- **RN-03 Envio só por Edge Function.** Valida token+`quiz_ativo`, rate limit por IP, dedup por
  telefone, calcula DISC e score, grava candidato+candidatura+audit. Nenhum insert direto de `anon`.
- **RN-04 Dedup.** Telefone é a chave do candidato (normalizado: só dígitos, DDD+número, 10–11
  dígitos). Mesma vaga + mesmo telefone → rejeita com mensagem amigável (default até P5). Outra
  vaga → nova candidatura reutilizando o candidato (dados cadastrais atualizados pro envio mais
  recente — proposta F1-4 em decisions.md).
- **RN-05 Score.** `score = round((1 - dist/200) * 100)` sobre os vetores DISC (CLAUDE.md §4).
  Calculado no envio e congelado na candidatura (mudança posterior do alvo da vaga não recalcula —
  proposta F1-5).
- **RN-06 Deck.** Mostra só candidaturas daquela vaga, ordenadas por score desc, via RPC
  `get_deck` com os campos do card. **Telefone nunca aparece no card.**
- **RN-07 Funil.** Status da candidatura: `novo → visto → descartado | entrevistar`. Swipe/botões
  só mudam status. Descarte é reversível (volta pra 'visto' — decisão de UI).
- **RN-08 Contato unilateral.** Marcar 'entrevistar' revela nome+telefone via RPC própria, que
  valida dona+status e grava no audit_log. Não existe match mútuo no MVP.
- **RN-09 Requisito objetivo.** Escolaridade/idade vazias nunca eliminam nem penalizam.
  Preenchida e abaixo do mínimo: comportamento pendente (P6) — recomendação: exibir com alerta.
- **RN-10 Plano.** Empresa só cria/ativa vaga com `plano_status='ativa'` e dentro do limite do
  tier (números: P7). Escrita de plano só pelo `BillingProvider` (mock no MVP) via RPC
  `selecionar_plano`.
- **RN-11 Consentimento.** Por candidatura (`consent_versao`, `consent_at`). Texto declara a
  finalidade: análise de fit pra vaga X da empresa Y. Escopo pra Etapa 2: pendente (P9).
- **RN-12 Auditoria.** Eventos críticos no `audit_log` (server-side): ver SECURITY.md §6.
- **RN-13 LGPD do candidato sem conta.** Página pública "meus dados": informa telefone → Edge
  Function registra o pedido (exclusão ou exportação) e o processamento apaga/exporta em até X
  dias (prazo operacional — proposta F1-6). Exclusão = hard delete de candidato+candidaturas +
  anonimização no audit_log.
- **RN-14 Retenção.** Expurgo de candidatura sem interação após prazo pendente (P10).

## 5. Escopo

**MVP (Etapa 1):** tudo acima. Web-first (P11 pendente; build prioriza web).
**Fora do MVP — Etapa 2 (CONCEITO-v2 §6):** conta de candidato, deck de vagas pro candidato,
match mútuo, busca no pool, foto/bio de candidato, multiusuário por empresa.
**Fora do MVP — Fase PAG:** billing real (gateway P16), NF-e (P14).

## 6. Requisitos não funcionais

Segurança/LGPD/auditoria: SECURITY.md na íntegra (RLS, RPCs de coluna restrita, Edge Function do
quiz, MFA, retenção). Quiz completo em 3–4 min no celular (12 perguntas, 1 toque por pergunta).
Página `/q/{token}` funciona em navegador mobile sem instalação. Textos em PT-BR simples.

## 7. Métricas de validação (sugestão, não requisito)

Vagas com ≥5 candidaturas; tempo criação-da-vaga → 1ª candidatura; % de candidaturas marcadas
'entrevistar'; empresas que criam 2ª vaga (retenção do cliente).
