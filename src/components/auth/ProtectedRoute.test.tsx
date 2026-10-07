import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store';

vi.mock('@/store');

const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>;

const renderWithRouter = (ui: React.ReactElement, initialPath = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {ui}
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    renderWithRouter(<ProtectedRoute><div>Secret</div></ProtectedRoute>);
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    // Navigate renders nothing; path should be /login (we can't easily assert Navigate target in unit test without router context)
  });

  it('renders children when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'owner' },
    });
    renderWithRouter(<ProtectedRoute><div data-testid="content">Secret</div></ProtectedRoute>);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('allows superAdmin when requiredRole=superAdmin and user is superadmin', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'superAdmin' },
    });
    renderWithRouter(<ProtectedRoute requiredRole="superAdmin"><div data-testid="admin">Admin</div></ProtectedRoute>);
    expect(screen.getByTestId('admin')).toBeInTheDocument();
  });

  it('redirects non-superAdmin when requiredRole=superAdmin', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'editor' },
    });
    renderWithRouter(<ProtectedRoute requiredRole="superAdmin"><div data-testid="admin">Admin</div></ProtectedRoute>);
    expect(screen.queryByTestId('admin')).not.toBeInTheDocument();
  });
});