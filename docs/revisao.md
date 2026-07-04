# Revisão técnica da especificação — antes de qualquer código

> Escopo auditado: `CONCEITO-v2.md`, `CLAUDE.md`, `SECURITY.md` (a tríade declarada como spec completa).
> `PROMPTS-claude-code.md` foi lido só como material downstream e aparece apenas em Riscos (R8).
> Data: 2026-07-04. Nenhum arquivo foi editado; a seção 5 só propõe.

**Diagnóstico em uma frase:** o CONCEITO-v2 redefiniu o produto (ferramenta de triagem, quiz por
link público, candidato sem conta), mas o CLAUDE.md e o SECURITY.md ainda especificam o produto
antigo (marketplace bilateral com match mútuo). Quase tudo de crítico abaixo deriva desse
descompasso.

---

## 1. LACUNAS

### L1 [crítico] — Mecânica do link público do quiz não existe em lugar nenhum
Onde aparece: CONCEITO-v2 §4 (passo 2) e §9 ("gera um link/QR público do quiz — essa é a função
central do MVP"). O que falta: formato do token (adivinhável ou não), 1 link por vaga ou vários,
expiração (o link morre quando a vaga fecha/pausa?), o que a mesma pessoa respondendo duas vezes
faz (dedup por quê — telefone? email?), e proteção anti-abuso (o link é público na internet; nada
impede flood de respostas falsas). O CLAUDE.md §3 não tem nenhuma tabela pra isso (nem token na
`vagas`, nem tabela de candidaturas/respostas).

### L2 [crítico] — Modelo de dados não comporta candidato sem conta
Onde aparece: CLAUDE.md §3 define `candidatos.profile_id` 1:1 com `auth.users`; CONCEITO-v2 §4 e §9
dizem que o candidato responde "sem criar conta pesada". O que falta: `profile_id` vira nullable?
Existe uma tabela `candidaturas` ligando candidato ↔ vaga (hoje não existe nenhuma relação
candidato–vaga fora de `swipes`/`matches`, que são do modelo antigo)? Onde ficam as respostas
brutas do quiz e a versão/data do consentimento LGPD de quem não tem login?

### L3 [crítico] — "Dados mínimos" do candidato não estão listados
Onde aparece: CONCEITO-v2 §4 passo 3 ("só o consentimento LGPD e os dados mínimos"). O que falta: a
lista. Nome? WhatsApp? Email? Idade? Escolaridade? Cidade? O CLAUDE.md §3 inclui `bio` e `foto_url`
— cabem num quiz de 3–4 minutos sem conta? Sem essa lista não dá pra desenhar a tela, a tabela nem
o texto de consentimento (minimização do SECURITY.md §5 exige saber o que se coleta e por quê).

### L4 [crítico] — Conteúdo do quiz DISC e alvos por cargo não existem
Onde aparece: CLAUDE.md §4 ("~12 perguntas, cada uma soma pesos nos eixos") e CONCEITO-v2 §10
("montar a tabela de perfil ideal por função"). O que falta: as perguntas, os pesos, a fórmula
exata de normalização (incluindo borda: eixo com soma zero) e a tabela de alvos DISC sugeridos por
cargo — que é insumo direto da criação de vaga (CONCEITO-v2 §4 passo 1). A Fase 1 promete gerar o
quiz a partir do PDF do pitch, que é do produto antigo (ver C5).

### L5 [crítico] — Nenhuma regra substituta pra revelação de contato no MVP
Onde aparece: SECURITY.md §1 e CLAUDE.md §3 dizem "contato só após `is_match = true`". No fluxo v2
o candidato não dá like, então `is_match` nunca vira true — e a empresa precisa do telefone pra
chamar pra entrevista (CONCEITO-v2 §4 passo 5). A regra antiga quebra o produto e nenhuma nova foi
escrita. Ver C2 e P2.

### L6 [importante] — Estados do funil e semântica do swipe no modo ferramenta
Onde aparece: CONCEITO-v2 §4 passo 5 ("o swipe entra aqui, só como jeito rápido de revisar e
descartar"). O que falta: o que o like da empresa significa (mover pra "entrevistar"?), quais
estados o candidato tem na vaga (novo / visto / descartado / entrevistar / contratado?) e se
descarte é reversível. Isso define a tabela e a tela do deck.

### L7 [importante] — Filtro duro referencia dados que o schema não tem
Onde aparece: CLAUDE.md §4 estágio 1 exige `modalidade` e `periodo` compatíveis do candidato, mas a
tabela `candidatos` (§3) não tem campo de preferência de modalidade nem de período. `escolaridade
>= escolaridade_min` pressupõe uma escala ordenada que não está definida (fundamental < médio <
técnico < superior?). "Cidade compatível" não diz como compara (string livre digitada? lista
canônica tipo IBGE?).

### L8 [importante] — Planos sem números, e com duas versões de unidade
Onde aparece: CONCEITO-v2 §7 (faixas por "vagas ativas / candidatos analisados", a validar) — e o
material antigo usava faixa por número de vagas (0–3, 4–10, +10). O que falta pra Fase 5, mesmo em
mock: nomes dos tiers, limites de cada um, o que acontece ao estourar o limite (bloqueia criação de
vaga? bloqueia novas análises?) e onde o limite é imposto (RLS, Edge Function ou só front — front
sozinho viola o espírito do SECURITY.md).

### L9 [importante] — LGPD do candidato sem login: exclusão e portabilidade sem canal
Onde aparece: SECURITY.md §5 (botão "excluir minha conta", exportar JSON). O candidato do MVP não
tem conta nem login — por onde ele exerce exclusão/portabilidade? (Link mágico por email/WhatsApp?
Canal de atendimento com verificação de titularidade?) E o prazo de retenção/expurgo é citado como
"definido", mas nenhum prazo foi definido.

### L10 [importante] — audit_log: quem é admin, quem insere, de onde vem o IP
Onde aparece: SECURITY.md §6. "Leitura restrita a admin", mas `profiles.role` (CLAUDE.md §3) só tem
'empresa' e 'candidato' — não existe admin no modelo. Insert feito pelo client pode ser forjado ou
omitido; pra ser auditoria de verdade precisa nascer de trigger no banco ou de Edge Function. E o
`ip` não chega ao Postgres numa chamada normal do client — precisa ser capturado em Edge Function.

### L11 [importante] — Comportamento de inadimplência e meios de pagamento
Onde aparece: SECURITY.md §7 e CLAUDE.md Fase 8. O que falta: quando `plano_status` ≠ ativa, a
empresa perde o quê (acesso total? só criar vaga? há carência?); meios aceitos (cartão só, ou
boleto/pix — relevante pro perfil de comerciante do interior); e política de retry/dunning de
cobrança falhada.

### L12 [nice-to-have] — Multiusuário por empresa
O modelo assume 1 profile = 1 empresa. Dono + gerente da loja usando a mesma conta compartilham
senha (ruim com MFA obrigatório). Vale registrar como decisão futura, não precisa travar o MVP.

### L13 [nice-to-have] — "Leitura em linguagem simples" sem fonte
CONCEITO-v2 §4 passo 4 ("comunicativo, bom pra atendimento"). Falta o mapeamento perfil DISC →
frases. É determinístico e pequeno, mas alguém tem que escrever a tabela de textos.

### L14 [nice-to-have] — Ambientes e CI não detalhados
SECURITY.md §8 pede dev/staging/prod — são 3 projetos Supabase? Staging paga Pro também? CLAUDE.md
Fase 0 pede "CI mínimo" sem dizer o que roda (lint + typecheck + testes?).

---

## 2. AMBIGUIDADES E CONTRADIÇÕES

### C1 [crítico] — CLAUDE.md ainda especifica o produto antigo, e se declara fonte de verdade
Trechos: CLAUDE.md §1 ("Candidato (grátis): monta perfil... dá swipe em vagas. Match: quando os
dois lados dão swipe pra direita... abre contato"), §3 (swipes bidirecionais, `candidato_liked`),
§6 (Fase 4 com onboarding de candidato logado, Fase 6 com deck pros dois papéis, Fase 7 com
revelação pós-match) — contra CONCEITO-v2 §2 e §9, que removem tudo isso do MVP. O agravante: o
cabeçalho do CLAUDE.md diz "este arquivo é a fonte de verdade", o SECURITY.md diz ter "a mesma
autoridade", e o CONCEITO-v2 diz que "substitui o enquadramento" — mas nenhum define quem prevalece
no conflito. Qualquer sessão futura que obedeça "leia o CLAUDE.md inteiro antes de começar"
constrói o marketplace antigo.

### C2 [crítico] — Regra de contato do SECURITY.md inviabiliza o fluxo do CONCEITO-v2
Trechos: SECURITY.md §1 ("Dado de contato... só é lido após `matches.is_match = true`") vs
CONCEITO-v2 §4 passo 5 ("Empresa entrevista e contrata os mais alinhados"). Sem like do candidato
não há match; sem match não há telefone; sem telefone não há entrevista. Uma das duas regras tem
que ceder — e é decisão de produto (P2), não de implementação.

### C3 [crítico] — Hard delete LGPD vs audit_log append-only
Trechos: SECURITY.md §5 ("apaga de verdade (hard delete)") vs §6 ("ninguém edita nem apaga log").
Se o log guarda `actor_profile_id` e `metadata` com dado pessoal, ou a exclusão viola o
append-only, ou o append-only viola o direito de exclusão. Falta a estratégia padrão (anonimizar o
dado pessoal dentro do log preservando a trilha do evento) escrita na spec.

### C4 [importante] — Pool do marketplace vs minimização, retenção e escopo do consentimento
Trechos: CONCEITO-v2 §6 ("de graça, o teu lado candidato vai enchendo: todo candidato que responde
fica no sistema") vs SECURITY.md §5 (minimização + expurgo de candidato inativo). O candidato
consente em responder pra UMA vaga de UMA empresa; usá-lo depois como pool buscável por OUTRAS
empresas (Etapa 2) é outra finalidade e exige que o termo de consentimento já preveja isso — ou
haverá re-consentimento em massa antes de ligar o marketplace. Os docs não tocam no escopo do
consentimento.

### C5 [importante] — Fase 1 gera a spec a partir do PDF errado
Trechos: CLAUDE.md §6 Fase 1 ("ler o PDF do pitch e gerar docs/PRD.md...") vs CONCEITO-v2
cabeçalho ("nada do material do campeonato é reaproveitado") e §7 ("refazer esse slide"). Seguir a
Fase 1 como está reintroduz o marketplace e os números que o próprio CONCEITO-v2 manda descartar. A
fonte da Fase 1 deveria ser o CONCEITO-v2.md.

### C6 [importante] — Filtro duro vs deck de quem já respondeu
Trechos: CLAUDE.md §4 estágio 1 ("elimina") vs CONCEITO-v2 §9 ("o deck da empresa mostra os
candidatos que responderam ao link daquela vaga"). Se o candidato respondeu à vaga
especificamente, o filtro ainda o elimina do deck (ex.: escolaridade abaixo do mínimo) ou ele
aparece com um alerta? As duas leituras são defensáveis; a escolha muda a RPC e a UI (P6).

### C7 [nice-to-have] — Nome "TalentMatch" ainda estampado nos docs
CONCEITO-v2 manda evitar "Match" (marca do Match Group) e diz que nome/logo/código são novos, mas
CLAUDE.md e SECURITY.md se intitulam "TalentMatch". Como placeholder interno passa; só não pode
vazar pra repo público, bundle id (Fase 0/9) nem material de cliente.

### C8 [nice-to-have] — Unique de swipes subespecificado
CLAUDE.md §3: "Unique (actor, target)" — o correto com o schema dado é (actor_profile_id,
target_type, target_id); como está escrito, dá pra implementar errado.

---

## 3. RISCOS DE EXECUÇÃO

### R1 [crítico] — A ordem das fases 4 e 5 inverteu no v2 e o roadmap não foi renumerado
No CONCEITO-v2, o quiz por link (atual Fase 4) só existe depois que a empresa criou a vaga e gerou
o link (atual Fase 5). Manter a numeração do CLAUDE.md faz a Fase 4 não ter como ser testada
(quiz de qual vaga?). O roadmap precisa ser reescrito antes da primeira sessão de build.

### R2 [crítico] — RLS pressupõe usuário autenticado; o candidato do MVP é anônimo
Todo o modelo de policy do SECURITY.md gira em torno de `auth.uid()`. O quiz por link público
implica insert sem login. Policy de insert aberta pra `anon` num link público é convite a flood e
poluição do funil (e do pool futuro). O caminho seguro é o insert passar por Edge Function que
valida o token do link, aplica rate limit e só então grava — isso precisa estar na spec, senão a
primeira implementação vai de policy aberta.

### R3 [importante] — "Esconder contato é policy no banco" — mas RLS do Postgres é por linha, não por coluna
SECURITY.md §1 exige que campos de contato fiquem invisíveis "no banco, nunca no front". RLS pura
não esconde coluna. O mecanismo real é view de card sem colunas de contato, RPC que seleciona só os
campos do card (a `get_deck` da Fase 6 já aponta pra isso) ou column privileges. Se a spec não
nomear o mecanismo, o teste "A invade B" passa por linha e vaza por coluna.

### R4 [importante] — `matches.is_match` como "bool gerado" não funciona como está
Coluna gerada no Postgres não pode ler outra tabela; o estado vem de `swipes`. A sincronização
exige trigger ou RPC transacional. Detalhe pequeno, mas é exatamente o tipo de coisa que cada
sessão resolve de um jeito diferente se a spec não fixar. (Vale notar: no MVP v2, `matches`
bilateral talvez nem exista — depende de P2.)

### R5 [importante] — Espelho TS ↔ SQL do score vai divergir sem fixtures compartilhadas
CLAUDE.md §5 mantém `lib/matching.ts` como espelho da função SQL. Sem um conjunto único de casos de
teste rodando contra os dois (mesmos vetores → mesmo score), os dois divergem no primeiro ajuste. A
regra de teste da seção 7 deveria exigir fixtures compartilhadas explicitamente.

### R6 [importante] — MFA obrigatório pra empresa vs perfil do cliente
SECURITY.md §3 exige MFA pra conta de empresa. O comprador é dono de comércio pouco técnico,
convertido em venda presencial/WhatsApp (CONCEITO-v2 §8). MFA obrigatório no primeiro acesso é
fricção real de onboarding, e enforcement por role no Supabase dá trabalho. Risco: ou trava venda,
ou o dev "deixa pra depois" silenciosamente. Melhor decidir de caso pensado (P8).

### R7 [importante] — Projeto dentro do OneDrive, com acento e espaço no caminho, e sem git
A pasta atual é `OneDrive\Área de Trabalho\talent match` e não é repositório git. OneDrive
sincronizando `.git` e `node_modules` no Windows causa corrupção e lentidão conhecidas, e
caminho com acento/espaço quebra tooling de React Native/Android com frequência. A Fase 0 deve
criar o repo fora do OneDrive (ex.: `C:\dev\<nome>`), sem acento no caminho.

### R8 [importante] — PROMPTS-claude-code.md inteiro ainda constrói o produto antigo
Fora da tríade auditada, mas é o script de execução: Fase 2 tem "Sou candidato", Fase 4 tem
onboarding de candidato com conta e foto, Fase 6 tem swipe dos dois papéis com match mútuo, Fase 7
revela contato pós-match, Fase 9 trata "app de marketplace vazio" no review da loja. Se for usado
como está depois da atualização dos .md, desfaz a v2 fase por fase. Precisa ser reescrito junto.

### R9 [importante] — Webhook Pagar.me sem idempotência e validação de assinatura na spec
SECURITY.md §7 o declara "fonte de verdade do status financeiro", mas não exige validação de
assinatura do webhook, tratamento de reentrega (idempotência) nem ordenação de eventos. São os três
bugs clássicos de billing. É Fase 8, mas deve constar na spec desde já pra não nascer errado.

### R10 [nice-to-have] — Lojas talvez nem entrem no MVP
No v2 o candidato usa o navegador; a empresa também poderia (web-first), deixando App Store/Play
(custo, review, US$99/ano) pra quando houver tração. Se essa for a decisão (P11), a Fase 0 muda
(EAS deixa de ser prioridade) e a Fase 9 encolhe.

### R11 [nice-to-have] — Custo de 3 ambientes Supabase Pro
dev/staging/prod com Pro em todos = 3 mensalidades. Comum: prod Pro, staging free, dev local
(supabase CLI). Vale explicitar pra não virar surpresa de custo.

---

## 4. PERGUNTAS PRA VOCÊ

Ordenadas por urgência. As quatro primeiras bloqueiam tudo.

**P1 [crítico] Autoridade dos docs.** Autorizo reescrever CLAUDE.md (e os pontos afetados do
SECURITY.md) pra refletir o CONCEITO-v2 antes de qualquer fase?
(a) Sim, v2 manda, reescreve os dois. **(recomendado)**
(b) Não, o marketplace do CLAUDE.md ainda vale (aí o CONCEITO-v2 é que precisa mudar).

**P2 [crítico] Quando a empresa vê o contato do candidato no MVP?**
(a) Assim que ele responde o quiz — ele veio do funil da própria empresa.
(b) Só depois que a empresa marca "quero entrevistar" (like) — contato fica oculto no deck de
triagem. **(recomendado: mantém o espírito do SECURITY.md sem quebrar o fluxo)**
(c) Manter match mútuo (não recomendado: candidato não tem conta pra dar like).

**P3 [crítico] Dados mínimos do candidato no quiz.** Confirma a lista? Proposta: nome, WhatsApp,
cidade, idade, escolaridade + consentimento. Email: sim/não? Foto: sim/não? (foto alonga o quiz e
puxa Storage/URL assinada pra dentro do MVP).

**P4 [crítico] Fonte da Fase 1.** O PRD nasce do CONCEITO-v2.md, e o PDF do pitch vira só
referência histórica?
(a) Sim, CONCEITO-v2 é a fonte. **(recomendado)**
(b) Não, usar o PDF.

**P5 [importante] Candidato repetido.** A mesma pessoa (mesmo telefone) pode responder pra duas
vagas? E refazer o quiz da mesma vaga (sobrescreve ou bloqueia)?

**P6 [importante] Filtro duro no MVP.** Candidato que respondeu mas não cumpre requisito objetivo
(ex.: escolaridade abaixo do mínimo):
(a) Some do deck (filtro elimina).
(b) Aparece com alerta visual, empresa decide. **(recomendado: a empresa conhece o próprio funil)**

**P7 [importante] Tiers do plano mock (Fase 5).** Me dá os números de partida (mesmo provisórios)?
Ex.: Básico = 1 vaga ativa / 30 análises-mês; Intermediário = 3 vagas / 100; Alto volume =
ilimitado. Ou prefere placeholders nomeados até validar com os donos?

**P8 [importante] MFA da empresa.** Obrigatório desde o primeiro cliente, ou opcional no MVP
(vira obrigatório na escala)? Impacta onboarding de venda presencial.

**P9 [importante] Escopo do consentimento LGPD.** O termo do candidato já prevê que o perfil
pode ser exibido a outras empresas quando o marketplace ligar (Etapa 2), ou consentimento restrito
à vaga (e re-consentimento em massa depois)? Precisa estar decidido antes do primeiro candidato
real responder.

**P10 [importante] Prazo de retenção.** Expurgo de candidato inativo em 6, 12 ou 24 meses?

**P11 [importante] Alvo do MVP.**
(a) Web-first: empresa e candidato no navegador; lojas depois. **(recomendado pro tempo-até-venda)**
(b) App nas lojas desde já, como o CLAUDE.md assume.

**P12 [nice-to-have] UI.** nativewind ou tamagui? (Se não tiver preferência, sugiro nativewind:
mais simples, mais material de referência, menos lock-in.)

**P13 [nice-to-have] Nome provisório.** Qual placeholder usar em repo/bundle enquanto o nome
definitivo não sai do INPI? (Não pode ser TalentMatch.)

**P14 [nice-to-have] NF-e.** Emissão automática (qual emissor — eNotas, Focus NFe?) ou processo
manual controlado nos primeiros clientes? Pode ficar pra Fase 8, só não pode ficar sem dono.

**P15 [nice-to-have] Admin.** Criar role 'admin' em `profiles` pra ler o audit_log, ou por
enquanto a leitura é só via dashboard do Supabase?

---

## 5. SUGESTÕES DE MELHORIA NOS .MD

Nenhuma aplicada — todas aguardam seu OK. As de CLAUDE.md §1/§6 dependem das respostas de P1–P4;
o texto proposto já assume as recomendações (P1a, P2b, P4a, P6b) e ajusto conforme sua resposta.

### S1 [crítico] — CLAUDE.md §1: reescrever a definição do produto
Trecho atual: todo o §1 ("App de recrutamento estilo swipe... Match: quando os dois lados dão
swipe pra direita na mesma vaga/candidato, abre contato.").
Texto novo proposto:

> App B2B de triagem comportamental pra contratação em cargos de alta rotatividade
> (ver CONCEITO-v2.md, que prevalece sobre este arquivo em caso de conflito).
>
> - **Empresa** (cliente pagante): cria vaga com alvo DISC, gera link/QR público do quiz e o
>   distribui pros candidatos que ela mesma atraiu.
> - **Candidato** (sem conta no MVP): abre o link no navegador, dá consentimento LGPD e responde
>   o quiz DISC em 3–4 minutos.
> - **Deck**: a empresa vê os candidatos daquela vaga ranqueados por % de fit DISC, com leitura em
>   linguagem simples, e usa swipe só pra revisar/descartar dentro da própria lista.
> - **Match mútuo, deck de vagas pro candidato e busca no pool são pós-MVP** (CONCEITO-v2 §6,
>   Etapa 2).
>
> O score é um algoritmo determinístico (seção 4). Não é ML. LLM só no roadmap, nunca no MVP.

### S2 [crítico] — CLAUDE.md §3: adequar o schema ao candidato sem conta e ao funil por vaga
Trecho atual: definições de `candidatos`, `swipes`, `matches` e as "Regras de RLS obrigatórias".
Mudanças propostas (o DDL exato sai na Fase de schema; aqui é o contrato):
- `candidatos.profile_id` vira **nullable** ("candidato pode existir sem conta; conta chega na
  Etapa 2"), + `telefone` (chave de dedup, ver P5) e `consent_versao`/`consent_at`.
- Nova tabela **`candidaturas`** — `id`, `vaga_id`, `candidato_id`, `respostas` (jsonb),
  `disc_d/i/s/c` calculados, `score` (fit com a vaga), `status`
  ('novo'|'visto'|'descartado'|'entrevistar'), `created_at`. Unique (vaga_id, candidato_id).
- Nova coluna em `vagas`: `quiz_token` (não adivinhável, único) + `quiz_ativo` (bool) — o link
  público é `/q/{quiz_token}` e morre quando a vaga fecha.
- `swipes`/`matches` bilaterais: **marcar como pós-MVP** (ou remover e reintroduzir na Etapa 2);
  no MVP o gesto de swipe só atualiza `candidaturas.status`.
- Regra de contato substituída (ver S4).

### S3 [crítico] — CLAUDE.md §6: renumerar o roadmap conforme o CONCEITO-v2 §9
Trecho atual: Fases 4–7. Texto novo proposto:

> - **Fase 4** — Empresa: onboarding, criar vaga com alvo DISC (com sugestão por tipo de cargo),
>   gerar link/QR público do quiz, plano mock.
> - **Fase 5** — Candidato: página pública do quiz via link (consentimento LGPD versionado +
>   dados mínimos + quiz DISC), sem conta e sem app.
> - **Fase 6** — Deck da empresa: candidatos daquela vaga ordenados por score (RPC), leitura em
>   linguagem simples, swipe pra revisar/descartar (atualiza status da candidatura).
> - **Fase 7** — Contato e funil: revelação de contato conforme regra da seção 3, lista de
>   "entrevistar", exportação simples.
> - **Fases 8–9** — inalteradas (billing Pagar.me; polish e publicação).
> - **Pós-MVP (Etapa 2 do CONCEITO-v2)**: conta de candidato, deck de vagas, match mútuo, busca
>   no pool.

### S4 [crítico] — SECURITY.md §1: substituir a regra de contato e nomear o mecanismo
Trecho atual: "Dado de contato (nome real, CPF, telefone, email, foto) **só** é lido após
`matches.is_match = true`. (...) Isso é policy no banco, nunca 'esconder no front'."
Texto novo proposto (assumindo P2b):

> - Dado de contato do candidato (telefone, email) **não aparece no deck de triagem**. Ele só é
>   lido pela empresa dona da vaga depois que ela marca o candidato como "entrevistar".
> - Isso é imposto **no banco**: o deck vem de uma RPC/view que seleciona apenas os campos do
>   card (RLS sozinha não esconde coluna — o mecanismo é view/RPC com colunas restritas, e o
>   acesso ao contato é uma RPC própria que valida o status da candidatura).

### S5 [crítico] — SECURITY.md: nova subseção "Link público do quiz"
Inserir após a seção 3 (Autenticação):

> ## 3b. Link público do quiz (superfície anônima)
> - Token do link não adivinhável (>= 128 bits), um por vaga; link morre quando a vaga
>   pausa/fecha.
> - O candidato anônimo **não** insere direto no banco: a resposta entra por Edge Function que
>   valida o token, aplica rate limit por IP e deduplica por telefone antes de gravar.
> - Nenhuma policy de INSERT aberta pro role `anon` nas tabelas de candidato/candidatura.
> - Resposta incompleta não cria registro (sem lixo no funil).

### S6 [importante] — SECURITY.md §5 e §6: resolver exclusão vs log e fixar retenção
Trecho atual: §5 "apaga de verdade (hard delete...)" e §6 "ninguém edita nem apaga log".
Texto novo proposto (adição ao §6):

> - Exclusão de conta/dados **anonimiza** o dado pessoal referenciado no log (actor vira id
>   anônimo, metadata é limpo de dado pessoal), preservando a trilha do evento. O log nunca perde
>   linhas; perde identificação.

E no §5, trocar "prazo de expurgo definido" por um prazo concreto (aguarda P10), ex.: "candidatura
sem interação há 12 meses é expurgada (dados pessoais apagados, métricas agregadas podem ficar)".

### S7 [importante] — SECURITY.md §5: escopo do consentimento
Adicionar ao bullet de consentimento (aguarda P9):

> - O termo diz explicitamente **pra que** o dado é usado: análise de fit pra vaga X da empresa Y.
>   Se o roadmap de marketplace (CONCEITO-v2 §6, Etapa 2) exigir exibir o perfil a outras
>   empresas, isso é finalidade nova: ou o termo do MVP já a prevê como opt-in separado, ou haverá
>   re-consentimento antes de ligar a Etapa 2.

### S8 [importante] — CLAUDE.md §4: filtro duro coerente com o funil v2 e escalas definidas
Trecho atual: "Estágio 1 — Filtro duro (elimina)". Mudanças propostas: (a) declarar o
comportamento escolhido em P6 (eliminar vs alertar); (b) definir a escala ordenada de
`escolaridade` (ex.: fundamental=1, medio=2, tecnico=3, superior=4); (c) ou adicionar os campos de
preferência de modalidade/período do candidato ao schema, ou remover esses critérios do filtro do
MVP (no fluxo por link, o candidato já se candidatou àquela vaga específica); (d) exigir fixtures
de teste compartilhadas entre a função SQL e `lib/matching.ts` (mesmos vetores → mesmo score).

### S9 [importante] — CLAUDE.md §6 Fase 1: trocar a fonte da spec
Trecho atual: "**Fase 1** — Spec: ler o PDF do pitch e gerar docs/PRD.md...".
Texto novo: "**Fase 1** — Spec: ler o **CONCEITO-v2.md** (o PDF do pitch antigo é só referência
histórica; em conflito, o CONCEITO-v2 manda) e gerar docs/PRD.md + docs/data-model.md +
docs/disc-quiz.json. Sem código de app ainda. Eu reviso."

### S10 [importante] — CONCEITO-v2.md §9: declarar precedência até a reescrita
Adicionar ao fim do §9:

> Enquanto o CLAUDE.md não for atualizado com estes ajustes, **este arquivo prevalece** em
> qualquer conflito entre os dois.

(Vira redundante — e pode ser removido — depois que S1/S2/S3 forem aplicadas.)

### S11 [nice-to-have] — CLAUDE.md §3: correções pontuais
- Unique de `swipes`: "(actor_profile_id, target_type, target_id)" no lugar de "(actor, target)".
- `profiles.role`: adicionar 'admin' se P15 = sim.
- `matches.is_match`: trocar "bool gerado" por "mantido por trigger/RPC transacional a partir dos
  likes" (coluna gerada não lê outra tabela) — se `matches` continuar existindo no MVP.

### S12 [nice-to-have] — PROMPTS-claude-code.md: reescrever depois da tríade
Fora do escopo da tríade, mas necessário: todas as fases 2, 4, 6, 7 e 9 referenciam o fluxo
antigo (escolha de papel "Sou candidato", onboarding de candidato com conta, swipe bilateral,
revelação pós-match, seed pra "marketplace vazio" no review). Reescrever espelhando o roadmap novo
(S3) assim que CLAUDE.md for atualizado, pra nenhuma sessão futura receber instrução do produto
antigo.

---

## Veredito

**Não está pronta pra build: a Fase 0 (setup puro) até rodaria, mas seria setup do produto errado —
existem 8 itens [crítico] (C1, C2, C3, L1–L5, R1/R2) que exigem suas respostas a P1–P4 e a
reescrita do CLAUDE.md/SECURITY.md antes de qualquer fase, inclusive a 0.**
