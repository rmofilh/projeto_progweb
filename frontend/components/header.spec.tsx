import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAuthCubit, mockAuthState } = vi.hoisted(() => {
  const state: { status: string; session?: { user: { id: string; email: string }; token: string } } = { status: 'initial' };
  return {
    mockAuthCubit: {
      getState: vi.fn(() => state),
      subscribe: vi.fn((listener: (s: { status: string; session?: { user: { id: string; email: string }; token: string } }) => void) => {
        listener(state);
        return vi.fn();
      }),
      loginMock: vi.fn(),
      logout: vi.fn(),
    },
    mockAuthState: state,
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('@/src/application/auth/AuthCubit', () => ({
  authCubit: mockAuthCubit,
}));

import { Header } from './header';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.status = 'initial';
  });

  it('should render the Fio & Luz brand name', () => {
    render(<Header />);
    expect(screen.getByText('Fio & Luz')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Meu Baú')).toBeInTheDocument();
  });

  it('should show login button when not authenticated', () => {
    mockAuthState.status = 'unauthenticated';
    render(<Header />);
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByText('Entrar').closest('a')).toHaveAttribute('href', '/login');
  });

  it('should show user email and logout when authenticated', () => {
    mockAuthState.status = 'authenticated';
    mockAuthState.session = { user: { id: 'u1', email: 'user@example.com' }, token: 'abc' };
    render(<Header />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('should call logout when clicking Sair', () => {
    mockAuthState.status = 'authenticated';
    mockAuthState.session = { user: { id: 'u1', email: 'user@example.com' }, token: 'abc' };
    render(<Header />);
    fireEvent.click(screen.getByText('Sair'));
    expect(mockAuthCubit.logout).toHaveBeenCalled();
  });
});
