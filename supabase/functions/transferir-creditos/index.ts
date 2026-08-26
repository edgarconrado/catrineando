// supabase/functions/transferir-creditos/index.ts
//
// Se llama justo después de que un usuario anónimo inicia sesión con Apple o
// Google. Mueve su saldo a la cuenta permanente y borra la cuenta anónima.
//
//   supabase functions deploy transferir-creditos
//
// Seguridad: se verifican LOS DOS tokens contra Supabase. Nadie puede robar
// créditos ajenos porque haría falta el JWT válido de la cuenta origen.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { tokenAnonimo } = await req.json();
    if (!tokenAnonimo) return json({ error: 'Falta tokenAnonimo' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // --- Destino: quien hace la petición (ya autenticado con Apple/Google) ---
    const tokenDestino = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: dDestino } = await supabase.auth.getUser(tokenDestino);
    const destino = dDestino?.user;
    if (!destino) return json({ error: 'No autorizado' }, 401);

    // --- Origen: la cuenta anónima, probada con su propio JWT ---------------
    const { data: dOrigen } = await supabase.auth.getUser(tokenAnonimo);
    const origen = dOrigen?.user;
    if (!origen) return json({ error: 'Token anónimo inválido' }, 401);

    if (origen.id === destino.id) {
      // Ya era la misma cuenta (linkIdentity en vez de cuenta nueva): nada que hacer.
      const { data: fila } = await supabase
        .from('creditos').select('saldo').eq('user_id', destino.id).single();
      return json({ saldo: fila?.saldo ?? 0, transferido: false });
    }

    // Solo se transfiere DESDE una cuenta anónima. Si no, cualquiera con dos
    // cuentas reales podría vaciar una para llenar otra.
    if (!origen.is_anonymous) {
      return json({ error: 'El origen no es una cuenta anónima' }, 403);
    }

    const { data: saldo, error } = await supabase.rpc('transferir_creditos', {
      p_origen: origen.id,
      p_destino: destino.id,
    });

    if (error) {
      console.error('Error al transferir:', error);
      return json({ error: 'No se pudieron transferir los créditos' }, 500);
    }

    // La cuenta anónima ya no sirve. Si el borrado falla no es grave: quedó en
    // cero y el usuario ya no la usa, así que no bloqueamos la respuesta.
    const { error: errBorrado } = await supabase.auth.admin.deleteUser(origen.id);
    if (errBorrado) console.warn('No se borró la cuenta anónima:', errBorrado);

    console.log(`Transferidos créditos de ${origen.id} a ${destino.id}. Saldo: ${saldo}`);
    return json({ saldo, transferido: true });
  } catch (e) {
    console.error('Error interno:', e);
    return json({ error: 'Error interno' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
