import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Crea una sesión anónima si no hay ninguna. Sin registro, sin fricción, pero
 * con un user_id estable para poder limitar la cuota diaria en el backend.
 */
export async function asegurarSesion(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      await supabase.auth.signInAnonymously();
    }
  } catch (e) {
    // Sin sesión la app sigue funcionando con las imágenes prediseñadas.
    console.warn('No se pudo iniciar sesión anónima:', e);
  }
}

export const iaDisponible = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
