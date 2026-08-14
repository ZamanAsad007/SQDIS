import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from './useAuth';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'u1', email: 'test@example.com', role: 'DEVELOPER' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

describe('useAuth hook', () => {
  it('returns authenticated user state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });
});
