-- supabase/migrations/20260825140000_transferir_creditos.sql
--
-- Cuando un usuario anónimo inicia sesión con Apple o Google, sus créditos
-- (comprados o el gratuito) tienen que viajar a la cuenta permanente.
-- Sin esto, pagar y luego crear cuenta = perder lo pagado.

create or replace function public.transferir_creditos(
  p_origen  uuid,   -- usuario anónimo
  p_destino uuid    -- usuario permanente (Apple / Google)
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  saldo_origen int;
  saldo_final  int;
begin
  if p_origen = p_destino then
    select saldo into saldo_final from public.creditos where user_id = p_destino;
    return coalesce(saldo_final, 0);
  end if;

  -- Bloqueamos la fila de origen para que no se gaste a media transferencia.
  select saldo into saldo_origen
    from public.creditos
   where user_id = p_origen
     for update;

  if saldo_origen is null then
    select saldo into saldo_final from public.creditos where user_id = p_destino;
    return coalesce(saldo_final, 0);
  end if;

  -- Vaciamos el origen antes de abonar: si algo truena después, el peor caso
  -- es que el usuario pierda créditos que igual iba a perder. Al revés
  -- (abonar primero) permitiría duplicarlos reintentando.
  update public.creditos
     set saldo = 0, actualizado = now()
   where user_id = p_origen;

  insert into public.creditos (user_id, saldo)
  values (p_destino, saldo_origen)
  on conflict (user_id)
  do update set saldo = public.creditos.saldo + saldo_origen,
                actualizado = now()
  returning saldo into saldo_final;

  -- El historial de compras también se muda, para soporte y reembolsos.
  update public.compras set user_id = p_destino where user_id = p_origen;

  return saldo_final;
end $$;

revoke execute on function public.transferir_creditos(uuid, uuid)
  from anon, authenticated;
