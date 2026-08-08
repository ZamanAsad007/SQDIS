import { api } from './api';
import type { Notification, NotificationFilters } from '@/types';

export const notificationsService = {
  /**
   * Get user notifications with filters
   */
  async getAll(filters?: NotificationFilters): Promise<{ data: Notification[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const response = await api.get<{ data: Notification[]; total: number; page: number; pageSize: number; totalPages: number }>('/notifications', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Get a single notification
   */
  async getById(id: string): Promise<Notification> {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationsService;