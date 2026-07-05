# Segurança, LGPD e Auditabilidade (SECURITY.md) — v2

> Padrão de "sem fazer nas coxas". Nenhuma fase é dada como pronta se violar algo aqui.
> Este arquivo complementa o CLAUDE.md e tem a mesma autoridade. Em conflito de produto,
> o CONCEITO-v2.md prevalece sobre os dois.
> Produto: **DeuVaga** (nome oficial — ver docs/decisoes-ui.md).

---

## 1. Regra número um: RLS em tudo (e RPC onde RLS não alcança)

- **Toda** tabela nasce com `ENABLE ROW LEVEL SECURITY`. Tabela sem policy = tabela quebrada.
- Empresa só acessa a própria linha (`empresas`), as próprias vagas e as candidaturas das próprias
  vagas. Nenhuma empresa lê candidatura de vaga alheia, em nenhuma hipótese.
- **RLS é por LINHA, não por coluna.** Esconder campo dentro de uma linha visível é feito por
  view/RPC com colunas restritas, nunca por RLS pura nem por "esconder no front":
  - O deck vem da RPC `get_deck(vaga_id)`, que devolve **só os campos do card** (nome, cidade,
    idade, escolaridade, DISC, score, leitura). `telefone` nunca sai nessa RPC.
  - **Revelação de contato é unilateral (decisão P2):** o candidato consente ao responder o quiz
    (a candidatura). O `telefone` só é lido pela empresa dona da vaga **depois** que ela marca
    `candidaturas.status = 'entrevistar'`, via RPC própria que valida o status e grava o evento
    no `audit_log`. Não existe match mútuo no MVP.
- Teste de invasão obrigatório por fase:
  1. Logar como empresa A e tentar ler vaga/candidatura/contato da empresa B via API direta.
  2. Logar como empresa dona da vaga e tentar ler `telefone` de candidatura com status ≠
     'entrevistar' (inclusive via select direto na tabela, fora da RPC).
  Se qualquer leitura indevida passar, a fase não passou.

## 2. Chaves e segredos

- Chave `service_role` **nunca** vai pro app. Só existe em Edge Functions / secrets do Supabase.
- **O MVP não tem chave de gateway de pagamento** — billing é mock atrás do `BillingProvider`
  (CLAUDE.md seção 2). Quando a Fase PAG chegar: chaves do gateway só em Edge Function + secrets.
  Nada de chave de pagamento no client, em nenhuma hipótese.
- `.env` fora do git (`.gitignore`). Nenhum segredo commitado, nunca.
- **Identidade git conferida antes do primeiro commit** (Fase 0): `git config user.name`,
  `user.email` e `git remote -v` mostrados ao dono e confirmados por ele — evita commit com conta
  errada e credencial global vazando pro projeto. Correção sempre com config **local do
  repositório** (sem `--global`).
- Rotação de chaves documentada. Se algo vazar, procedimento pra girar em minutos.

## 3. Autenticação (só empresa tem conta no MVP)

- Conta existe **só pra empresa** no MVP. Candidato não tem login (ver §3b).
- Verificação de email obrigatória antes de usar o app.
- MFA (2FA) obrigatório pra conta de empresa (ela administra dado de terceiros).
  **Pendência P8:** avaliar a fricção no onboarding de venda presencial; até decisão em
  contrário, obrigatório vale.
- Política de senha forte + rate limit no login (Supabase Auth já oferece, ativar).
- Sessões com expiração e refresh token. Logout invalida sessão.

## 3b. Link público do quiz (a superfície anônima do sistema)

O quiz por link é a função central do MVP e a única porta sem autenticação. Regras:

- Token do link **não adivinhável** (≥128 bits de entropia), um por vaga, unique
  (`vagas.quiz_token`). O link morre quando a vaga pausa/fecha (`quiz_ativo = false`).
- O candidato anônimo **não insere direto no banco**. A resposta entra por **Edge Function** que:
  1. valida o token e o `quiz_ativo`;
  2. aplica rate limit por IP;
  3. deduplica por telefone (mesma vaga + mesmo telefone = rejeita com mensagem amigável,
     até decisão da pendência P5);
  4. valida os campos e o consentimento antes de gravar.
- **Nenhuma policy de INSERT/SELECT aberta pro role `anon`** nas tabelas `candidatos` e
  `candidaturas`. Zero exceção.
- Dados coletados no quiz (decisão P3): **obrigatórios** — nome, telefone/WhatsApp, cidade,
  respostas do DISC, consentimento. **Opcionais** (não travam o envio) — idade, escolaridade.
  **Não coletar:** email, CPF, foto, ou qualquer campo além destes.
- Resposta incompleta/abandonada não cria registro. Sem lixo no funil.

## 4. Storage (fotos e arquivos)

- **No MVP não há upload de candidato** (sem foto — decisão P3). Esta seção vale pra qualquer
  arquivo futuro (ex: logo da empresa, foto de candidato na Etapa 2):
- Bucket **privado**, nunca público.
- Acesso por URL assinada com validade curta, gerada só pra quem tem direito ao arquivo.
- Validação de tipo e tamanho no upload (só imagem, limite de MB).

## 5. LGPD (é aqui que o app de recrutamento vive ou morre)

- **Base legal + consentimento** explícito na página do quiz, antes das perguntas: checkbox
  versionado, com `consent_versao` e `consent_at` salvos **na candidatura** (o consentimento é
  por candidatura, não por conta — o candidato não tem conta).
- **Finalidade explícita no termo:** o dado é usado pra análise de compatibilidade com a vaga X
  da empresa Y. **Pendência P9:** se a Etapa 2 (pool/marketplace, CONCEITO-v2 §6) for exibir o
  perfil a outras empresas, isso é finalidade nova — ou o termo do MVP já prevê como opt-in
  separado, ou haverá re-consentimento antes de ligar a Etapa 2. Decidir ANTES do primeiro
  candidato real responder.
- **Minimização:** só nome, telefone, cidade (+ idade/escolaridade opcionais). Sem email, sem
  CPF, sem foto no MVP. Campo novo só entra com justificativa de uso.
- **Direito de exclusão:** o candidato não tem login, então precisa de canal próprio — link
  "excluir meus dados" no rodapé da página do quiz + verificação de titularidade pelo telefone.
  Exclusão apaga de verdade (hard delete de `candidatos`/`candidaturas`), com log da solicitação
  (anonimizado conforme §6). Detalhar o fluxo na Fase 1.
- **Portabilidade:** exportar os dados do titular em JSON sob pedido, pelo mesmo canal.
- **Política de privacidade e termos de uso** publicados em URL própria (exigência da LGPD e,
  se P11 mantiver lojas, das stores).
- **Retenção:** candidatura sem interação tem prazo de expurgo. **Pendência P10** (6, 12 ou 24
  meses) — o prazo precisa estar fixado antes da Fase 5 ir pro ar com candidato real.

## 6. Auditabilidade (a "contabilidade" de quem fez o quê)

Tabela `audit_log` append-only:

- Colunas: `id`, `actor_profile_id` (nullable — evento de candidato anônimo não tem profile),
  `action`, `entity_type`, `entity_id`, `metadata` (jsonb), `ip`, `created_at`.
- Registra: login, criação/edição/pausa/fechamento de vaga, geração/desativação de link do quiz,
  candidatura recebida, mudança de status de candidatura (**inclusive 'entrevistar', que é o
  evento de revelação de contato**), mudança de plano, solicitação de exclusão LGPD, evento de
  pagamento.
- **Insert só server-side** (trigger no banco ou Edge Function). Client nunca insere no log
  diretamente — log que o client escreve é log que o client forja ou omite.
- `ip` é capturado na Edge Function (o Postgres não vê o IP do client em chamada normal).
- RLS: ninguém edita nem apaga log. Insert only. Leitura restrita a admin — **pendência P15**;
  até lá, leitura só pelo dashboard do Supabase (nenhuma policy de SELECT no app).
- **Exclusão LGPD vs append-only:** exclusão de dados **anonimiza** o dado pessoal referenciado
  no log (actor/metadata limpos de identificação), preservando a trilha do evento. O log nunca
  perde linhas; perde identificação.
- Objetivo: pra qualquer pergunta "quem fez isso e quando", a resposta está no log.

## 7. Billing e contabilidade fiscal (dinheiro do B2B)

- **No MVP não circula dinheiro real.** O billing é a interface `BillingProvider` com a
  implementação mock (CLAUDE.md seção 2): marca `plano_status = 'ativa'` sem cobrança, não
  processa cartão e não guarda dado financeiro de ninguém. **Nenhum SDK, endpoint ou webhook de
  gateway existe no código do MVP.**
- O gate de uso vale igual com o mock: empresa só cria/ativa vaga com `plano_status = 'ativa'` e
  dentro do limite do tier. O resto do app não sabe (nem pode saber) qual provider está por baixo.
- **Quando o billing real entrar (Fase PAG — gateway a decidir, pendência P16),** a implementação
  real da interface obedece:
  1. chaves só em Edge Function + secrets (§2);
  2. **webhook do gateway é a fonte de verdade** do status financeiro, refletido em
     `empresas.plano_status`, com: **validação de assinatura**, **idempotência** (evento
     reentregue não aplica efeito duas vezes) e tolerância a **eventos fora de ordem**;
  3. `metadata` de cada cobrança guarda: valor, tier, período, id da transação, status;
  4. **NF-e de serviço** pra cada empresa cliente (automática ou manual — pendência P14);
  5. conciliação mensal: assinaturas ativas x cobranças recebidas x NF-e emitidas. Sem furo;
  6. todo evento de pagamento vai pro `audit_log`.
- Critério de aceite da Fase PAG: **nada muda fora de `lib/billing/` e das edge functions de
  billing.** Se mudar, o desacoplamento falhou.

## 8. Infra e continuidade

- Supabase de **produção**: tier **Pro no mínimo** (backups diários + point-in-time recovery).
  Dev pode ser local (supabase CLI) e staging pode ser free tier — o que não pode é testar em prod.
- Migrations versionadas em git. Banco nunca é alterado "na mão" em produção.
- Ambientes separados: dev, staging, produção.
- Antes de escalar de verdade: um pentest / revisão de segurança externa. Barato perto do custo
  de vazar dado de candidato.

## 9. Checklist de "pode publicar / pode mostrar pra investidor"

- [ ] RLS ativa e testada em toda tabela (teste empresa-A-invade-empresa-B passou)
- [ ] Contato bloqueado antes de `status = 'entrevistar'`, testado via API direta (não só na UI)
- [ ] Link público protegido: token ≥128 bits, insert só via Edge Function, rate limit ativo,
      nenhuma policy aberta pro `anon`
- [ ] `service_role` só em Edge Function (chaves de gateway idem, quando a Fase PAG existir)
- [ ] MFA ativo pra empresa, email verificado
- [ ] Consentimento LGPD versionado na candidatura + canal de exclusão do candidato sem conta
      funcionando (hard delete + anonimização do log)
- [ ] Prazo de retenção fixado (P10) e expurgo implementado
- [ ] Política de privacidade e termos publicados
- [ ] `audit_log` gravando os eventos críticos, insert só server-side
- [ ] Nenhum SDK/chave de gateway no MVP; billing só via `BillingProvider` mock
- [ ] (Fase PAG) Webhook do gateway com assinatura validada + idempotência
- [ ] (Fase PAG) NF-e da assinatura B2B resolvida
- [ ] Supabase Pro com PITR ligado em produção
- [ ] Pentest / revisão externa feita antes de escala
