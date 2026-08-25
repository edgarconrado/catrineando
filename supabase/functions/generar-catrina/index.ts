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

const MAX_POR_DIA = Number(Deno.env.get('MAX_POR_DIA') ?? 5);
const MAX_BYTES = 4 * 1024 * 1024; // la app manda ~200 KB; esto es el techo

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

function buildPrompt(gender: 'catrin' | 'catrina'): string {
  const personaje =
    gender === 'catrin'
      ? 'un Catrín mexicano: traje elegante de tres piezas, moño o corbatín, sombrero de copa adornado con flores'
      : 'una Catrina mexicana: vestido elegante de encaje, sombrero de ala ancha adornado con rosas y cempasúchil, velo de encaje';

  return [
    `Transforma a la persona de la foto en ${personaje}, al estilo del Día de Muertos mexicano.`,
    'Aplica maquillaje artístico de calavera sobre su rostro: base blanca, cuencas de los ojos decoradas con pétalos y líneas negras, nariz sombreada en forma de corazón invertido, costuras estilizadas en las comisuras de la boca, telarañas finas y flores de colores en la frente y las mejillas.',
    'MUY IMPORTANTE: conserva la identidad de la persona. Mismos rasgos faciales, misma forma de rostro, mismo peinado, mismo tono de piel. Es maquillaje pintado sobre su cara real, NO otra persona y NO un cráneo.',
    'Retrato de medio cuerpo, iluminación cálida de vela, fondo desenfocado con cempasúchil y papel picado. Paleta naranja, morado, turquesa y dorado.',
    'Estilo: ilustración digital pintada a mano, festiva y colorida, celebratoria. Sin texto, sin marcas de agua, sin sangre ni terror.',
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

    const hoy = new Date().toISOString().slice(0, 10);
    const { count } = await supabase
      .from('generaciones')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${hoy}T00:00:00Z`);

    if ((count ?? 0) >= MAX_POR_DIA) {
      return json(
        { error: `Ya usaste tus ${MAX_POR_DIA} catrinas de hoy 💀 Vuelve mañana.` },
        429,
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
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      console.error('Proveedor respondió', res.status, await res.text());
      return json({ error: 'El generador no respondió', fallback: true }, 502);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p.inlineData ?? p.inline_data);
    const b64 = imgPart?.inlineData?.data ?? imgPart?.inline_data?.data;

    if (!b64) {
      // El modelo puede negarse: rostro de menor, contenido bloqueado, etc.
      console.warn('Sin imagen en la respuesta:', JSON.stringify(data).slice(0, 500));
      return json({ error: 'No se pudo generar la imagen', fallback: true }, 422);
    }

    // Registramos SOLO el consumo. Ni la foto ni el resultado se guardan.
    await supabase.from('generaciones').insert({ user_id: user.id, gender });

    return json({ imageBase64: b64, mimeType: 'image/png' });
  } catch (e) {
    console.error('Error interno:', e);
    return json({ error: 'Error interno', fallback: true }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
