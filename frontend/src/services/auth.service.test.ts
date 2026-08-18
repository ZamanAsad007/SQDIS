import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { api, tokenManager } from './api';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setTokens: vi.fn(),
  tokenManager: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    isTokenExpired: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers user and stores tokens', async () => {
    const mockAuthResponse = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
    };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockAuthResponse });

    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('logins user and returns auth payload', async () => {
    const mockAuthResponse = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      user: { id: 'u-1', email: 'user@test.com', name: 'User' },
    };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockAuthResponse });

    const result = await authService.login({
      email: 'user@test.com',
      password: 'Password123!',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'user@test.com',
      password: 'Password123!',
    });
    expect(result).toEqual(mockAuthResponse);
  });

  it('fetches authenticated user with getMe', async () => {
    const mockUser = { id: 'u-1', email: 'user@test.com', name: 'User', createdAt: '', updatedAt: '' };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

    const result = await authService.getMe();
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockUser);
  });

  it('updates profile via PATCH /auth/profile', async () => {
    const updatedUser = { id: 'u-1', email: 'user@test.com', name: 'Updated Name', createdAt: '', updatedAt: '' };
    vi.mocked(api.patch).mockResolvedValueOnce({ data: updatedUser });

    const result = await authService.updateProfile({ name: 'Updated Name' });
    expect(api.patch).toHaveBeenCalledWith('/auth/profile', { name: 'Updated Name' });
    expect(result).toEqual(updatedUser);
  });

  it('changes password via POST /auth/change-password', async () => {
    const mockRes = { message: 'Password updated successfully' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockRes });

    const result = await authService.changePassword({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    });

    expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
    });
    expect(result).toEqual(mockRes);
  });

  it('logs out and clears tokens', async () => {
    vi.mocked(tokenManager.getRefreshToken).mockReturnValueOnce('mock-refresh');
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await authService.logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'mock-refresh' });
    expect(tokenManager.clearTokens).toHaveBeenCalled();
  });
});
