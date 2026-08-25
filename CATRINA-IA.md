# Catrineando · foto real → catrina generada

Guía para dejar funcionando la nueva función. Todo el flujo viejo (nombre +
personaje prediseñado) sigue igual: la foto es opcional y si algo falla, la app
cae de vuelta a las imágenes de `assets/images/catrinas|catrines`.

## 1. Instalar dependencias

```bash
npx expo install expo-image-picker expo-image-manipulator expo-file-system \
  expo-media-library @supabase/supabase-js react-native-url-polyfill
```

`expo-image-picker` es un módulo nativo: **no funciona en Expo Go**. Necesitas
development build:

```bash
npx expo prebuild
npx expo run:android    # o eas build --profile development
```

## 2. Variables de entorno

```bash
cp .env.example .env
```

Llena `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Si las dejas
vacías, `iaDisponible` queda en `false` y la sección de foto simplemente no
aparece — la app funciona como antes.

## 3. Supabase

**Auth anónima**: dashboard → Authentication → Providers → Anonymous sign-ins →
activar. Es lo que da un `user_id` sin obligar a registrarse.

**Tabla de cuota**:

```bash
supabase db push        # aplica supabase/migrations/20260825000000_generaciones.sql
```

**Secrets y deploy de la función**:

```bash
supabase secrets set GEMINI_API_KEY=tu_api_key
supabase functions deploy generar-catrina
```

La API key de Gemini se saca en [aistudio.google.com](https://aistudio.google.com).
Si prefieres otro proveedor (OpenAI, Replicate, fal), solo cambias el `fetch` de
`supabase/functions/generar-catrina/index.ts`: el contrato con la app es
`{ imageBase64, mimeType, gender, name } → { imageBase64 }`.

## 4. Qué cambió en el código

| Archivo | Cambio |
|---|---|
| `src/lib/supabase.ts` | **nuevo** — cliente + `asegurarSesion()` anónima |
| `src/services/catrinaService.ts` | **nuevo** — cámara, compresión, llamada, guardado local |
| `supabase/functions/generar-catrina/` | **nuevo** — proxy con la API key y la cuota |
| `src/app/form.tsx` | botones de foto, consentimiento, preview |
| `src/app/loading.tsx` | generación real con fallback (ya no es `setTimeout`) |
| `src/app/result.tsx` | muestra la imagen generada + marca de agua |
| `src/app/(tabs)/galery.tsx` | miniaturas con la imagen generada |
| `src/components/CharacterImage.tsx` | prop `imageUri` con prioridad sobre las prediseñadas |
| `src/components/hooks/CharacterContext.tsx` | `updateCharacter()` + borrado del archivo al eliminar |
| `src/types.ts` | `imageUri`, `fromPhoto` |
| `app.json` | plugins y permisos de cámara/galería |

## 5. Costo

Con Nano Banana (Gemini Flash Image) andas en **$0.04–0.07 USD por imagen** a 1K.
Mil catrinas ≈ 50–70 dólares. El límite de 5 al día por usuario está en
`MAX_POR_DIA` de la Edge Function; súbelo o bájalo según tu presupuesto, pero no
lo quites: una app de Día de Muertos que se viraliza sin cuota te puede dejar una
factura seria.

Si el volumen crece: baja la resolución (`MAX_LADO` en el servicio), o cambia a
un modelo más barato tipo Imagen Fast (~$0.02).

## 6. Antes de publicar

- [ ] Aviso de privacidad público (URL) para App Store y Play Store.
- [ ] En Data Safety / Privacy Labels: declaras que **procesas** fotos pero
      **no las almacenas**. Es cierto — la Edge Function no guarda nada y el
      servicio borra el archivo local después de generar.
- [ ] Rostros son datos personales sensibles bajo la LFPDPPP. El diálogo de
      consentimiento antes de la primera foto está en `form.tsx`; si un abogado
      te pide más, ahí es donde se amplía.
- [ ] Probar el caso de negativa del modelo: si Gemini se niega (pasa con
      fotos de menores), la app cae al personaje clásico sin mostrar error.
      Vale la pena verificarlo a mano.

## 7. Ideas para después

- **Slider antes/después** en `result.tsx`. Es lo que la gente comparte.
- **Guía de encuadre** (óvalo en pantalla) antes de disparar: las selfies mal
  encuadradas dan resultados notablemente peores.
- **Varios estilos**: catrina tradicional, alebrije, José Guadalupe Posada. Es
  solo cambiar el prompt, y multiplica la razón para volver a abrir la app.
- **Guardar en galería** con `expo-media-library` (ya está la dependencia) en
  vez de solo compartir.
