-- Registro de consumo para limitar la cuota diaria por usuario.
-- Aquí NO se guarda ninguna foto ni imagen generada: solo el conteo.

create table if not exists public.generaciones (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  gender     text not null check (gender in ('catrin', 'catrina')),
  created_at timestamptz not null default now()
);

create index if not exists generaciones_user_fecha_idx
  on public.generaciones (user_id, created_at desc);

alter table public.generaciones enable row level security;

-- Sin políticas: solo la Edge Function (service role) puede escribir/leer.
-- El anon key no toca esta tabla ni para contar.
