-- Grants de tabela pros roles do Supabase (Fase 3, correção).
-- RLS controla QUAIS linhas; GRANT controla o acesso-base à tabela. Sem o GRANT,
-- o Postgres barra antes de avaliar a policy ("permission denied for table ...").
-- O grant automático do Supabase não cobre tabelas criadas via migration, então é explícito aqui.

-- profiles: empresa lê a própria linha (criada pelo trigger de signup).
grant select on public.profiles to authenticated;

-- empresas: onboarding insere; app lê a própria; update é guardado por trigger
-- (plano só muda pela RPC selecionar_plano).
grant select, insert, update on public.empresas to authenticated;

-- vagas: CRUD sem delete (a policy restringe às próprias).
grant select, insert, update on public.vagas to authenticated;

-- candidaturas: empresa LÊ direto (contagem no deck/lista). Escrita só via RPC/Edge Function.
grant select on public.candidaturas to authenticated;

-- candidatos: NENHUM grant de propósito — telefone só sai pela RPC revelar_contato
-- (SECURITY DEFINER). Escrita do candidato anônimo é só pela Edge Function (service_role).
-- audit_log / lgpd_pedidos: sem grant — só funções definer e service_role tocam.
-- Nada de "alter default privileges": grant é explícito por tabela (SECURITY.md §1), pra
-- tabela nova nunca ganhar acesso sem querer.
