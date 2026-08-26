// supabase/functions/generar-catrina/index.ts
//
// Recibe la selfie del usuario y devuelve su versión Catrín / Catrina.
// La API key vive SOLO aquí, como secret de Supabase. Nunca en la app.
//
//   supabase secrets set GEMINI_API_KEY=xxxxx
//   supabase functions deploy generar-catrina

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
// Revisa el nombre del modelo vigente en ai.google.dev antes de desplegar.
const MODEL = Deno.env.get('GEMINI_IMAGE_MODEL') ?? 'gemini-3.1-flash-image';
const ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const MAX_BYTES = 4 * 1024 * 1024; // la app manda ~200 KB; esto es el techo
const ASPECT_RATIO = Deno.env.get('ASPECT_RATIO') ?? '3:4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

function buildPrompt(gender: 'catrin' | 'catrina'): string {
  const vestuario =
    gender === 'catrin'
      ? 'un traje elegante de tres piezas oscuro con moño o corbatín, y un sombrero de copa adornado con flores'
      : 'un vestido elegante de encaje con cuello alto, y un sombrero de ala ancha adornado con rosas y cempasúchil';

  return [
    // 1. La instrucción es EDITAR, no crear. Esto es lo que preserva la identidad.
    'Edita esta fotografía aplicando maquillaje de calavera de Día de Muertos sobre el rostro de la persona y añadiendo vestuario de catrina.',

    // 2. Maquillaje PARCIAL: la base blanca completa borra las señales por las
    //    que reconocemos una cara (tono de piel, sombras, textura). Dejar piel
    //    visible es lo que mas ayuda al parecido.
    'Maquillaje LIGERO y PARCIAL, estilo maquillaje artístico real, no cobertura total.',
    'Aplica: delineado negro alrededor de los ojos con pétalos pequeños en el borde exterior, una línea fina de costuras solo en las comisuras de la boca, y algunas flores pequeñas de colores en una sien y sobre una ceja.',
    'IMPORTANTE — deja la mayor parte del rostro SIN pintar: el tono de piel natural debe verse en las mejillas, la frente, la nariz y el mentón. NO apliques base blanca cubriendo toda la cara. NO pintes la nariz de negro. La piel real de la persona debe seguir siendo lo dominante en el rostro.',

    // 3. Vestuario.
    `Añade ${vestuario}.`,

    // 4. Lo crítico: es una EDICIÓN de la foto, no una reinterpretación.
    'CRÍTICO — conserva exactamente: la misma persona, los mismos rasgos faciales, la misma forma de rostro y de nariz, los mismos ojos, la misma estructura ósea, el mismo peinado y el mismo tono de piel debajo del maquillaje. El maquillaje es una capa PINTADA ENCIMA de su cara real. No cambies la cara. No la hagas más joven, más delgada, más simétrica ni más atractiva. Si la persona tiene arrugas, lunares, cicatrices, ojeras o rasgos asimétricos, CONSÉRVALOS: son parte de su identidad.',

    // 5. Sin reencuadre: reencuadrar obliga al modelo a redibujar la cara.
    'Conserva el mismo encuadre, el mismo ángulo de cabeza y la misma pose de la fotografía original. No recortes, no acerques ni alejes, no cambies la posición de la persona.',

    // 6. Fotorrealista, NO ilustración. Estilizar destruye el parecido.
    'El resultado debe ser FOTORREALISTA: la misma fotografía con maquillaje y vestuario reales. Conserva la textura de la piel, la iluminación original y la nitidez fotográfica. NO conviertas a ilustración, pintura, caricatura, 3D ni arte digital.',

    // 7. Fondo: se puede tocar sin riesgo para la identidad.
    'Puedes reemplazar el fondo por uno cálido y desenfocado con cempasúchil y papel picado en tonos naranja y morado.',

    // 8. Límites.
    'Sin texto ni marcas de agua. Sin sangre, sin heridas, sin terror. Resultado festivo y celebratorio.',
  ].join(' ');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { imageBase64, mimeType = 'image/jpeg', gender } = await req.json();

    if (!imageBase64 || !gender) {
      return json({ error: 'Faltan imageBase64 o gender' }, 400);
    }
    if (gender !== 'catrin' && gender !== 'catrina') {
      return json({ error: 'gender inválido' }, 400);
    }
    if (imageBase64.length * 0.75 > MAX_BYTES) {
      return json({ error: 'La imagen es demasiado grande' }, 413);
    }

    // --- Autenticación y cuota diaria -----------------------------------
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: 'No autorizado' }, 401);

    // --- Cobro del crédito ----------------------------------------------
    // Se descuenta ANTES de llamar al generador. Si el generador falla, se
    // devuelve más abajo. Al revés (cobrar después) permitiría generar gratis
    // matando la app a media petición.
    const { data: cobrado, error: errCobro } = await supabase.rpc(
      'consumir_credito',
      { p_user: user.id },
    );

    if (errCobro) {
      console.error('Error al consumir crédito:', errCobro);
      return json({ error: 'Error interno', fallback: true }, 500);
    }

    if (!cobrado) {
      return json(
        { error: 'Te quedaste sin créditos 💀', code: 'SIN_CREDITOS' },
        402, // Payment Required
      );
    }

    // --- Llamada al modelo ----------------------------------------------
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
                { text: buildPrompt(gender) },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
            // temperature baja = menos "creatividad" = mas fidelidad al original.
            temperature: Number(Deno.env.get('IMAGE_TEMPERATURE') ?? 0.4),
            // Fijar el aspect ratio al del recorte de la app (3:4) evita que el
            // modelo reencuadre, que es la principal causa de perder el parecido.
            // Si tu modelo no soporta imageConfig, deja ASPECT_RATIO vacio.
            ...(ASPECT_RATIO ? { imageConfig: { aspectRatio: ASPECT_RATIO } } : {}),
          },
        }),
      });
    } catch (errRed) {
      console.error('Fallo de red hacia el proveedor:', errRed);
      await devolver(supabase, user.id);
      return json({ error: 'El generador no respondió', fallback: true }, 502);
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      console.error('Proveedor respondió', res.status, await res.text());
      await devolver(supabase, user.id);
      return json({ error: 'El generador no respondió', fallback: true }, 502);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p.inlineData ?? p.inline_data);
    const b64 = imgPart?.inlineData?.data ?? imgPart?.inline_data?.data;

    if (!b64) {
      // El modelo puede negarse: rostro de menor, contenido bloqueado, etc.
      console.warn('Sin imagen en la respuesta:', JSON.stringify(data).slice(0, 500));
      await devolver(supabase, user.id);
      return json({ error: 'No se pudo generar la imagen', fallback: true }, 422);
    }

    // Registramos SOLO el consumo. Ni la foto ni el resultado se guardan.
    await supabase.from('generaciones').insert({ user_id: user.id, gender });

    const { data: fila } = await supabase
      .from('creditos')
      .select('saldo')
      .eq('user_id', user.id)
      .single();

    return json({
      imageBase64: b64,
      mimeType: 'image/png',
      creditosRestantes: fila?.saldo ?? 0,
    });
  } catch (e) {
    console.error('Error interno:', e);
    return json({ error: 'Error interno', fallback: true }, 500);
  }
});

/** Devuelve el crédito cobrado cuando la generación no se completó. */
async function devolver(supabase: any, userId: string) {
  const { error } = await supabase.rpc('devolver_credito', { p_user: userId });
  if (error) console.error('No se pudo devolver el crédito:', error, userId);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}