import { api } from './api';
import type {
  CoverageReport,
  CoverageListResponse,
  CoverageFilters,
  CoverageTrendResponse,
  CoverageTrendFilters,
} from '@/types';

export const coverageService = {
  /**
   * Upload a coverage report
   */
  async upload(
    file: File,
    repositoryId: string,
    query?: { commitSha?: string; branch?: string }
  ): Promise<CoverageReport> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('repositoryId', repositoryId);
    if (query?.commitSha) formData.append('commitSha', query.commitSha);
    if (query?.branch) formData.append('branch', query.branch);

    const response = await api.post<CoverageReport>('/coverage/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * List coverage reports with filters
   */
  async getAll(filters?: CoverageFilters): Promise<CoverageListResponse> {
    const response = await api.get<CoverageListResponse>('/coverage', { params: filters });
    return response.data;
  },

  /**
   * Get coverage report by ID
   */
  async getById(id: string): Promise<CoverageReport> {
    const response = await api.get<CoverageReport>(`/coverage/${id}`);
    return response.data;
  },

  /**
   * Get latest coverage report for a repository
   */
  async getLatest(repositoryId: string): Promise<CoverageReport> {
    const response = await api.get<CoverageReport>(`/coverage/latest/${repositoryId}`);
    return response.data;
  },

  /**
   * Get coverage trends for a repository
   */
  async getTrends(repositoryId: string, filters?: CoverageTrendFilters): Promise<CoverageTrendResponse> {
    const response = await api.get<CoverageTrendResponse>(`/coverage/trends/${repositoryId}`, {
      params: filters,
    });
    return response.data;
  },
};

export default coverageService;