-- Apply this once to databases created with the original single-restaurant schema.
begin;

create extension if not exists pgcrypto;
create table if not exists restaurantes (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) >= 2),
  onboarding_concluido boolean not null default false,
  created_at timestamptz not null default now()
);

insert into restaurantes (id, nome, onboarding_concluido)
values ('00000000-0000-0000-0000-000000000001', 'Restaurante migrado', true)
on conflict (id) do nothing;

alter table usuarios add column if not exists tenant_id uuid references restaurantes(id);
alter table mesas add column if not exists tenant_id uuid references restaurantes(id);
alter table produtos add column if not exists tenant_id uuid references restaurantes(id);
alter table comandas add column if not exists tenant_id uuid references restaurantes(id);
alter table itens_comanda add column if not exists tenant_id uuid references restaurantes(id);
alter table caixa_diario add column if not exists tenant_id uuid references restaurantes(id);

update usuarios set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update mesas set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update produtos set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update comandas set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update itens_comanda set tenant_id = comandas.tenant_id from comandas where itens_comanda.comanda_id = comandas.id and itens_comanda.tenant_id is null;
update caixa_diario set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;

alter table usuarios alter column tenant_id set not null;
alter table mesas alter column tenant_id set not null;
alter table produtos alter column tenant_id set not null;
alter table comandas alter column tenant_id set not null;
alter table itens_comanda alter column tenant_id set not null;
alter table caixa_diario alter column tenant_id set not null;

alter table mesas drop constraint if exists mesas_numero_key;
alter table comandas drop constraint if exists comandas_numero_comanda_key;
alter table caixa_diario drop constraint if exists caixa_diario_data_key;
drop index if exists idx_comandas_mesa_ativa;
create unique index if not exists idx_comandas_mesa_ativa on comandas(tenant_id, mesa_id) where status <> 'pago';
create unique index if not exists idx_mesas_tenant_numero on mesas(tenant_id, numero);
create unique index if not exists idx_comandas_tenant_numero on comandas(tenant_id, numero_comanda) where numero_comanda is not null;
create unique index if not exists idx_caixa_tenant_data on caixa_diario(tenant_id, data);
create index if not exists idx_usuarios_tenant on usuarios(tenant_id);
create index if not exists idx_produtos_tenant on produtos(tenant_id);
create index if not exists idx_comandas_tenant on comandas(tenant_id, created_at desc);
create index if not exists idx_itens_comanda_tenant on itens_comanda(tenant_id, comanda_id);

create or replace function atualizar_status_mesa_por_comanda() returns trigger as $$
begin
  if tg_op = 'UPDATE' and old.status = new.status then return new; end if;
  if new.status = 'pago' then
    update mesas set status = 'disponivel' where id = new.mesa_id and tenant_id = new.tenant_id;
    insert into caixa_diario (tenant_id, data, total_vendas) values (new.tenant_id, current_date, new.total)
    on conflict (tenant_id, data) do update set total_vendas = caixa_diario.total_vendas + excluded.total_vendas, updated_at = now();
  elsif new.status = 'esperando_pagamento' then update mesas set status = 'esperando_pagamento' where id = new.mesa_id and tenant_id = new.tenant_id;
  else update mesas set status = 'ocupada' where id = new.mesa_id and tenant_id = new.tenant_id; end if;
  return new;
end;
$$ language plpgsql;

create or replace function criar_restaurante_onboarding(p_restaurante text, p_nome text, p_email text, p_senha_hash text)
returns table (id bigint, tenant_id uuid, nome text, email text, tipo usuario_tipo, created_at timestamptz) as $$
declare novo_tenant uuid;
begin
  insert into restaurantes (nome) values (trim(p_restaurante)) returning restaurantes.id into novo_tenant;
  return query insert into usuarios (tenant_id, nome, email, senha, tipo)
    values (novo_tenant, trim(p_nome), lower(trim(p_email)), p_senha_hash, 'admin')
    returning usuarios.id, usuarios.tenant_id, usuarios.nome, usuarios.email, usuarios.tipo, usuarios.created_at;
end;
$$ language plpgsql;

alter table restaurantes enable row level security;
alter table usuarios enable row level security;
alter table mesas enable row level security;
alter table produtos enable row level security;
alter table comandas enable row level security;
alter table itens_comanda enable row level security;
alter table caixa_diario enable row level security;

commit;
