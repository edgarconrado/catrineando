// src/services/comprasService.revenuecat.ts
//
// Versión real. Renombra este archivo a comprasService.ts DESPUÉS de correr:
//   npx expo install react-native-purchases

import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

const RC_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

export const comprasDisponibles = Boolean(RC_API_KEY);

/**
 * Inicializa RevenueCat con el user_id de Supabase como appUserID.
 * CRÍTICO: el webhook usa ese id para saber a quién acreditar. Si dejas que
 * RevenueCat genere el suyo, las compras llegan con un id que no existe en
 * auth.users y se descartan — el usuario paga y no recibe nada.
 */
export async function configurarCompras(): Promise<void> {
  if (!comprasDisponibles) return;

  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await Purchases.configure({
      apiKey: RC_API_KEY!,
      appUserID: data.user.id,
    });
  } catch (e) {
    console.warn('No se pudo configurar RevenueCat:', e);
  }
}

/** Tras iniciar sesión cambia el user_id: hay que avisarle a RevenueCat. */
export async function reidentificarCompras(): Promise<void> {
  if (!comprasDisponibles) return;
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user) await Purchases.logIn(data.user.id);
  } catch (e) {
    console.warn('No se pudo reidentificar en RevenueCat:', e);
  }
}

/**
 * Lanza el flujo de compra nativo. Los créditos NO se abonan aquí: llegan por
 * el webhook. Esto solo confirma que la compra se completó.
 */
export async function comprar(productId: string): Promise<void> {
  if (!comprasDisponibles) {
    throw new Error('Las compras todavía no están disponibles');
  }

  const productos = await Purchases.getProducts([productId]);
  if (!productos.length) {
    throw new Error(`El producto ${productId} no existe en la tienda`);
  }

  await Purchases.purchaseStoreProduct(productos[0]);
}

/** Apple exige ofrecer esto para aprobar la app. */
export async function restaurarCompras(): Promise<void> {
  if (!comprasDisponibles) {
    throw new Error('Las compras todavía no están disponibles');
  }
  await Purchases.restorePurchases();
}

/** ¿El usuario canceló el diálogo? No es un error que valga la pena mostrar. */
export function fueCancelacion(e: any): boolean {
  return Boolean(e?.userCancelled || e?.code === '1');
}
