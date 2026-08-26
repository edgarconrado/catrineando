-- supabase/migrations/20260825120000_creditos.sql
--
-- Sistema de créditos para Catrineando.
-- Todo el saldo vive en el servidor: el cliente NUNCA decide cuántos créditos
-- tiene ni cuándo descontarlos.

-- ---------------------------------------------------------------------------
-- Saldo
-- ---------------------------------------------------------------------------
create table if not exists public.creditos (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  saldo       int not null default 1 check (saldo >= 0),
  actualizado timestamptz not null default now()
);

alter table public.creditos enable row level security;

-- El usuario puede VER su saldo (para pintarlo en la UI), nunca modificarlo.
create policy "ver mi saldo" on public.creditos
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Historial de compras — sirve de log y, sobre todo, de candado de idempotencia
-- ---------------------------------------------------------------------------
create table if not exists public.compras (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  transaction_id text not null unique,   -- id de Apple/Google; evita duplicar
  product_id     text not null,
  creditos       int  not null,
  store          text,
  created_at     timestamptz not null default now()
);

alter table public.compras enable row level security;
-- Sin políticas: solo el service role escribe y lee.

create index if not exists compras_user_idx on public.compras (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Cada usuario nuevo nace con 1 crédito gratis
-- ---------------------------------------------------------------------------
create or replace function public.nuevo_usuario_creditos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.creditos (user_id, saldo)
  values (new.id, 1)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created_creditos on auth.users;
create trigger on_auth_user_created_creditos
  after insert on auth.users
  for each row execute function public.nuevo_usuario_creditos();

-- ---------------------------------------------------------------------------
-- Consumo atómico
--
-- El "where saldo > 0" dentro del UPDATE es lo importante: dos peticiones
-- simultáneas no pueden gastar el mismo crédito, porque la segunda no
-- encuentra fila que actualizar. Sin esto, tocar el botón dos veces rápido
-- genera dos imágenes cobrando una.
-- ---------------------------------------------------------------------------
create or replace function public.consumir_credito(p_user uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  update public.creditos
     set saldo = saldo - 1,
         actualizado = now()
   where user_id = p_user
     and saldo > 0
  returning true into ok;

  return coalesce(ok, false);
end $$;

-- ---------------------------------------------------------------------------
-- Devolución: si el generador falla, el crédito regresa.
-- Cobrar por una imagen que nunca llegó = reseña de una estrella.
-- ---------------------------------------------------------------------------
create or replace function public.devolver_credito(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.creditos
     set saldo = saldo + 1,
         actualizado = now()
   where user_id = p_user;
end $$;

-- ---------------------------------------------------------------------------
-- Alta de créditos comprados. Idempotente por transaction_id: si la tienda
-- reenvía el webhook (lo hacen), no se acreditan créditos de más.
-- Devuelve el saldo resultante.
-- ---------------------------------------------------------------------------
create or replace function public.otorgar_creditos(
  p_user           uuid,
  p_transaction_id text,
  p_product_id     text,
  p_creditos       int,
  p_store          text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_saldo int;
begin
  -- Si la transacción ya existe, no hacemos nada y regresamos el saldo actual.
  insert into public.compras (user_id, transaction_id, product_id, creditos, store)
  values (p_user, p_transaction_id, p_product_id, p_creditos, p_store)
  on conflict (transaction_id) do nothing;

  if not found then
    select saldo into nuevo_saldo from public.creditos where user_id = p_user;
    return coalesce(nuevo_saldo, 0);
  end if;

  insert into public.creditos (user_id, saldo)
  values (p_user, p_creditos)
  on conflict (user_id)
  do update set saldo = public.creditos.saldo + p_creditos,
                actualizado = now()
  returning saldo into nuevo_saldo;

  return nuevo_saldo;
end $$;

-- Estas funciones solo se llaman desde Edge Functions con service role.
revoke execute on function public.consumir_credito(uuid)  from anon, authenticated;
revoke execute on function public.devolver_credito(uuid)   from anon, authenticated;
revoke execute on function public.otorgar_creditos(uuid, text, text, int, text)
  from anon, authenticated;
