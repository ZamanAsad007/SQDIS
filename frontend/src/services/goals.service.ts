import { api } from './api';
import type {
  Goal,
  GoalFilters,
  GoalsDashboardData,
  GoalListResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateKeyResultRequest,
  UpdateKeyResultRequest,
  KeyResult,
  GoalTemplate,
  GoalAchievement,
  GoalSnapshot,
  GoalHistoryEntry,
  GoalAchievementRatePoint,
  TeamGoalComparison,
} from '@/types';

export const goalsService = {
  /**
   * Get goals dashboard with all active goals
   */
  async getDashboard(filters?: Record<string, unknown>): Promise<GoalsDashboardData> {
    const response = await api.get<GoalsDashboardData>('/goals/dashboard', { params: filters });
    return response.data;
  },

  /**
   * Get all goals with filters
   */
  async getAll(filters?: GoalFilters): Promise<GoalListResponse> {
    const response = await api.get<GoalListResponse>('/goals', { params: filters });
    return response.data;
  },

  /**
   * Get goal by ID
   */
  async getById(id: string): Promise<Goal> {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  /**
   * Create a new goal
   */
  async create(data: CreateGoalRequest): Promise<Goal> {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  /**
   * Update a goal
   */
  async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    const response = await api.patch<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  /**
   * Delete a goal
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },

  /**
   * Get real-time goal progress
   */
  async getProgress(id: string): Promise<{ progress: number; currentValue?: number; targetValue?: number }> {
    const response = await api.get<{ progress: number; currentValue?: number; targetValue?: number }>(
      `/goals/${id}/progress`
    );
    return response.data;
  },

  /**
   * Get OKR summary for a goal
   */
  async getOKRSummary(id: string): Promise<{ weightedProgress: number; keyResults: KeyResult[] }> {
    const response = await api.get<{ weightedProgress: number; keyResults: KeyResult[] }>(
      `/goals/${id}/okr-summary`
    );
    return response.data;
  },

  /**
   * Add a key result to a goal
   */
  async addKeyResult(id: string, data: CreateKeyResultRequest): Promise<KeyResult> {
    const response = await api.post<KeyResult>(`/goals/${id}/key-results`, data);
    return response.data;
  },

  /**
   * Update a key result
   */
  async updateKeyResult(goalId: string, keyResultId: string, data: UpdateKeyResultRequest): Promise<KeyResult> {
    const response = await api.patch<KeyResult>(`/goals/${goalId}/key-results/${keyResultId}`, data);
    return response.data;
  },

  /**
   * Delete a key result
   */
  async deleteKeyResult(goalId: string, keyResultId: string): Promise<void> {
    await api.delete(`/goals/${goalId}/key-results/${keyResultId}`);
  },

  /**
   * Get all goal templates
   */
  async getTemplates(): Promise<GoalTemplate[]> {
    const response = await api.get<GoalTemplate[]>('/goals/templates');
    return response.data;
  },

  /**
   * Get goal history
   */
  async getHistory(filters?: GoalFilters): Promise<GoalHistoryEntry[]> {
    const response = await api.get<GoalHistoryEntry[]>('/goals/history', { params: filters });
    return response.data;
  },

  /**
   * Get achievement rate over time
   */
  async getAchievementRate(teamId?: string, periodMonths?: number): Promise<GoalAchievementRatePoint[]> {
    const response = await api.get<GoalAchievementRatePoint[]>('/goals/achievement-rate', {
      params: { teamId, periodMonths },
    });
    return response.data;
  },

  /**
   * Get team achievement comparison
   */
  async getTeamComparison(startDate?: string, endDate?: string): Promise<TeamGoalComparison[]> {
    const response = await api.get<TeamGoalComparison[]>('/goals/team-comparison', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get user goal achievement log
   */
  async getAchievements(): Promise<GoalAchievement[]> {
    const response = await api.get<GoalAchievement[]>('/goals/achievements');
    return response.data;
  },

  /**
   * Get historical progress snapshots
   */
  async getSnapshots(filters?: Record<string, unknown>): Promise<GoalSnapshot[]> {
    const response = await api.get<GoalSnapshot[]>('/goals/snapshots', { params: filters });
    return response.data;
  },

  /**
   * Get report-formatted goal history
   */
  async getReportsHistory(filters?: Record<string, unknown>): Promise<GoalHistoryEntry[]> {
    const response = await api.get<GoalHistoryEntry[]>('/goals/reports/history', { params: filters });
    return response.data;
  },

  /**
   * Force a snapshot of the current goal progress
   */
  async forceSnapshot(id: string): Promise<GoalSnapshot> {
    const response = await api.post<GoalSnapshot>(`/goals/${id}/snapshot`);
    return response.data;
  },

  /**
   * Get a single goal template by ID
   */
  async getTemplate(id: string): Promise<GoalTemplate> {
    const response = await api.get<GoalTemplate>(`/goals/templates/${id}`);
    return response.data;
  },

  /**
   * Update a goal template
   */
  async updateTemplate(id: string, data: Partial<GoalTemplate>): Promise<GoalTemplate> {
    const response = await api.patch<GoalTemplate>(`/goals/templates/${id}`, data);
    return response.data;
  },

  /**
   * Delete a goal template
   */
  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/goals/templates/${id}`);
  },
};

export default goalsService;
