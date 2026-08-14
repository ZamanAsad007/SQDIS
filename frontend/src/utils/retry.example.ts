import React from 'react';
import { useRetry } from '@/hooks/useRetry';

export function ExampleRetryUsage() {
  const { execute, loading, error } = useRetry(
    async () => {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
    },
    3,
    1000
  );

  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      { onClick: () => execute(), disabled: loading },
      loading ? 'Retrying...' : 'Run Health Check'
    ),
    error ? React.createElement('p', null, `Error: ${error.message}`) : null
  );
}
