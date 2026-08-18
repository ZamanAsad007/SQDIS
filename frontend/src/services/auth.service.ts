import { api, setTokens, tokenManager } from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Organization,
  SwitchOrganizationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types';

export const authService = {
  /**
   * Register a new user with email/password
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const name =
      data.name?.trim() ||
      [data.firstName, data.lastName].filter(Boolean).join(' ').trim() ||
      data.email.split('@')[0];

    const response = await api.post<AuthResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      name,
    });

    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  /**
   * Login with email/password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Update profile information for current authenticated user
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },

  /**
   * Change password for current authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Alias for getMe - backward compatibility
   */
  async getProfile(): Promise<User> {
    return this.getMe();
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      tokenManager.clearTokens();
    }
  },

  /**
   * Request a password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password using a valid reset token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>('/auth/google');
    return response.data;
  },

  /**
   * Get GitHub OAuth URL
   */
  async getGitHubAuthUrl(): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>('/auth/github');
    return response.data;
  },

  /**
   * Get all organizations for the current user
   */
  async getOrganizations(): Promise<Organization[]> {
    const response = await api.get<Organization[]>('/auth/organizations');
    return response.data;
  },

  /**
   * Switch to a different organization context
   */
  async switchOrganization(data: SwitchOrganizationRequest | string): Promise<AuthResponse> {
    const payload: SwitchOrganizationRequest =
      typeof data === 'string' ? { organizationId: data } : data;
    const response = await api.post<AuthResponse>('/auth/switch-organization', payload);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  },

  /**
   * Check if access token is expired
   */
  isTokenExpired(): boolean {
    const token = tokenManager.getAccessToken();
    return !token || tokenManager.isTokenExpired(token);
  },
};

export default authService;