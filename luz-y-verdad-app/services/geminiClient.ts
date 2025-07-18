import { GoogleGenAI } from "@google/genai";

const API_KEY = (window as any).process?.env?.API_KEY;

let aiInstance: GoogleGenAI | null = null;
let apiKeyIsMissing = false;

if (!API_KEY || API_KEY === 'PEGA_TU_API_KEY_AQUI') {
    apiKeyIsMissing = true;
} else {
    try {
        aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.error("Error initializing GoogleGenAI:", e);
        apiKeyIsMissing = true;
    }
}

export const ai = aiInstance;
export const isApiKeyMissing = apiKeyIsMissing;
export const geminiModelName = 'gemini-2.5-flash';
