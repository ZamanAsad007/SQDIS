import { api } from './api';
import type { Commit, CommitFilters, CommitStats, HeatmapData } from '@/types';

export const commitsService = {
  /**
   * Get all commits with pagination and filters
   */
  async getAll(filters?: CommitFilters): Promise<Commit[]> {
    const params = filters
      ? { ...filters, limit: filters.limit ?? filters.pageSize ?? 20 }
      : undefined;
    const response = await api.get<any>('/commits', { params });
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.data)) return raw.data;
      if (Array.isArray(raw.commits)) return raw.commits;
      if (Array.isArray(raw.items)) return raw.items;
    }
    return [];
  },

  /**
   * Get commit statistics
   */
  async getStats(query?: Record<string, unknown>): Promise<CommitStats> {
    const response = await api.get<CommitStats>('/commits/stats', { params: query });
    return response.data;
  },

  /**
   * Get churn heatmap data for a repository
   */
  async getHeatmap(repositoryId: string): Promise<HeatmapData> {
    const response = await api.get<HeatmapData>('/commits/heatmap', {
      params: { repositoryId },
    });
    return response.data;
  },

  /**
   * Get commit by ID
   */
  async getById(id: string): Promise<Commit> {
    const response = await api.get<Commit>(`/commits/${id}`);
    return response.data;
  },
};

export default commitsService;