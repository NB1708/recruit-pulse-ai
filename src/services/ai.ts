import OpenAI from 'openai';

let client: OpenAI | null = null;

export function initAI(apiKey: string) {
  client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export function isAIReady(): boolean {
  return client !== null;
}

export async function callAI(prompt: string): Promise<string> {
  if (!client) throw new Error('OpenAI API key not configured');
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || '';
}
