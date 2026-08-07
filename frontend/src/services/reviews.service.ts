import { api } from './api';
import type {
  Review,
  ReviewFilters,
  ReviewListResponse,
  ReviewLeaderboardEntry,
  ReviewAnalytics,
  ReviewQualityMetrics,
  ReviewActivityTrendPoint,
  PeakReviewTimes,
  ReviewDebt,
  DeveloperReviewStats,
} from '@/types';

export const reviewsService = {
  /**
   * List pull request reviews with pagination and filters
   */
  async getAll(filters?: ReviewFilters): Promise<ReviewListResponse> {
    const response = await api.get<ReviewListResponse>('/reviews', { params: filters });
    return response.data;
  },

  /**
   * Get pending reviews for current user
   */
  async getPendingReviews(): Promise<Review[]> {
    const response = await api.get<Review[]>('/reviews/pending');
    return response.data;
  },

  /**
   * Get top reviewers leaderboard
   */
  async getLeaderboard(limit?: number): Promise<ReviewLeaderboardEntry[]> {
    const response = await api.get<ReviewLeaderboardEntry[]>('/reviews/leaderboard', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get comprehensive review analytics
   */
  async getAnalytics(startDate?: string, endDate?: string): Promise<ReviewAnalytics> {
    const response = await api.get<ReviewAnalytics>('/reviews/analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get review quality metrics
   */
  async getQualityMetrics(startDate?: string, endDate?: string): Promise<ReviewQualityMetrics> {
    const response = await api.get<ReviewQualityMetrics>('/reviews/quality-metrics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Get review activity trend over time
   */
  async getActivityTrend(days?: number): Promise<ReviewActivityTrendPoint[]> {
    const response = await api.get<ReviewActivityTrendPoint[]>('/reviews/activity-trend', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get peak review activity days and hours
   */
  async getPeakTimes(): Promise<PeakReviewTimes> {
    const response = await api.get<PeakReviewTimes>('/reviews/peak-times');
    return response.data;
  },

  /**
   * Get repositories containing reviews
   */
  async getRepositoriesWithReviews(): Promise<Array<{ id: string; name: string; fullName: string }>> {
    const response = await api.get<Array<{ id: string; name: string; fullName: string }>>(
      '/reviews/repositories'
    );
    return response.data;
  },

  /**
   * Get team review debt
   */
  async getTeamDebt(teamId: string): Promise<ReviewDebt> {
    const response = await api.get<ReviewDebt>('/reviews/debt', { params: { teamId } });
    return response.data;
  },

  /**
   * Get review statistics for a developer
   */
  async getDeveloperStats(developerId: string): Promise<DeveloperReviewStats> {
    const response = await api.get<DeveloperReviewStats>(`/reviews/stats/${developerId}`);
    return response.data;
  },

  /**
   * Get review details by ID
   */
  async getById(id: string): Promise<Review> {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  },
};

export default reviewsService;
