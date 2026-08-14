import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus hook', () => {
  it('detects online and offline events', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(typeof result.current.isOnline).toBe('boolean');

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
