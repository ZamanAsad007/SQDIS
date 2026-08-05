import { api } from './api';
import type {
  GitHubConnectionStatus,
  ConnectGitHubRequest,
  WebhookLogEntry,
  WebhookHealthMetric,
} from '@/types';

export const githubService = {
  /**
   * Get GitHub connection status
   */
  async getStatus(): Promise<GitHubConnectionStatus> {
    const response = await api.get<GitHubConnectionStatus>('/github/status');
    return response.data;
  },

  /**
   * Connect GitHub PAT to organization
   */
  async connect(data: ConnectGitHubRequest): Promise<GitHubConnectionStatus> {
    const response = await api.post<GitHubConnectionStatus>('/github/connect', data);
    return response.data;
  },

  /**
   * Disconnect GitHub from organization
   */
  async disconnect(): Promise<void> {
    await api.delete('/github/disconnect');
  },

  /**
   * Validate GitHub PAT without connecting
   */
  async validatePAT(pat: string): Promise<{ valid: boolean; scopes?: string[]; message?: string }> {
    const response = await api.post<{ valid: boolean; scopes?: string[]; message?: string }>('/github/validate', { pat });
    return response.data;
  },

  /**
   * Query webhook delivery logs
   */
  async getWebhookLogs(query?: Record<string, unknown>): Promise<WebhookLogEntry[]> {
    const response = await api.get<WebhookLogEntry[]>('/github/webhooks/logs', { params: query });
    return response.data;
  },

  /**
   * Get webhook health metrics
   */
  async getWebhookHealth(period?: string): Promise<WebhookHealthMetric[]> {
    const response = await api.get<WebhookHealthMetric[]>('/github/webhooks/health', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Update webhooks for all enabled repositories
   */
  async refreshWebhooks(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/github/webhooks/refresh');
    return response.data;
  },

  /**
   * Test webhook connectivity
   */
  async testWebhookConnectivity(repositoryId: string): Promise<{ success: boolean; message: string; repositoryName?: string }> {
    const response = await api.post<{ success: boolean; message: string; repositoryName?: string }>(
      '/github/webhooks/test-connectivity',
      { repositoryId }
    );
    return response.data;
  },
};

export default githubService;