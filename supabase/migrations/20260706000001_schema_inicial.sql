-- DeuVaga — schema inicial (Fase 3)
-- Fonte: docs/data-model.md. RLS em tudo (SECURITY.md §1).

-- ============================================================
-- 1. TABELAS
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'empresa' check (role in ('empresa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  nome text not null,
  cnpj text not null unique check (cnpj ~ '^[0-9]{14}$'),
  cidade text not null,
  plano_tier text check (plano_tier in ('basico', 'intermediario', 'alto_volume')),
  plano_status text not null default 'inativa' check (plano_status in ('ativa', 'inativa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  titulo text not null,
  descricao text,
  modalidade text not null check (modalidade in ('remoto', 'presencial', 'hibrido')),
  escolaridade_min text check (escolaridade_min in ('fundamental', 'medio', 'tecnico', 'superior')),
  periodo text not null check (periodo in ('integral', 'meio', 'flexivel')),
  cidade text not null,
  status text not null default 'aberta' check (status in ('aberta', 'pausada', 'fechada')),
  disc_target_d int not null check (disc_target_d between 0 and 100),
  disc_target_i int not null check (disc_target_i between 0 and 100),
  disc_target_s int not null check (disc_target_s between 0 and 100),
  disc_target_c int not null check (disc_target_c between 0 and 100),
  -- 2 UUIDv4 concatenados = 64 hex chars, ~244 bits aleatórios (>= 128 exigidos, SECURITY.md §3b).
  -- gen_random_uuid() é nativo do Postgres 13+; evita a dependência de pgcrypto/gen_random_bytes.
  quiz_token text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  quiz_ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.candidatos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id), -- null no MVP; Etapa 2 liga a conta
  nome text not null,
  telefone text not null unique check (telefone ~ '^[0-9]{10,11}$'),
  cidade text not null,
  idade int check (idade between 14 and 99),
  escolaridade text check (escolaridade in ('fundamental', 'medio', 'tecnico', 'superior')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references public.vagas (id) on delete cascade,
  candidato_id uuid not null references public.candidatos (id) on delete cascade,
  respostas jsonb not null,
  disc_d int not null check (disc_d between 0 and 100),
  disc_i int not null check (disc_i between 0 and 100),
  disc_s int not null check (disc_s between 0 and 100),
  disc_c int not null check (disc_c between 0 and 100),
  score int not null check (score between 0 and 100),
  status text not null default 'novo' check (status in ('novo', 'visto', 'descartado', 'entrevistar')),
  consent_versao text not null,
  consent_at timestamptz not null,
  consent_pool boolean not null default false,
  created_at timestamptz not null default now(),
  unique (vaga_id, candidato_id)
);

create index candidaturas_deck_idx on public.candidaturas (vaga_id, score desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_profile_id uuid, -- null = candidato anônimo / sistema
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  created_at timestamptz not null default now()
);

create table public.lgpd_pedidos (
  id uuid primary key default gen_random_uuid(),
  telefone text not null,
  tipo text not null check (tipo in ('exclusao', 'exportacao')),
  status text not null default 'recebido' check (status in ('recebido', 'concluido')),
  created_at timestamptz not null default now(),
  concluido_at timestamptz
);

-- ============================================================
-- 2. TRIGGERS DE MANUTENÇÃO
-- ============================================================

create or replace function public.fn_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.fn_updated_at();
create trigger trg_empresas_updated before update on public.empresas
  for each row execute function public.fn_updated_at();
create trigger trg_vagas_updated before update on public.vagas
  for each row execute function public.fn_updated_at();
create trigger trg_candidatos_updated before update on public.candidatos
  for each row execute function public.fn_updated_at();

-- Toda conta nova vira profile de empresa (candidato não tem conta no MVP).
create or replace function public.fn_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role) values (new.id, 'empresa');
  return new;
end $$;

create trigger trg_on_auth_user_created after insert on auth.users
  for each row execute function public.fn_handle_new_user();

-- quiz_ativo é derivado do status da vaga (RN-02).
create or replace function public.fn_sync_quiz_ativo()
returns trigger language plpgsql as $$
begin
  new.quiz_ativo := (new.status = 'aberta');
  return new;
end $$;

create trigger trg_vagas_quiz_ativo before insert or update of status on public.vagas
  for each row execute function public.fn_sync_quiz_ativo();

-- Auditoria (insert só server-side: função definer, sem grant pro app).
create or replace function public.fn_audit(
  p_actor uuid, p_action text, p_entity_type text, p_entity_id text,
  p_metadata jsonb default '{}'::jsonb, p_ip inet default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_profile_id, action, entity_type, entity_id, metadata, ip)
  values (p_actor, p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb), p_ip);
end $$;

revoke execute on function public.fn_audit from public, anon, authenticated;

create or replace function public.fn_audit_vagas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.fn_audit(auth.uid(), 'vaga_criada', 'vaga', new.id::text,
      jsonb_build_object('titulo', new.titulo));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform public.fn_audit(auth.uid(), 'vaga_status', 'vaga', new.id::text,
      jsonb_build_object('de', old.status, 'para', new.status));
  end if;
  return new;
end $$;

create trigger trg_vagas_audit after insert or update on public.vagas
  for each row execute function public.fn_audit_vagas();

-- Guarda do plano: plano_tier/plano_status só mudam via selecionar_plano (F1-1)
-- ou por service_role (Fase PAG).
create or replace function public.fn_guarda_plano()
returns trigger language plpgsql as $$
begin
  if (new.plano_tier is distinct from old.plano_tier
      or new.plano_status is distinct from old.plano_status)
     and coalesce(current_setting('app.billing', true), '') <> 'on'
     -- service_role (Edge Functions da Fase PAG) e superuser (migrations/seed) passam
     and current_user not in ('service_role', 'postgres', 'supabase_admin')
  then
    raise exception 'plano so muda pelo BillingProvider (RPC selecionar_plano)';
  end if;
  return new;
end $$;

create trigger trg_empresas_guarda_plano before update on public.empresas
  for each row execute function public.fn_guarda_plano();

-- Gate do plano na vaga (RN-10): criar/reabrir vaga exige plano ativo e limite do tier.
create or replace function public.fn_tier_limite(p_tier text)
returns int language sql immutable as $$
  select case p_tier
    when 'basico' then 1
    when 'intermediario' then 3
    else null -- alto_volume: ilimitado
  end
$$;

create or replace function public.fn_gate_vaga()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_empresa public.empresas%rowtype;
  v_limite int;
  v_abertas int;
begin
  if new.status <> 'aberta' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'aberta' then
    return new; -- já estava aberta, não é criação/reabertura
  end if;
  select * into v_empresa from public.empresas where id = new.empresa_id;
  if v_empresa.plano_status <> 'ativa' then
    raise exception 'plano inativo: escolha um plano antes de abrir vaga';
  end if;
  v_limite := public.fn_tier_limite(v_empresa.plano_tier);
  if v_limite is not null then
    select count(*) into v_abertas from public.vagas
      where empresa_id = new.empresa_id and status = 'aberta' and id <> new.id;
    if v_abertas >= v_limite then
      raise exception 'limite de vagas abertas do plano atingido (%)', v_limite;
    end if;
  end if;
  return new;
end $$;

create trigger trg_vagas_gate before insert or update of status on public.vagas
  for each row execute function public.fn_gate_vaga();

-- ============================================================
-- 3. RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.empresas enable row level security;
alter table public.vagas enable row level security;
alter table public.candidatos enable row level security;
alter table public.candidaturas enable row level security;
alter table public.audit_log enable row level security;
alter table public.lgpd_pedidos enable row level security;

-- profiles: só a própria linha (insert é do trigger de signup)
create policy profiles_select on public.profiles
  for select to authenticated using (id = auth.uid());

-- empresas: só a própria (update de plano barrado pelo trigger)
create policy empresas_select on public.empresas
  for select to authenticated using (profile_id = auth.uid());
create policy empresas_insert on public.empresas
  for insert to authenticated with check (profile_id = auth.uid());
create policy empresas_update on public.empresas
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- vagas: CRUD (sem delete) das próprias
create policy vagas_select on public.vagas
  for select to authenticated
  using (empresa_id in (select id from public.empresas where profile_id = auth.uid()));
create policy vagas_insert on public.vagas
  for insert to authenticated
  with check (empresa_id in (select id from public.empresas where profile_id = auth.uid()));
create policy vagas_update on public.vagas
  for update to authenticated
  using (empresa_id in (select id from public.empresas where profile_id = auth.uid()))
  with check (empresa_id in (select id from public.empresas where profile_id = auth.uid()));

-- candidatos: NENHUMA policy — ninguém acessa direto (telefone mora aqui).
-- candidaturas: empresa dona da vaga LÊ (colunas daqui não têm contato);
--   status muda só pela RPC atualizar_status.
create policy candidaturas_select on public.candidaturas
  for select to authenticated
  using (vaga_id in (
    select v.id from public.vagas v
    join public.empresas e on e.id = v.empresa_id
    where e.profile_id = auth.uid()
  ));

-- audit_log / lgpd_pedidos: nenhuma policy (leitura só dashboard — P15).

-- ============================================================
-- 4. FUNÇÕES / RPCs
-- ============================================================

-- Score de fit (CLAUDE.md §4). Espelho de lib/matching.ts — fixtures compartilhadas.
create or replace function public.match_score(
  d int, i int, s int, c int, dt int, it int, st int, ct int
) returns int language sql immutable as $$
  select round(
    (1 - sqrt(power(d - dt, 2) + power(i - it, 2) + power(s - st, 2) + power(c - ct, 2)) / 200.0)::numeric * 100
  )::int
$$;

-- Página pública do quiz: dados da vaga pelo token (só com link ativo).
create or replace function public.get_vaga_publica(p_token text)
returns table (
  vaga_id uuid, titulo text, descricao text, empresa_nome text, cidade text,
  modalidade text, periodo text, escolaridade_min text
) language sql security definer set search_path = public as $$
  select v.id, v.titulo, v.descricao, e.nome, v.cidade, v.modalidade, v.periodo, v.escolaridade_min
  from public.vagas v
  join public.empresas e on e.id = v.empresa_id
  where v.quiz_token = p_token and v.quiz_ativo
$$;

-- Deck: só campos do card, só da dona da vaga. SEM telefone (SECURITY.md §1).
create or replace function public.get_deck(p_vaga_id uuid)
returns table (
  candidatura_id uuid, nome text, cidade text, idade int, escolaridade text,
  disc_d int, disc_i int, disc_s int, disc_c int, score int, status text, created_at timestamptz
) language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.vagas v join public.empresas e on e.id = v.empresa_id
    where v.id = p_vaga_id and e.profile_id = auth.uid()
  ) then
    raise exception 'vaga nao encontrada';
  end if;
  return query
    select ca.id, cd.nome, cd.cidade, cd.idade, cd.escolaridade,
           ca.disc_d, ca.disc_i, ca.disc_s, ca.disc_c, ca.score, ca.status, ca.created_at
    from public.candidaturas ca
    join public.candidatos cd on cd.id = ca.candidato_id
    where ca.vaga_id = p_vaga_id
    order by ca.score desc, ca.created_at asc;
end $$;

-- Transições de status do funil (RN-07). 'entrevistar' é terminal (contato revelado).
create or replace function public.atualizar_status(p_candidatura_id uuid, p_novo_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_atual text;
begin
  select ca.status into v_atual
  from public.candidaturas ca
  join public.vagas v on v.id = ca.vaga_id
  join public.empresas e on e.id = v.empresa_id
  where ca.id = p_candidatura_id and e.profile_id = auth.uid();

  if v_atual is null then
    raise exception 'candidatura nao encontrada';
  end if;

  if not (
    (v_atual = 'novo' and p_novo_status in ('visto', 'descartado', 'entrevistar'))
    or (v_atual = 'visto' and p_novo_status in ('descartado', 'entrevistar'))
    or (v_atual = 'descartado' and p_novo_status = 'visto')
  ) then
    raise exception 'transicao invalida: % -> %', v_atual, p_novo_status;
  end if;

  update public.candidaturas set status = p_novo_status where id = p_candidatura_id;
  perform public.fn_audit(auth.uid(), 'candidatura_status', 'candidatura', p_candidatura_id::text,
    jsonb_build_object('de', v_atual, 'para', p_novo_status));
end $$;

-- Revelação unilateral de contato (P2): só dona + status entrevistar, sempre auditada.
create or replace function public.revelar_contato(p_candidatura_id uuid)
returns table (nome text, telefone text)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.candidaturas ca
    join public.vagas v on v.id = ca.vaga_id
    join public.empresas e on e.id = v.empresa_id
    where ca.id = p_candidatura_id and e.profile_id = auth.uid()
      and ca.status = 'entrevistar'
  ) then
    raise exception 'contato indisponivel: marque "quero entrevistar" primeiro';
  end if;
  perform public.fn_audit(auth.uid(), 'contato_revelado', 'candidatura', p_candidatura_id::text);
  return query
    select cd.nome, cd.telefone
    from public.candidaturas ca
    join public.candidatos cd on cd.id = ca.candidato_id
    where ca.id = p_candidatura_id;
end $$;

-- Único caminho de escrita do plano (F1-1). Chamado pelo MockBillingProvider.
create or replace function public.selecionar_plano(p_tier text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_tier not in ('basico', 'intermediario', 'alto_volume') then
    raise exception 'tier invalido';
  end if;
  perform set_config('app.billing', 'on', true);
  update public.empresas
    set plano_tier = p_tier, plano_status = 'ativa'
    where profile_id = auth.uid();
  if not found then
    raise exception 'empresa nao encontrada';
  end if;
  perform public.fn_audit(auth.uid(), 'plano_alterado', 'empresa', null,
    jsonb_build_object('tier', p_tier, 'provider', 'mock'));
end $$;

-- Expurgo LGPD (P10 = 12 meses): candidaturas paradas + candidatos órfãos.
-- Agendar mensal (pg_cron ou job externo). Sem grant pro app.
create or replace function public.expurgo_retencao()
returns int language plpgsql security definer set search_path = public as $$
declare
  v_total int;
begin
  delete from public.candidaturas
    where created_at < now() - interval '12 months' and status in ('novo', 'visto', 'descartado');
  get diagnostics v_total = row_count;
  delete from public.candidatos cd
    where not exists (select 1 from public.candidaturas ca where ca.candidato_id = cd.id);
  perform public.fn_audit(null, 'expurgo_retencao', null, null,
    jsonb_build_object('candidaturas_removidas', v_total));
  return v_total;
end $$;

-- Exclusão LGPD (hard delete + anonimização do log — SECURITY.md §5/§6). Só service_role.
create or replace function public.processar_exclusao_lgpd(p_telefone text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select id into v_id from public.candidatos where telefone = p_telefone;
  if v_id is null then
    return; -- não vaza se o telefone existe ou não
  end if;
  update public.audit_log
    set metadata = metadata - 'telefone' - 'nome' || jsonb_build_object('anonimizado', true)
    where entity_type = 'candidatura'
      and entity_id in (select id::text from public.candidaturas where candidato_id = v_id);
  delete from public.candidatos where id = v_id; -- cascata apaga candidaturas
  perform public.fn_audit(null, 'lgpd_exclusao_concluida', 'candidato', null,
    jsonb_build_object('anonimizado', true));
end $$;

-- ============================================================
-- 5. GRANTS
-- ============================================================

revoke execute on function public.get_deck, public.revelar_contato,
  public.atualizar_status, public.selecionar_plano from public, anon;
revoke execute on function public.get_vaga_publica from public;
revoke execute on function public.expurgo_retencao, public.processar_exclusao_lgpd
  from public, anon, authenticated;

grant execute on function public.get_deck, public.revelar_contato,
  public.atualizar_status, public.selecionar_plano to authenticated;
grant execute on function public.get_vaga_publica to anon, authenticated;
grant execute on function public.match_score to anon, authenticated;
