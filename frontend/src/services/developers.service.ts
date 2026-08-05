import { api } from './api';
import type { Developer, DeveloperStats, LeaderboardEntry, LeaderboardQuery } from '@/types';

export const developersService = {
  /**
   * Get all developers for the organization
   */
  async getAll(): Promise<Developer[]> {
    // The developers endpoint is accessed via leaderboard or org members
    const response = await api.get<Developer[]>('/leaderboard', { params: { limit: 100 } });
    return response.data as unknown as Developer[];
  },

  /**
   * Get developer by ID
   */
  async getById(id: string): Promise<Developer> {
    const response = await api.get<Developer>(`/developers/${id}`);
    return response.data;
  },

  /**
   * Get developer stats including DQS, commits, reviews, coverage
   */
  async getStats(id: string): Promise<DeveloperStats> {
    const response = await api.get<DeveloperStats>(`/developers/${id}/stats`);
    return response.data;
  },

  /**
   * Get developer leaderboard
   */
  async getLeaderboard(query?: LeaderboardQuery): Promise<LeaderboardEntry[]> {
    const response = await api.get<LeaderboardEntry[]>('/leaderboard', { params: query });
    return response.data;
  },
};

export default developersService;