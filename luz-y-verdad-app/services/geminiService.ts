import { Type } from "@google/genai";
import type { Chat as GeminiChatSDK } from '@google/genai';
import type { YouTubeVideo } from "../types.ts";
import { ai, geminiModelName } from './geminiClient.ts';

export const getVerseExplanation = async (verseReference: string, verseText: string): Promise<string> => {
  if (!ai) throw new Error("API Key not configured.");
  
  const prompt = `Actúa como un pastor y maestro bíblico experto. Proporciona una explicación clara, profunda y práctica del siguiente versículo bíblico. La explicación debe ser doctrinalmente sana, fácil de entender y enfocada en la aplicación personal para la vida cristiana diaria.

Referencia: ${verseReference}
Versículo: "${verseText}"

Por favor, estructura tu respuesta de forma natural y fluida, cubriendo los siguientes puntos:
1.  **Contexto:** Brevemente describe el contexto histórico y literario del pasaje.
2.  **Explicación del Versículo:** Desglosa el significado de las palabras y frases clave.
3.  **Aplicación Práctica:** Ofrece 2-3 puntos concretos sobre cómo aplicar esta verdad en la vida cotidiana.`;

  try {
    const response = await ai.models.generateContent({
      model: geminiModelName,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting verse explanation:", error);
    throw new Error("Lo siento, ha ocurrido un error al intentar generar la explicación.");
  }
};

export const generatePrayer = async (request: string): Promise<string> => {
  if (!ai) throw new Error("API Key not configured.");

  const prompt = `Actúa como un intercesor de oración maduro y sensible. Basado en la siguiente petición, escribe una oración sincera, elocuente y personalizada. Usa un lenguaje bíblico y un tono de reverencia, fe y esperanza. La oración debe reflejar una confianza profunda en el poder y la bondad de Dios.

Petición de Oración: "${request}"`;

  try {
    const response = await ai.models.generateContent({
      model: geminiModelName,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating prayer:", error);
    throw new Error("Lo siento, ha ocurrido un error al generar la oración. Por favor, confía en que Dios escucha tu corazón incluso sin estas palabras.");
  }
};

export const createChristianChat = (): GeminiChatSDK => {
  if (!ai) throw new Error("API Key not configured.");
  
  const systemInstruction = `Eres "Luz Divina", un consejero espiritual cristiano y un compañero de estudio bíblico. Tu propósito es guiar, alentar y enseñar con amor, sabiduría y paciencia, siempre fundamentado en las Sagradas Escrituras.

**Tus Principios:**
1.  **Base Bíblica:** Todas tus respuestas deben estar arraigadas en la Biblia. Cita versículos (con la referencia, ej. Juan 3:16) para respaldar tus afirmaciones siempre que sea apropiado.
2.  **Tono:** Tu comunicación es siempre cálida, empática, amorosa y respetuosa. Eres un refugio seguro, no un juez.
3.  **Doctrina Sana:** Te adhieres a las doctrinas centrales de la fe cristiana (La Trinidad, la deidad de Cristo, la salvación por gracia a través de la fe, la autoridad de la Biblia).
4.  **Sabiduría Práctica:** Ofrece consejos prácticos y aplicables para la vida diaria, no solo conocimiento teológico abstracto.
5.  **Enfoque en la Esperanza:** Siempre busca señalar a los usuarios hacia la esperanza, el perdón y el amor que se encuentran en Jesucristo.
6.  **Lenguaje:** Utiliza un español claro, edificante y accesible para todos. Evita la jerga religiosa excesiva.

**Cómo interactúas:**
-   Cuando te saluden, responde con una bienvenida cálida y una pregunta abierta, como "¿Cómo puedo servirte hoy?" o "¿Hay algo en tu corazón que te gustaría compartir o alguna pregunta sobre la Palabra de Dios?".
-   Si alguien comparte una lucha, responde primero con empatía ("Lamento mucho que estés pasando por esto...") antes de ofrecer consejo bíblico.
-   Si te hacen una pregunta teológica compleja, responde con humildad, explicando las diferentes perspectivas si existen, pero manteniendo una postura ortodoxa.
-   Termina tus conversaciones con una palabra de bendición o aliento.`;

  const chat = ai.chats.create({
    model: geminiModelName,
    config: {
      systemInstruction: systemInstruction,
    },
  });
  return chat;
};

export const searchChristianMusic = async (query: string): Promise<YouTubeVideo[]> => {
  if (!ai) throw new Error("API Key not configured.");
  
  const prompt = `Actúa como un experto en música cristiana. Usando la búsqueda de Google, encuentra hasta 5 videos de YouTube de música cristiana que coincidan con la consulta de búsqueda.

Consulta de búsqueda: "${query}"

**Instrucciones importantes:**
- Si la consulta es genérica (ej. "Dios", "Adoración", "Alabanza"), busca artistas o canciones populares de música cristiana de adoración. Por ejemplo, para "Dios", podrías buscar "Canciones de adoración a Dios".
- Prioriza encontrar "audio oficial", "lyric videos" (videos con letra) o canales de adoración conocidos (ej. Hillsong, Elevation Worship, Maverick City Music, Jesus Adrian Romero, Marcos Witt).

**Formato de respuesta:**
Tu respuesta DEBE ser únicamente un objeto JSON válido, sin ningún texto o markdown adicional (como \`\`\`json). El objeto JSON debe tener una única clave raíz llamada "videos", que es un array de objetos. Cada objeto en el array representa un video y debe tener exactamente las siguientes claves:
- "videoId": (string) El ID único del video de YouTube.
- "title": (string) El título del video.
- "thumbnailUrl": (string) La URL de la imagen en miniatura del video (por ejemplo, de i.ytimg.com).
- "channelTitle": (string) El nombre del canal de YouTube que subió el video.

Si después de tu mejor esfuerzo no se encuentran resultados relevantes, devuelve un objeto JSON con un array "videos" vacío: {"videos": []}.`;

  try {
    const response = await ai.models.generateContent({
      model: geminiModelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonString = response.text.trim();
    const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      jsonString = match[1];
    }
    
    const result = JSON.parse(jsonString);

    if (!result.videos || !Array.isArray(result.videos)) {
       console.warn(`La respuesta de la IA no tuvo el formato esperado. Recibido:`, result);
       return [];
    }

    return result.videos;
  } catch (error) {
    console.error("Error searching for music:", error);
    if (error instanceof SyntaxError) {
        console.error("AI returned invalid JSON:", (error as SyntaxError).message);
        throw new Error("Lo siento, la respuesta de la IA no tuvo un formato JSON válido.");
    }
    throw new Error("Lo siento, ocurrió un problema al buscar la música.");
  }
};