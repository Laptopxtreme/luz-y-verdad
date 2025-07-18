import { Type } from "@google/genai";
import type { BibleVerse } from '../types.ts';
import { ai, geminiModelName } from './geminiClient.ts';

const referenceRegex = /^\d?\s*[a-zA-ZáéíóúÁÉÍÓÚ]+\s*\d+([:.]\s*\d+)?\s*$/;

const verseResponseSchema = {
  type: Type.OBJECT,
  properties: {
    reference: { type: Type.STRING, description: "La referencia canónica del pasaje, ej. 'Juan 3:16' o 'Resultados para \"amor de Dios\"'." },
    text: { type: Type.STRING, description: "El texto del versículo o los resultados de la búsqueda." },
    translation_name: { type: Type.STRING, description: "El nombre de la traducción, que siempre debe ser 'Reina Valera 1960'." },
  },
  required: ['reference', 'text', 'translation_name'],
};

export const searchVerse = async (query: string): Promise<BibleVerse> => {
  if (!ai) throw new Error("API Key not configured.");
  
  if (!query.trim()) {
    throw new Error('La consulta de búsqueda no puede estar vacía.');
  }

  const isReference = referenceRegex.test(query.trim());
  let prompt = '';

  if (isReference) {
    prompt = `Actúa como una base de datos bíblica precisa. Busca el siguiente pasaje en la versión Reina Valera 1960 y devuelve el texto.

**Pasaje a buscar:** "${query}"

**Instrucciones de formato:**
Tu respuesta DEBE ser únicamente un objeto JSON que se ajuste al esquema proporcionado. No incluyas markdown (es decir, \`\`\`json).
El objeto JSON debe tener esta estructura:
- \`reference\`: La referencia canónica del pasaje encontrado (ej. "Juan 3:16").
- \`text\`: El texto completo del versículo o pasaje.
- \`translation_name\`: El nombre de la traducción, que debe ser "Reina Valera 1960".

Si no puedes encontrar el pasaje exacto, devuelve un JSON con un mensaje de error claro en la propiedad 'text' y "Referencia no encontrada" en 'reference'.`;
  } else {
    prompt = `Actúa como un motor de búsqueda bíblico. Busca en la versión Reina Valera 1960 pasajes que contengan la siguiente frase clave. Devuelve los 3 resultados más relevantes.

**Frase clave:** "${query}"

**Instrucciones de formato:**
Tu respuesta DEBE ser únicamente un objeto JSON que se ajuste al esquema proporcionado. No incluyas markdown (es decir, \`\`\`json).
El objeto JSON debe tener esta estructura:
- \`reference\`: Una cadena de texto que diga "Resultados para '${query}'".
- \`text\`: Una única cadena de texto que contenga los 3 versículos encontrados. Cada versículo debe estar precedido por su referencia entre paréntesis (ej. "(Juan 3:16) ...") y separados por dos saltos de línea ("\\n\\n").
- \`translation_name\`: El nombre de la traducción, que debe ser "Reina Valera 1960".

Si no encuentras ningún versículo, devuelve un JSON con un mensaje de error claro en la propiedad 'text' y "Sin resultados" en 'reference'.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: geminiModelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: verseResponseSchema,
      }
    });

    const jsonString = response.text;
    const result: BibleVerse = JSON.parse(jsonString);

    if (!result.text || !result.reference || result.text.toLowerCase().includes('error')) {
      throw new Error(`No se pudo encontrar un resultado para "${query}".`);
    }

    return result;

  } catch (error: any) {
    console.error("Bible service error using Gemini:", error);
    throw new Error(`Hubo un problema al buscar en la Biblia con la IA.`);
  }
};