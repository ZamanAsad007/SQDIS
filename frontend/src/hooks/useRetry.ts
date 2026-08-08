import { useState, useCallback } from 'react';

export function useRetry<T>(fn: () => Promise<T>, maxAttempts = 3, delayMs = 1000) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const result = await fn();
        setLoading(false);
        return result;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          const finalErr = err instanceof Error ? err : new Error(String(err));
          setError(finalErr);
          setLoading(false);
          throw finalErr;
        }
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempts - 1)));
      }
    }
  }, [fn, maxAttempts, delayMs]);

  return { execute, loading, error };
}
