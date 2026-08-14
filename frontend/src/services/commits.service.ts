import { api } from './api';
import type { Commit, CommitFilters, CommitStats, HeatmapData } from '@/types';

export const commitsService = {
  /**
   * Get all commits with pagination and filters
   */
  async getAll(filters?: CommitFilters): Promise<Commit[]> {
    const response = await api.get<Commit[]>('/commits', { params: filters });
    return response.data;
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