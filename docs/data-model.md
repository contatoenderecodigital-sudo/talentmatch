# Data model — DeuVaga (MVP v2)

> Gerado na Fase 1. DDL final + policies nascem na Fase 3, a partir DESTE arquivo.
> Propostas novas desta fase estão marcadas [F1-x] e listadas em `docs/decisions.md`.

## 1. Tabelas

### profiles
1:1 com `auth.users`. Só empresa tem conta no MVP.

| Coluna | Tipo | Regras |
|---|---|---|
| id | uuid PK | = auth.users.id (FK, on delete cascade) |
| role | text | NOT NULL, CHECK IN ('empresa') — 'admin' entra se P15=sim |
| created_at / updated_at | timestamptz | default now() |

### empresas

| Coluna | Tipo | Regras |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| profile_id | uuid | NOT NULL, UNIQUE, FK profiles |
| nome | text | NOT NULL |
| cnpj | text | NOT NULL, UNIQUE, formato validado (14 dígitos) |
| cidade | text | NOT NULL |
| plano_tier | text | NULL até escolher; CHECK IN ('basico','intermediario','alto_volume') — nomes placeholder até P7 |
| plano_status | text | NOT NULL default 'inativa', CHECK IN ('ativa','inativa') |
| created_at / updated_at | timestamptz | |

`plano_tier`/`plano_status` só mudam pela RPC `selecionar_plano` (seção 3) — trigger bloqueia
UPDATE direto dessas colunas [F1-1].

### vagas

| Coluna | Tipo | Regras |
|---|---|---|
| id | uuid PK | |
| empresa_id | uuid | NOT NULL, FK empresas |
| titulo | text | NOT NULL |
| descricao | text | |
| modalidade | text | NOT NULL, CHECK IN ('remoto','presencial','hibrido') |
| escolaridade_min | text | NULL, CHECK IN ('fundamental','medio','tecnico','superior') |
| periodo | text | NOT NULL, CHECK IN ('integral','meio','flexivel') |
| cidade | text | NOT NULL |
| status | text | NOT NULL default 'aberta', CHECK IN ('aberta','pausada','fechada') |
| disc_target_d/i/s/c | int | NOT NULL, CHECK 0–100 (na prática ≤75 — ver disc-quiz.json §formula) |
| quiz_token | text | NOT NULL, UNIQUE, default encode(gen_random_bytes(16),'hex') → 32 hex = 128 bits |
| quiz_ativo | boolean | NOT NULL, mantido por trigger: true ⇔ status='aberta' |
| created_at / updated_at | timestamptz | |

Vaga não é deletada no MVP, só fechada [F1-2] (candidaturas referenciam ela; histórico/auditoria).

### candidatos
Sem conta no MVP. Telefone é a identidade.

| Coluna | Tipo | Regras |
|---|---|---|
| id | uuid PK | |
| profile_id | uuid | NULL (sempre null no MVP; Etapa 2 liga à conta) |
| nome | text | NOT NULL |
| telefone | text | NOT NULL, UNIQUE — normalizado: só dígitos, DDD+número, 10–11 dígitos |
| cidade | text | NOT NULL |
| idade | int | NULL, CHECK 14–99 |
| escolaridade | text | NULL, CHECK IN ('fundamental','medio','tecnico','superior') |
| created_at / updated_at | timestamptz | |

Sem email, CPF, foto, bio (SECURITY.md §5). Nova candidatura do mesmo telefone atualiza os dados
cadastrais pro envio mais recente [F1-4].

### candidaturas
Consentimento vive aqui (é dado por candidatura).

| Coluna | Tipo | Regras |
|---|---|---|
| id | uuid PK | |
| vaga_id | uuid | NOT NULL, FK vagas |
| candidato_id | uuid | NOT NULL, FK candidatos |
| respostas | jsonb | NOT NULL — array de {pergunta_id, opcao_id} |
| disc_d/i/s/c | int | NOT NULL, CHECK 0–100, calculados pela fórmula do disc-quiz.json |
| score | int | NOT NULL, CHECK 0–100, congelado no envio [F1-5] |
| status | text | NOT NULL default 'novo', CHECK IN ('novo','visto','descartado','entrevistar') |
| consent_versao | text | NOT NULL |
| consent_at | timestamptz | NOT NULL |
| consent_pool | boolean | NOT NULL default false — opt-in pro pool/Etapa 2 (P9=a) |
| created_at | timestamptz | |

UNIQUE (vaga_id, candidato_id). Índice (vaga_id, score DESC) pro deck.

### audit_log
Append-only. Insert só server-side (triggers e Edge Functions).

| Coluna | Tipo | Regras |
|---|---|---|
| id | bigint PK | identity |
| actor_profile_id | uuid | NULL (evento de candidato anônimo/sistema) |
| action | text | NOT NULL — ex: 'login','vaga_criada','vaga_status','link_gerado','candidatura_recebida','candidatura_status','contato_revelado','plano_alterado','lgpd_pedido','pagamento' |
| entity_type / entity_id | text / uuid | |
| metadata | jsonb | sem dado pessoal além do necessário; anonimizável (SECURITY.md §6) |
| ip | inet | NULL — capturado só em Edge Function |
| created_at | timestamptz | |

### lgpd_pedidos — [F1-6, proposta nova]
Canal LGPD do candidato sem conta (SECURITY.md §5 manda detalhar na Fase 1).

| Coluna | Tipo | Regras |
|---|---|---|
| id | uuid PK | |
| telefone | text | NOT NULL (o titular informa; a EF confere se existe candidato) |
| tipo | text | CHECK IN ('exclusao','exportacao') |
| status | text | default 'recebido', CHECK IN ('recebido','concluido') |
| created_at / concluido_at | timestamptz | |

Insert via Edge Function; leitura/processamento só pelo dono (dashboard) no MVP.

## 2. Matriz de RLS

Atores: **empresa** (autenticada, `auth.uid()`), **anon** (candidato sem conta), **EF** (Edge
Function com service_role — ignora RLS). "—" = negado.

| Tabela | SELECT empresa | INSERT empresa | UPDATE empresa | anon (tudo) | EF |
|---|---|---|---|---|---|
| profiles | própria linha | própria (signup) | própria linha | — | ✓ |
| empresas | própria | própria (onboarding) | própria, EXCETO plano_* (trigger) | — | ✓ |
| vagas | próprias | próprias | próprias (sem delete) | — | ✓ |
| candidatos | **—** (nunca direto; só via RPCs) | — | — | — | ✓ |
| candidaturas | linhas das próprias vagas | — | só coluna `status`, das próprias vagas (trigger restringe colunas e transições) | — | ✓ |
| audit_log | — (leitura: dashboard/admin P15) | — | — (append-only) | — | ✓ |
| lgpd_pedidos | — | — | — | — | ✓ |

Ponto-chave: **`telefone` fica em `candidatos`, tabela que a empresa não lê.** O select direto de
`candidaturas` (permitido por linha) nunca expõe contato — nome/cidade/telefone estão na tabela
bloqueada. O card chega via RPC; o contato, só via `revelar_contato`.

## 3. Funções e RPCs (SECURITY DEFINER, exceto onde dito)

- **`match_score(d,i,s,c, dt,it,st,ct) → int`** — função pura (IMMUTABLE), fórmula do CLAUDE.md
  §4. Fixtures compartilhadas com `lib/matching.ts` (mesmos vetores → mesmo score).
- **`get_vaga_publica(token) → setof vaga_publica`** — dados públicos da vaga (título, empresa,
  cidade, modalidade, período) pelo `quiz_token`, só com `quiz_ativo`. Única função com EXECUTE
  pro role `anon` (a página do quiz precisa dela antes do envio).
- **`get_deck(vaga_id) → setof card`** — valida que a vaga é da empresa logada; retorna
  candidatura_id, nome, cidade, idade, escolaridade, disc_d/i/s/c, score, status, created_at,
  ordenado por score DESC. **Sem telefone.** Leitura simples é montada no app (disc-leituras.md).
- **`revelar_contato(candidatura_id) → (nome, telefone)`** — valida dona da vaga +
  `status='entrevistar'`; grava 'contato_revelado' no audit_log; retorna o contato.
- **`atualizar_status(candidatura_id, novo_status)`** — valida dona + transição permitida
  (RN-07); marca 'entrevistar' também audita. (Alternativa: UPDATE direto + trigger — decidir na
  Fase 3 pelo mais simples que passe no teste de invasão.)
- **`selecionar_plano(tier)`** — atualiza plano_tier/plano_status da própria empresa + audit.
  Único caminho de escrita do plano; é o que o `MockBillingProvider` chama [F1-1].

## 4. Edge Functions

- **`submit-quiz`** (anon chama; roda com service_role):
  1. valida `quiz_token` + `quiz_ativo`;
  2. rate limit por IP: máx. 5 envios/hora (consulta audit_log por ip+action) [F1-3];
  3. valida payload (zod): nome, telefone normalizado, cidade, 12 respostas com ids válidos,
     consentimento aceito;
  4. dedup: telefone+vaga já existe → 409 com mensagem amigável (P5);
  5. calcula DISC (fórmula do disc-quiz.json) e score (`match_score`);
  6. upsert candidato (por telefone) + insert candidatura + audit ('candidatura_recebida', com ip).
- **`lgpd-request`**: registra pedido em `lgpd_pedidos` + audit ('lgpd_pedido').

## 5. Testes de invasão (gate de fase — SECURITY.md §1)

1. Empresa A lê vaga/candidatura da empresa B via API direta → negado.
2. Empresa dona lê `telefone` de candidatura com status ≠ 'entrevistar' (select direto em
   candidatos, select em candidaturas, e via RPC) → negado nos três.
3. `anon` tenta INSERT/SELECT em candidatos/candidaturas → negado.
4. Empresa tenta UPDATE de `plano_tier` direto → bloqueado pelo trigger.
5. Qualquer um tenta UPDATE/DELETE em audit_log → negado.
