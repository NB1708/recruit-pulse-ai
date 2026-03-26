import { useState, useCallback } from 'react';
import { initAI, isAIReady, callAI } from '@/services/ai';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupKey = useCallback((key: string) => {
    initAI(key);
  }, []);

  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    if (!isAIReady()) {
      setError('Please configure your OpenAI API key first.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await callAI(prompt);
      return result;
    } catch (e: any) {
      setError(e.message || 'AI generation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, generate, setupKey, isReady: isAIReady };
}
