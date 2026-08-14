import { api } from './api';
import type { OrganizationMember, Invitation, UnmappedEmail, AssignEmailRequest, UserRole } from '@/types';

export const membersService = {
  /**
   * Get all members of the organization
   */
  async getAll(): Promise<OrganizationMember[]> {
    const response = await api.get<OrganizationMember[]>('/organizations/members');
    return response.data;
  },

  /**
   * Get all invitations for the organization
   */
  async getInvitations(): Promise<Invitation[]> {
    const response = await api.get<Invitation[]>('/organizations/invitations');
    return response.data;
  },

  /**
   * Get all unmapped emails for the organization
   */
  async getUnmappedEmails(): Promise<UnmappedEmail[]> {
    const response = await api.get<UnmappedEmail[]>('/admin/unmapped-emails');
    return response.data;
  },

  /**
   * Assign an email to a user without verification
   */
  async assignEmail(data: AssignEmailRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/admin/email-aliases/assign', data);
    return response.data;
  },

  /**
   * Remove an email mapping
   */
  async removeEmailMapping(aliasId: string): Promise<void> {
    await api.delete(`/admin/email-aliases/${aliasId}`);
  },

  /**
   * Update member role
   */
  async updateRole(userId: string, role: UserRole): Promise<OrganizationMember> {
    const response = await api.patch<OrganizationMember>(`/organizations/members/${userId}`, { role });
    return response.data;
  },

  /**
   * Remove member from organization
   */
  async remove(userId: string): Promise<void> {
    await api.delete(`/organizations/members/${userId}`);
  },
};

export default membersService;