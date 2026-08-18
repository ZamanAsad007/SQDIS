import { api } from './api';
import type { Repository } from '@/types';

export const repositoriesService = {
  /**
   * Get all repositories for the current organization
   */
  async getAll(): Promise<Repository[]> {
    try {
      const response = await api.get<Repository[]>('/github/repositories');
      return response.data || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return [];
      }
      throw err;
    }
  },

  /**
   * Update repository tracking settings
   */
  async update(id: string, data: { isActive?: boolean; defaultBranch?: string }): Promise<Repository> {
    const response = await api.patch<Repository>(`/github/repositories/${id}`, data);
    return response.data;
  },

  /**
   * Sync a single repository
   */
  async sync(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(`/github/repositories/${id}/sync`);
    return response.data;
  },

  /**
   * Sync all active repositories
   */
  async syncAll(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/github/repositories/sync-all');
    return response.data;
  },

  /**
   * Enable repository tracking
   */
  async enable(id: string, data: { defaultBranch?: string; webhookSecret?: string; autoBackfill?: boolean }): Promise<Repository> {
    const response = await api.post<Repository>(`/github/repositories/${id}/enable`, data);
    return response.data;
  },

  /**
   * Disable repository tracking
   */
  async disable(id: string): Promise<void> {
    await api.delete(`/github/repositories/${id}/disable`);
  },

  /**
   * Trigger backfill for repository commits
   */
  async triggerBackfill(id: string, days?: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `/github/repositories/${id}/backfill`,
      null,
      { params: { days } }
    );
    return response.data;
  },

  /**
   * Get backfill status for repository
   */
  async getBackfillStatus(id: string): Promise<{
    isRunning: boolean;
    lastRunAt?: string;
    lastStatus?: string;
    commitsProcessed?: number;
  }> {
    const response = await api.get<{
      isRunning: boolean;
      lastRunAt?: string;
      lastStatus?: string;
      commitsProcessed?: number;
    }>(`/github/repositories/${id}/backfill/status`);
    return response.data;
  },
};

export default repositoriesService;