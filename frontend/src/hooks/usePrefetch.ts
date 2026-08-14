import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchQuery = useCallback(
    (key: unknown[], fn: () => Promise<any>, staleTime = 1000 * 60 * 5) => {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: fn,
        staleTime,
      });
    },
    [queryClient]
  );

  return { prefetchQuery };
}
