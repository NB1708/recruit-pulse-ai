import Groq from 'groq-sdk';

let client: Groq | null = null;

export function initAI(apiKey: string) {
  client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
}

export function isAIReady(): boolean {
  return client !== null;
}

export async function callAI(prompt: string): Promise<string> {
  if (!client) throw new Error('Groq API key not configured');
  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || '';
}
