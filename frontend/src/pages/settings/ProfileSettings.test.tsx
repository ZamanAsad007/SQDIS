import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileSettings } from './ProfileSettings';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/services', () => ({
  authService: {
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('ProfileSettings', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useAuthStore.setState({
      user: {
        id: 'u-123',
        email: 'developer@sqdis.local',
        name: 'Developer One',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders personal information and security forms', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileSettings />
      </QueryClientProvider>
    );

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Security & Password')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Developer One')).toBeInTheDocument();
    expect(screen.getByDisplayValue('developer@sqdis.local')).toBeInTheDocument();
  });

  it('shows error when new passwords do not match', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileSettings />
      </QueryClientProvider>
    );

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const updatePasswordButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123!' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
    fireEvent.click(updatePasswordButton);

    expect(screen.getByText("New passwords don't match")).toBeInTheDocument();
  });

  it('shows error when new password is too short', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileSettings />
      </QueryClientProvider>
    );

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const updatePasswordButton = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123!' } });
    fireEvent.change(newPasswordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(updatePasswordButton);

    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });
});
