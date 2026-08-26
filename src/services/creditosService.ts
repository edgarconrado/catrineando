// src/services/creditosService.ts
import { supabase } from '../lib/supabase';

/** Error que lanza catrinaService cuando el backend responde 402. */
export class SinCreditosError extends Error {
  constructor(mensaje = 'Te quedaste sin créditos') {
    super(mensaje);
    this.name = 'SinCreditosError';
    // Sin esto, `instanceof` devuelve false: extender clases nativas pierde
    // la cadena de prototipos al transpilar. Trampa clásica de TypeScript.
    Object.setPrototypeOf(this, SinCreditosError.prototype);
  }
}

export interface Paquete {
  id: string;          // debe coincidir con el product_id de la tienda
  creditos: number;
  precio: string;      // solo para mostrar mientras no haya tienda conectada
  etiqueta?: string;
  ahorro?: string;
}

export const PAQUETES: Paquete[] = [
  { id: 'catrinas_5',  creditos: 5,  precio: '$29 MXN' },
  { id: 'catrinas_15', creditos: 15, precio: '$69 MXN', etiqueta: 'Más popular', ahorro: 'Ahorras 20%' },
  { id: 'catrinas_40', creditos: 40, precio: '$149 MXN', ahorro: 'Ahorras 35%' },
];

/**
 * Lee el saldo del usuario actual. La política RLS permite que cada quien vea
 * el suyo; escribir solo puede el service role desde las Edge Functions.
 */
export async function obtenerSaldo(): Promise<number> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;

  const { data, error } = await supabase
    .from('creditos')
    .select('saldo')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) {
    console.warn('No se pudo leer el saldo:', error);
    return 0;
  }

  return data?.saldo ?? 0;
}
