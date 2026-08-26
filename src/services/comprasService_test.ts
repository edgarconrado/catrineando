// src/services/comprasService.ts
//
// STUB — todavía sin RevenueCat.
//
// Metro resuelve los require() en tiempo de compilación, así que no se puede
// importar un paquete "solo si está instalado": o existe, o el bundle no
// compila. Por eso este archivo no menciona react-native-purchases en ningún
// lado. Cuando toque conectar las tiendas, sigue las instrucciones del final.

export const comprasDisponibles = false;

export async function configurarCompras(): Promise<void> {
  // Sin RevenueCat no hay nada que configurar.
}

export async function reidentificarCompras(): Promise<void> {
  // Sin RevenueCat no hay nada que reidentificar.
}

export async function comprar(_productId: string): Promise<void> {
  throw new Error('Las compras todavía no están disponibles');
}

export async function restaurarCompras(): Promise<void> {
  throw new Error('Las compras todavía no están disponibles');
}

export function fueCancelacion(e: any): boolean {
  return Boolean(e?.userCancelled || e?.code === '1');
}

// ---------------------------------------------------------------------------
// PARA ACTIVAR LAS COMPRAS (cuando los productos existan en las tiendas)
// ---------------------------------------------------------------------------
//
// 1. npx expo install react-native-purchases
// 2. Agrega al .env:
//      EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
//      EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxx
// 3. Reemplaza TODO este archivo por comprasService.revenuecat.ts
// 4. npx expo prebuild --clean && npx expo run:android
//
// El contrato es el mismo, así que creditos.tsx no cambia.