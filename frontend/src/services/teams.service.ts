import { api } from './api';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  AssignLeadRequest,
  TeamMetrics,
  TeamLeaderboardResponse,
} from '@/types';

export const teamsService = {
  /**
   * Get all teams for the current organization
   */
  async getAll(): Promise<Team[]> {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  },

  /**
   * Get team by ID
   */
  async getById(id: string): Promise<Team> {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  /**
   * Create a new team
   */
  async create(data: CreateTeamRequest): Promise<Team> {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  },

  /**
   * Update team
   */
  async update(id: string, data: UpdateTeamRequest): Promise<Team> {
    const response = await api.patch<Team>(`/teams/${id}`, data);
    return response.data;
  },

  /**
   * Delete team (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  /**
   * Get team metrics
   */
  async getMetrics(id: string, query?: Record<string, unknown>): Promise<TeamMetrics> {
    const response = await api.get<TeamMetrics>(`/teams/${id}/metrics`, { params: query });
    return response.data;
  },

  /**
   * Get team leaderboard
   */
  async getLeaderboard(query?: Record<string, unknown>): Promise<TeamLeaderboardResponse> {
    const response = await api.get<TeamLeaderboardResponse>('/teams/leaderboard', { params: query });
    return response.data;
  },

  /**
   * Add member to team
   */
  async addMember(id: string, data: AddTeamMemberRequest): Promise<Team> {
    const response = await api.post<Team>(`/teams/${id}/members`, data);
    return response.data;
  },

  /**
   * Remove member from team
   */
  async removeMember(id: string, userId: string): Promise<void> {
    await api.delete(`/teams/${id}/members/${userId}`);
  },

  /**
   * Assign team lead
   */
  async assignLead(id: string, data: AssignLeadRequest): Promise<Team> {
    const response = await api.patch<Team>(`/teams/${id}/lead`, data);
    return response.data;
  },
};

export default teamsService;