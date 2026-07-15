-- Seed de DESENVOLVIMENTO LOCAL (roda no `supabase db reset`). NUNCA em produção.
-- Cria: 1 conta de empresa confirmada (dev@deuvaga.local / senha123), 2 vagas,
-- 3 candidatos e 4 candidaturas com score calculado pela própria match_score.

-- crypt()/gen_salt() pra hash de senha do usuário de teste (só ambiente local).
create extension if not exists pgcrypto;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'dev@deuvaga.local',
  crypt('senha123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
);
-- profiles é criado pelo trigger trg_on_auth_user_created.

insert into public.empresas (id, profile_id, nome, cnpj, cidade)
values ('22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'Mercado do Bairro LTDA', '11222333000181', 'Xanxerê');

-- Plano mock ativo (mesmo efeito da RPC selecionar_plano; contexto de billing local).
select set_config('app.billing', 'on', true);
update public.empresas set plano_tier = 'intermediario', plano_status = 'ativa'
  where id = '22222222-2222-2222-2222-222222222222';

insert into public.vagas (id, empresa_id, titulo, modalidade, periodo, cidade,
  escolaridade_min, disc_target_d, disc_target_i, disc_target_s, disc_target_c)
values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222',
   'Atendente de loja', 'presencial', 'integral', 'Xanxerê', 'medio', 15, 40, 30, 15),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222',
   'Operador de caixa', 'presencial', 'meio', 'Xanxerê', null, 10, 20, 35, 35);

insert into public.candidatos (id, nome, telefone, cidade, idade, escolaridade) values
  ('44444444-4444-4444-4444-444444444441', 'Ana Souza', '49991110001', 'Xanxerê', 22, 'medio'),
  ('44444444-4444-4444-4444-444444444442', 'Bruno Lima', '49991110002', 'Xanxerê', 30, null),
  ('44444444-4444-4444-4444-444444444443', 'Carla Dias', '49991110003', 'Chapecó', 19, 'fundamental');

insert into public.candidaturas (vaga_id, candidato_id, respostas,
  disc_d, disc_i, disc_s, disc_c, score, consent_versao, consent_at)
select v.vaga, v.cand, '[]'::jsonb, v.d, v.i, v.s, v.c,
       public.match_score(v.d, v.i, v.s, v.c, vg.disc_target_d, vg.disc_target_i, vg.disc_target_s, vg.disc_target_c),
       'v1-dev', now()
from (values
  ('33333333-3333-3333-3333-333333333331'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 17, 48, 25, 10),
  ('33333333-3333-3333-3333-333333333331'::uuid, '44444444-4444-4444-4444-444444444442'::uuid, 40, 15, 30, 15),
  ('33333333-3333-3333-3333-333333333331'::uuid, '44444444-4444-4444-4444-444444444443'::uuid, 10, 15, 40, 35),
  ('33333333-3333-3333-3333-333333333332'::uuid, '44444444-4444-4444-4444-444444444441'::uuid, 17, 48, 25, 10)
) as v(vaga, cand, d, i, s, c)
join public.vagas vg on vg.id = v.vaga;
