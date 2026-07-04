# Prompts pro Claude Code — TalentMatch MVP v2 (triagem comportamental)

> "TalentMatch" é o nome provisório oficial (usar em app, bundle id e repo).
> Revisar antes da Fase 8 — risco de marca com "Match", ver docs/decisoes-ui.md.

Como usar:
1. Cria o repo **fora do OneDrive, caminho sem acento/espaço** (ex: `C:\dev\<nome>`), abre no
   VSCode, roda o Claude Code (modelo Fable 5).
2. Coloca na raiz: `CONCEITO-v2.md`, `CLAUDE.md`, `SECURITY.md` (e `docs/revisao.md`, que carrega
   as pendências P5–P15).
3. Vai colando os prompts abaixo **um por fase**. Só avança quando revisar a saída.

Regra de ouro: no começo de cada sessão nova, mande
**"Leia CONCEITO-v2.md, CLAUDE.md e SECURITY.md inteiros antes de começar. Em conflito, o
CONCEITO-v2 manda."**

Lembrete das regras 7 e 9 do CLAUDE.md: lacuna de UI ele resolve sozinho e registra em
`docs/decisoes-ui.md`; lacuna de segurança/RLS/dados/billing/regra de negócio ele para e pergunta.

---

## FASE 0 — Setup

```
Leia CONCEITO-v2.md, CLAUDE.md e SECURITY.md. Objetivo desta sessão: bootstrap do projeto (Fase 0), nada além disso.

Faça:
1. Confirme que estamos FORA do OneDrive e sem acento/espaço no caminho. Se não, pare e me avise.
2. ANTES de qualquer commit: rode e me mostre `git config user.name`, `git config user.email` e
   `git remote -v` (se houver remote). Me diga qual conta/identidade está ativa nesta pasta e se
   existe credencial global que possa vazar pra este projeto. NÃO faça nenhum commit nem configure
   remote até eu confirmar que a conta está certa. Se a identidade não for a que eu quero, me diga
   o comando pra setar user.name e user.email SÓ neste repositório (git config local, sem --global).
3. Inicialize um app Expo com TypeScript strict e expo-router.
4. Instale e configure: @supabase/supabase-js, @tanstack/react-query, react-hook-form, zod.
5. Crie lib/supabase.ts lendo URL e anon key de variáveis de ambiente (.env, nunca hardcoded, .env no .gitignore).
6. Estruture as pastas exatamente como na seção 5 do CLAUDE.md (pastas vazias com .gitkeep).
7. Configure CI mínimo: lint + typecheck + testes.
8. Crie um README curto com como rodar (web primeiro; iOS/Android sim conforme pendência P11).

EAS/eas.json só se a pendência P11 já tiver sido decidida a favor de lojas; senão, pule.
Antes de executar, me mostre o plano: comandos que vai rodar e arquivos que vai criar. Espere meu OK.
```

---

## FASE 1 — Spec a partir do CONCEITO-v2 (SEM código de app)

```
Fase 1. Não escreva nenhum código de app nesta sessão.

Fonte: CONCEITO-v2.md (o PDF do pitch antigo é só referência histórica; em conflito, o CONCEITO-v2
manda). Com CLAUDE.md e SECURITY.md, gere:

1. docs/PRD.md — requisitos: persona (empresa; candidato é usuário sem conta), jobs-to-be-done,
   fluxos (criar vaga → gerar link → candidato responde → deck → entrevistar), telas por fluxo,
   regras de negócio, o que é MVP vs o que é Etapa 2 (pós-MVP).
2. docs/data-model.md — schema detalhado de cada tabela da seção 3 do CLAUDE.md (colunas, tipos,
   constraints, FKs) e a matriz de RLS: quem lê/escreve o quê, o que a RPC do deck expõe, e que o
   telefone só sai após status='entrevistar'.
3. docs/disc-quiz.json — ~12 perguntas do quiz DISC, cada opção com pesos nos eixos D/I/S/C,
   fórmula de normalização pra 0–100 incluindo o caso de eixo com soma zero.
4. docs/disc-leituras.md — mapeamento determinístico perfil DISC → frases do card em linguagem
   simples.
5. docs/disc-alvos-cargo.md — tabela de alvo DISC sugerido por tipo de cargo (atendimento, caixa,
   produção etc.), marcada como "a validar pelo dono".
6. docs/decisions.md — pendências que precisam da minha resposta, começando pelas P5–P15 do
   docs/revisao.md, mais o que você encontrar.

Não invente número de mercado nem preço. Onde a spec for vaga sobre REGRA DE NEGÓCIO, liste no
decisions.md em vez de assumir (lacuna de UI você resolve sozinho, regra 9 do CLAUDE.md).
```

**Pare aqui, leia os docs, corrija o que estiver errado antes de seguir.**

---

## FASE 2 — Scaffold + auth da empresa

```
Fase 2. Leia CLAUDE.md e docs/PRD.md.

Implemente:
1. Fluxo de auth da EMPRESA com Supabase (email+senha): cadastro, login, logout, recuperação,
   verificação de email obrigatória. Não existe escolha de papel: candidato não tem conta no MVP.
2. Cadastro cria a linha em profiles (role 'empresa') e redireciona pro onboarding da empresa.
3. Roteamento protegido: (empresa)/ só logado; q/[token] é público.
4. Decida aqui nativewind vs tamagui (pendência P12), registre em docs/decisions.md e padronize um só.

Plano primeiro, depois código. Commits pequenos.
```

---

## FASE 3 — Schema + RLS + tipos

```
Fase 3. Leia docs/data-model.md e SECURITY.md (seções 1, 3b e 6).

1. Crie as migrations SQL em supabase/migrations/ pra todas as tabelas da seção 3 do CLAUDE.md
   (profiles, empresas, vagas com quiz_token/quiz_ativo, candidatos, candidaturas, audit_log).
2. Escreva as policies de RLS conforme a matriz do data-model.md. Toda tabela habilita RLS.
   NENHUMA policy de INSERT/SELECT pro role anon em candidatos/candidaturas.
   Telefone do candidato inacessível via select direto — acesso só pela RPC de contato.
3. Crie as funções: match_score(...), get_deck(vaga_id) (só campos do card) e a RPC de revelação
   de contato (valida status='entrevistar' + grava audit_log). Trigger/mecanismo server-side de
   insert no audit_log.
4. Gere os tipos TypeScript (supabase gen types) em types/.
5. Seed de dev: empresas, vagas e candidaturas fictícias.
6. Escreva o teste de invasão da seção 1 do SECURITY.md (A invade B; contato antes do status).

Me mostre o SQL completo antes de aplicar. Não aplique migration sem meu OK.
```

---

## FASE 4 — Empresa: vaga + link do quiz + plano (mock)

```
Fase 4. Leia docs/PRD.md e docs/disc-alvos-cargo.md.

1. Onboarding da empresa: nome, CNPJ, cidade.
2. Criar vaga: título, descrição, modalidade, escolaridade mínima, período, cidade, e o alvo DISC
   (sliders D/I/S/C 0–100, pré-preenchidos pela sugestão por tipo de cargo).
3. Geração do link público do quiz + QR code (vagas.quiz_token), com botão de copiar/compartilhar.
4. Listagem/edição/pausa/fechamento das vagas. Pausar ou fechar desativa o link (quiz_ativo=false).
5. Seleção de plano via BillingProvider (lib/billing/): crie a interface (provider.ts) e a única
   implementação do MVP, MockBillingProvider, que só grava o tier e marca
   empresas.plano_status='ativa', sem cobrança. Nenhum código fora de lib/billing/ pode saber
   qual provider está por baixo. Não instale SDK de gateway nenhum.
   (Números dos tiers: placeholder até a pendência P7. Billing real: Fase PAG, opcional.)

Plano primeiro, commits pequenos. Lacuna de UI: resolve e registra em docs/decisoes-ui.md.
```

---

## FASE 5 — Candidato: quiz público por link

```
Fase 5. Leia docs/PRD.md, docs/disc-quiz.json e SECURITY.md §3b e §5.

1. Página pública q/[token]: mostra a vaga (título, empresa, cidade, modalidade, período),
   o consentimento LGPD (checkbox versionado, obrigatório, ANTES das perguntas) e o quiz.
2. Dados do formulário: nome, telefone/WhatsApp e cidade obrigatórios; idade e escolaridade
   opcionais (não travam o envio). Sem email, sem CPF, sem foto.
3. Envio via Edge Function: valida token e quiz_ativo, rate limit por IP, dedup por telefone
   (mesma vaga + mesmo telefone rejeita com mensagem amigável), calcula o vetor DISC e grava
   candidato + candidatura com consent_versao/consent_at. Resposta incompleta não grava nada.
4. lib/disc.ts com o scoring do quiz + testes unitários cobrindo a normalização (incluindo eixo
   com soma zero).
5. Tela de confirmação pro candidato (sem mostrar score — decisão de UI sua, registre).

Plano primeiro. O scoring precisa de teste antes de dar por pronto.
```

---

## FASE 6 — Deck de triagem + score

```
Fase 6. Leia a seção 4 do CLAUDE.md (matching) e docs/disc-leituras.md.

1. Confirme que match_score(candidatura, vaga) e get_deck(vaga_id) (Fase 3) devolvem o deck
   ordenado por score desc, só com os campos do card (sem telefone).
2. Espelhe a lógica em lib/matching.ts com FIXTURES COMPARTILHADAS: os mesmos vetores de teste
   rodam contra o SQL e contra o TS e têm que dar o mesmo score.
3. UI do deck por vaga: card com nome, cidade, idade/escolaridade (se informados), % de fit e a
   leitura em linguagem simples. Swipe/botões atualizam candidaturas.status
   (visto/descartado/entrevistar).
4. Se a candidatura tiver escolaridade preenchida abaixo do mínimo da vaga: comportamento é a
   pendência P6 — se ainda não decidida, pare e pergunte antes de implementar essa parte.

Plano primeiro. Teste o score antes de integrar na UI.
```

---

## FASE 7 — Contato + funil de entrevista

```
Fase 7. Leia docs/data-model.md (regra de contato) e SECURITY.md §1 e §6.

1. Ação "quero entrevistar" no deck: muda status pra 'entrevistar', chama a RPC de revelação de
   contato e grava o evento no audit_log.
2. Lista de entrevistas da vaga: candidatos marcados, com contato revelado e botão de WhatsApp.
3. Confirme via API direta (não só na UI) que o telefone é ilegível antes do status — rode o
   teste de invasão da Fase 3 de novo.

Sem match mútuo: a revelação é unilateral, decisão P2. Não implemente nada de "match".
```

---

## FASE 8 — Build e publicação

```
Fase 8. Objetivo: preparar pra publicar. Escopo depende da pendência P11 (web-first vs lojas).

1. Gere o build web (expo export) e me diga como servir (a página do quiz precisa de URL pública
   estável — é ela que vai no QR code).
2. Publique política de privacidade e termos em URL própria (exigência LGPD, e das lojas se P11).
3. SE P11 incluir lojas: PRIMEIRO o nome definitivo (TalentMatch é provisório — reveja
   docs/decisoes-ui.md e a pendência de marca antes de submeter); depois app.json/eas.json
   (nome, bundle id, ícones, splash),
   assets de loja, screenshots, conta demo pro revisor, EAS Submit, e o passo a passo do que EU
   preciso fazer nas contas Apple/Google.
4. Rode o checklist da seção 9 do SECURITY.md item por item e me devolva o resultado.

Não tente submeter sozinho. Prepare tudo e me entregue o passo a passo final.
```

---

## FASE PAG — Billing real (OPCIONAL, pós-validação, só quando eu escolher o gateway)

```
Fase PAG. Leia SECURITY.md §7. Pré-condições: pendência P16 (qual gateway) decidida por mim e
pendência P7 (números dos tiers) fechada. Se qualquer uma estiver aberta, pare e me pergunte.

Objetivo: implementar o BillingProvider real POR BAIXO da interface que já existe, sem tocar no
resto do app.

1. Nova implementação da interface de lib/billing/provider.ts pro gateway escolhido.
   Edge Function fala com a API do gateway (recorrência), chaves só em secrets.
2. Webhook do gateway: validação de assinatura, idempotência (evento reentregue não aplica efeito
   duas vezes), tolerância a evento fora de ordem. Atualiza empresas.plano_status.
3. O gate por tier continua o mesmo que já funcionava com o mock — nada muda fora do provider.
4. NF-e conforme a pendência P14. Todo evento de pagamento vai pro audit_log.

Critério de aceite: NENHUMA mudança fora de lib/billing/ e das edge functions de billing.
NÃO coloque nenhuma chave de API no client. Me mostre o desenho do fluxo antes de codar.
```

---

## Dicas de operação (pra gastar o Fable bem, não à toa)

- **Uma fase por sessão.** Contexto limpo = resposta melhor. No fim de cada fase, peça um resumo curto do que mudou pra colar no início da próxima.
- **Sempre "plano primeiro".** Código gerado sem plano em projeto grande vira retrabalho, que gasta mais quota que planejar.
- **Revise antes de aprovar migration ou billing.** Esses dois são os que doem se saírem errados.
- **Decisão de produto trava?** As pendências P5–P15 estão em docs/revisao.md — resolve comigo no chat, não deixa o Claude Code adivinhar. Decisão de UI ele toma sozinho e registra em docs/decisoes-ui.md (regra 9 do CLAUDE.md); revise esse arquivo em lote de vez em quando.
