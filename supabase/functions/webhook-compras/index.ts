// supabase/functions/webhook-compras/index.ts
//
// Recibe los eventos de RevenueCat cuando alguien compra créditos y los abona
// en Supabase. Es el ÚNICO camino por el que entran créditos pagados.
//
//   supabase secrets set REVENUECAT_WEBHOOK_SECRET=algo-largo-y-aleatorio
//   supabase functions deploy webhook-compras --no-verify-jwt
//
// El --no-verify-jwt es necesario: quien llama es RevenueCat, no un usuario
// con sesión. La autenticación va por el header compartido de abajo.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;

// Cuántos créditos da cada producto. Estos IDs deben coincidir EXACTAMENTE
// con los consumibles que des de alta en App Store Connect y Play Console.
const PAQUETES: Record<string, number> = {
  'catrinas_5': 5,
  'catrinas_15': 15,
  'catrinas_40': 40,
};

// Eventos que otorgan créditos. Los consumibles llegan como NON_RENEWING_PURCHASE.
const EVENTOS_COMPRA = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE']);

Deno.serve(async (req) => {
  // --- Autenticación del webhook ----------------------------------------
  // RevenueCat manda el valor que configures en su dashboard tal cual.
  const auth = req.headers.get('Authorization') ?? '';
  if (auth !== WEBHOOK_SECRET) {
    console.warn('Webhook con secret inválido');
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const body = await req.json();
    const evento = body?.event;

    if (!evento) return new Response('Sin evento', { status: 400 });

    const tipo: string = evento.type;

    // Devoluciones: la tienda reembolsó, quitamos lo que se abonó.
    if (tipo === 'CANCELLATION' || tipo === 'REFUND') {
      console.log('Reembolso recibido:', evento.id, evento.app_user_id);
      // Se registra pero no se descuenta automáticamente: si el usuario ya
      // consumió los créditos, restarlos dejaría el saldo negativo y el CHECK
      // de la tabla rechazaría el update. Revísalo a mano por ahora.
      return new Response('ok', { status: 200 });
    }

    if (!EVENTOS_COMPRA.has(tipo)) {
      // Eventos que no nos interesan (TEST, TRANSFER, etc.)
      return new Response('ok', { status: 200 });
    }

    const userId: string = evento.app_user_id;
    const productId: string = evento.product_id;
    const transactionId: string = evento.transaction_id ?? evento.id;
    const store: string = evento.store ?? 'unknown';

    const creditos = PAQUETES[productId];

    if (!creditos) {
      console.error('Producto desconocido:', productId);
      // 200 a propósito: si devolvemos error, RevenueCat reintenta para siempre.
      return new Response('ok', { status: 200 });
    }

    if (!isUuid(userId)) {
      console.error('app_user_id no es un UUID de Supabase:', userId);
      return new Response('ok', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // otorgar_creditos es idempotente por transaction_id: si RevenueCat
    // reenvía el mismo evento (lo hace ante cualquier duda), no duplica.
    const { data: saldo, error } = await supabase.rpc('otorgar_creditos', {
      p_user: userId,
      p_transaction_id: transactionId,
      p_product_id: productId,
      p_creditos: creditos,
      p_store: store,
    });

    if (error) {
      console.error('Error al otorgar créditos:', error);
      // Aquí SÍ conviene un 500: queremos que RevenueCat reintente, porque el
      // usuario ya pagó y todavía no tiene sus créditos.
      return new Response('Error al acreditar', { status: 500 });
    }

    console.log(`Acreditados ${creditos} a ${userId}. Saldo: ${saldo}`);
    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('Error en el webhook:', e);
    return new Response('Error interno', { status: 500 });
  }
});

function isUuid(v: unknown): boolean {
  return typeof v === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
