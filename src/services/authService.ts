// src/services/authService.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

/**
 * Configura Google Sign-In. Llamar una vez al arrancar la app.
 *
 * webClientId es el ID de cliente tipo "Aplicación web" de Google Cloud — el
 * mismo que pegas en el provider de Google en Supabase. NO el de Android:
 * ese es el error más común y produce un "DEVELOPER_ERROR" sin más pistas.
 */
export function configurarGoogle() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
}

/** ¿Está disponible Sign in with Apple? (solo iOS 13+) */
export async function appleDisponible(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

/**
 * Guarda el token de la sesión anónima ANTES de iniciar sesión, para poder
 * transferir los créditos después. Si no había sesión anónima, devuelve null.
 */
async function capturarTokenAnonimo(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  // @ts-expect-error is_anonymous existe en el user aunque el tipo no lo declare
  return session.user?.is_anonymous ? session.access_token : null;
}

/**
 * Mueve el saldo de la cuenta anónima a la permanente.
 * Nunca lanza: si falla, el login ya ocurrió y no queremos deshacerlo.
 */
async function transferirCreditos(tokenAnonimo: string | null): Promise<number | null> {
  if (!tokenAnonimo) return null;

  try {
    const { data, error } = await supabase.functions.invoke('transferir-creditos', {
      body: { tokenAnonimo },
    });
    if (error) throw error;
    return data?.saldo ?? null;
  } catch (e) {
    console.warn('No se pudieron transferir los créditos:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Apple
// ---------------------------------------------------------------------------
export async function entrarConApple(): Promise<void> {
  const tokenAnonimo = await capturarTokenAnonimo();

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple no devolvió el token de identidad');
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;

  await transferirCreditos(tokenAnonimo);
}

// ---------------------------------------------------------------------------
// Google
// ---------------------------------------------------------------------------
export async function entrarConGoogle(): Promise<void> {
  const tokenAnonimo = await capturarTokenAnonimo();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const respuesta = await GoogleSignin.signIn();

  // La API v13+ devuelve { type, data }; versiones viejas devuelven el user plano.
  const idToken =
    (respuesta as any)?.data?.idToken ?? (respuesta as any)?.idToken;

  if (!idToken) throw new Error('Google no devolvió el token de identidad');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) throw error;

  await transferirCreditos(tokenAnonimo);
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------
export async function cerrarSesion(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // No pasa nada si no había sesión de Google.
  }
  await supabase.auth.signOut();
  // Al cerrar sesión volvemos a anónimo para que la app siga usable.
  await supabase.auth.signInAnonymously();
}

/** ¿La sesión actual es una cuenta real o todavía anónima? */
export async function tieneCuentaPermanente(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  // @ts-expect-error is_anonymous no está en el tipo público
  return !data.user.is_anonymous;
}

/** Traduce los errores de Google a algo que se le pueda mostrar al usuario. */
export function mensajeDeError(e: any): string {
  switch (e?.code) {
    case statusCodes.SIGN_IN_CANCELLED:
    case 'ERR_REQUEST_CANCELED':
      return '';  // el usuario canceló: no mostrar nada
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return 'Necesitas Google Play Services actualizado';
    case statusCodes.IN_PROGRESS:
      return 'Ya hay un inicio de sesión en curso';
    default:
      return e?.message ?? 'No se pudo iniciar sesión';
  }
}
