import { useState, useCallback } from 'react';
import { initGemini, isGeminiReady, callGemini } from '@/services/gemini';

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupKey = useCallback((key: string) => {
    initGemini(key);
  }, []);

  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    if (!isGeminiReady()) {
      setError('Please configure your Gemini API key first.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await callGemini(prompt);
      return result;
    } catch (e: any) {
      setError(e.message || 'AI generation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, generate, setupKey, isReady: isGeminiReady };
}
