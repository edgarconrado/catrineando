import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { SinCreditosError } from './creditosService';
import { Gender } from '../types';

const MAX_LADO = 1024;
const CARPETA = `${FileSystem.documentDirectory}catrinas`;

/** Abre la cámara frontal. Devuelve el uri de la foto o null si canceló. */
export async function tomarSelfie(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Necesitamos permiso de cámara para tomar la foto');
  }

  const res = await ImagePicker.launchCameraAsync({
    cameraType: ImagePicker.CameraType.front,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.9,
  });

  return res.canceled ? null : res.assets[0].uri;
}

/** Alternativa: elegir una foto ya existente de la galería. */
export async function elegirFoto(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Necesitamos permiso para acceder a tus fotos');
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.9,
  });

  return res.canceled ? null : res.assets[0].uri;
}

/** Redimensiona y comprime: mandar 8 MB por la red no le sirve a nadie. */
async function prepararImagen(uri: string): Promise<string> {
  const contexto = ImageManipulator.manipulate(uri).resize({ width: MAX_LADO });
  const renderizada = await contexto.renderAsync();
  const salida = await renderizada.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.8,
    base64: true,
  });

  if (!salida.base64) throw new Error('No se pudo procesar la foto');
  return salida.base64;
}

/**
 * Manda la foto a la Edge Function y guarda el PNG resultante en el
 * almacenamiento local de la app. Devuelve el uri local de la catrina.
 *
 * Lanza excepción si algo falla: quien la llama decide el fallback.
 */
export async function generarCatrinaDesdeFoto(
  fotoUri: string,
  gender: Gender,
  name: string,
): Promise<string> {
  const imageBase64 = await prepararImagen(fotoUri);

  const { data, error } = await supabase.functions.invoke('generar-catrina', {
    body: { imageBase64, mimeType: 'image/jpeg', gender, name },
  });

  if (error) {
    // 402 = sin creditos. Es distinto a un fallo tecnico: no queremos fallback
    // silencioso, queremos mandar al usuario a comprar.
    const status = (error as any)?.context?.status;
    if (status === 402) throw new SinCreditosError();
    throw error;
  }

  if (!data?.imageBase64) {
    throw new Error(data?.error ?? 'El generador no devolvió imagen');
  }

  await FileSystem.makeDirectoryAsync(CARPETA, { intermediates: true });
  const destino = `${CARPETA}/${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(destino, data.imageBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // La foto original ya cumplió su función: fuera.
  await FileSystem.deleteAsync(fotoUri, { idempotent: true }).catch(() => {});

  return destino;
}

/** Borra el archivo generado (se llama al eliminar un personaje). */
export async function borrarImagenGenerada(uri?: string): Promise<void> {
  if (!uri || !uri.startsWith(CARPETA)) return;
  await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
}
