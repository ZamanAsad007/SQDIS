import { api } from './api';
import type { EmailAlias, AddEmailAliasRequest } from '@/types';

export const emailAliasesService = {
  /**
   * Add a new email alias
   */
  async add(data: AddEmailAliasRequest): Promise<EmailAlias> {
    const response = await api.post<EmailAlias>('/email-aliases', data);
    return response.data;
  },

  /**
   * Get all email aliases for the current user
   */
  async getAll(): Promise<EmailAlias[]> {
    const response = await api.get<EmailAlias[]>('/email-aliases');
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(id: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/email-aliases/${id}/resend`);
    return response.data;
  },

  /**
   * Remove an email alias
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/email-aliases/${id}`);
  },
};

export default emailAliasesService;