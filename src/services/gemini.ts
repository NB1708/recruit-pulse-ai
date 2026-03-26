import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function initGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function isGeminiReady(): boolean {
  return genAI !== null;
}

export async function callGemini(prompt: string): Promise<string> {
  if (!genAI) throw new Error('Gemini API key not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { maxOutputTokens: 1024 } });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
