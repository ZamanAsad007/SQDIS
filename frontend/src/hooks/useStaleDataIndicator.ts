import { useMemo } from 'react';

export function useStaleDataIndicator(dataUpdatedAt?: number, staleThresholdMs = 300000) {
  const isStale = useMemo(() => {
    if (!dataUpdatedAt) return false;
    return Date.now() - dataUpdatedAt > staleThresholdMs;
  }, [dataUpdatedAt, staleThresholdMs]);

  return { isStale };
}
