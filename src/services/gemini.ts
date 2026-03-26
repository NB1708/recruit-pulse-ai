import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

const MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

export function initGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function isGeminiReady(): boolean {
  return genAI !== null;
}

export async function callGemini(prompt: string): Promise<string> {
  if (!genAI) throw new Error('Gemini API key not configured');

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { maxOutputTokens: 1024 } });
      const result = await model.generateContent(prompt);
      console.log(`[Gemini] Success with model: ${modelName}`);
      return result.response.text();
    } catch (e: any) {
      const status = e?.status || e?.httpErrorCode || e?.message || '';
      console.warn(`[Gemini] Model ${modelName} failed:`, status);
      if (String(status).includes('404') || String(status).includes('NOT_FOUND') || String(e?.message).includes('not found')) {
        continue; // try next model
      }
      throw e; // non-404 error, don't retry
    }
  }
  throw new Error('All Gemini models failed. Please check your API key quota.');
}
