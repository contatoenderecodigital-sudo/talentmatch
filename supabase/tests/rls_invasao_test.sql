-- Teste de invasão (SECURITY.md §1 / data-model §5). Gate de fase.
-- Rodar num banco com as migrations aplicadas (local: supabase db reset && psql -f este arquivo).
-- Tudo roda numa transação e dá ROLLBACK no fim — não suja o banco.
-- Saída esperada: só linhas "PASS ...". Qualquer "FAIL" = fase reprovada.

create extension if not exists pgcrypto; -- crypt()/gen_salt() pros usuários de teste

begin;

-- Duas empresas (A e B)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000001', 'authenticated',
   'authenticated', 'a@teste.local', crypt('x', gen_salt('bf')), now(), '{}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000001', 'authenticated',
   'authenticated', 'b@teste.local', crypt('x', gen_salt('bf')), now(), '{}', '{}', now(), now());

insert into public.empresas (id, profile_id, nome, cnpj, cidade) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Empresa A', '11111111000191', 'Xanxerê'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'Empresa B', '22222222000191', 'Xanxerê');

select set_config('app.billing', 'on', true);
update public.empresas set plano_tier = 'basico', plano_status = 'ativa';

insert into public.vagas (id, empresa_id, titulo, modalidade, periodo, cidade,
  disc_target_d, disc_target_i, disc_target_s, disc_target_c)
values ('aaaaaaaa-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002',
        'Vaga da A', 'presencial', 'integral', 'Xanxerê', 15, 40, 30, 15);

insert into public.candidatos (id, nome, telefone, cidade)
values ('aaaaaaaa-0000-0000-0000-000000000004', 'Candidata Sigilosa', '49999990000', 'Xanxerê');

insert into public.candidaturas (id, vaga_id, candidato_id, respostas,
  disc_d, disc_i, disc_s, disc_c, score, consent_versao, consent_at)
values ('aaaaaaaa-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003',
        'aaaaaaaa-0000-0000-0000-000000000004', '[]', 17, 48, 25, 10, 85, 'v1', now());

-- ===== Sessão da EMPRESA B (invasora) =====
set local role authenticated;
set local request.jwt.claims to '{"sub":"bbbbbbbb-0000-0000-0000-000000000001","role":"authenticated"}';

do $$
declare n int;
begin
  select count(*) into n from public.vagas where id = 'aaaaaaaa-0000-0000-0000-000000000003';
  raise notice '% 1. B nao le vaga da A', case when n = 0 then 'PASS' else 'FAIL' end;

  select count(*) into n from public.candidaturas;
  raise notice '% 2. B nao le candidatura da A', case when n = 0 then 'PASS' else 'FAIL' end;

  select count(*) into n from public.candidatos;
  raise notice '% 3. B nao le candidatos (tabela de contato)', case when n = 0 then 'PASS' else 'FAIL' end;

  begin
    perform * from public.get_deck('aaaaaaaa-0000-0000-0000-000000000003');
    raise notice 'FAIL 4. get_deck da vaga alheia deveria falhar';
  exception when others then
    raise notice 'PASS 4. get_deck de vaga alheia bloqueado';
  end;
end $$;

-- ===== Sessão da EMPRESA A (dona) =====
set local request.jwt.claims to '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';

do $$
declare n int; v_tel text;
begin
  select count(*) into n from public.candidatos;
  raise notice '% 5. nem a dona le candidatos direto', case when n = 0 then 'PASS' else 'FAIL' end;

  begin
    select telefone into v_tel from public.revelar_contato('aaaaaaaa-0000-0000-0000-000000000005');
    raise notice 'FAIL 6. contato antes de entrevistar deveria falhar';
  exception when others then
    raise notice 'PASS 6. contato bloqueado antes do status entrevistar';
  end;

  begin
    update public.empresas set plano_tier = 'alto_volume'
      where profile_id = 'aaaaaaaa-0000-0000-0000-000000000001';
    raise notice 'FAIL 7. update direto de plano deveria falhar';
  exception when others then
    raise notice 'PASS 7. update direto de plano bloqueado (guarda do BillingProvider)';
  end;

  perform public.atualizar_status('aaaaaaaa-0000-0000-0000-000000000005', 'entrevistar');
  select telefone into v_tel from public.revelar_contato('aaaaaaaa-0000-0000-0000-000000000005');
  raise notice '% 8. contato liberado apos entrevistar', case when v_tel = '49999990000' then 'PASS' else 'FAIL' end;

  begin
    update public.audit_log set action = 'x' where true;
    raise notice 'FAIL 9. update em audit_log deveria falhar';
  exception when others then
    raise notice 'PASS 9. audit_log intocavel pelo app';
  end;
end $$;

-- ===== Sessão ANON (candidato) =====
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

do $$
declare n int;
begin
  begin
    insert into public.candidatos (nome, telefone, cidade) values ('Hacker', '49000000000', 'x');
    raise notice 'FAIL 10. anon nao pode inserir candidato direto';
  exception when others then
    raise notice 'PASS 10. anon sem insert direto em candidatos';
  end;

  select count(*) into n from public.candidaturas;
  raise notice '% 11. anon nao le candidaturas', case when n = 0 then 'PASS' else 'FAIL' end;

end $$;

-- ===== Grants das funções (rodando como superuser de novo) =====
reset role;

do $$
begin
  raise notice '% 12. anon executa get_vaga_publica',
    case when has_function_privilege('anon', 'public.get_vaga_publica(text)', 'execute') then 'PASS' else 'FAIL' end;
  raise notice '% 13. anon NAO executa get_deck',
    case when not has_function_privilege('anon', 'public.get_deck(uuid)', 'execute') then 'PASS' else 'FAIL' end;
  raise notice '% 14. anon NAO executa revelar_contato',
    case when not has_function_privilege('anon', 'public.revelar_contato(uuid)', 'execute') then 'PASS' else 'FAIL' end;
  raise notice '% 15. authenticated NAO executa fn_audit direto',
    case when not has_function_privilege('authenticated', 'public.fn_audit(uuid,text,text,text,jsonb,inet)', 'execute') then 'PASS' else 'FAIL' end;
  raise notice '% 16. authenticated NAO executa processar_exclusao_lgpd',
    case when not has_function_privilege('authenticated', 'public.processar_exclusao_lgpd(text)', 'execute') then 'PASS' else 'FAIL' end;
end $$;

rollback;
