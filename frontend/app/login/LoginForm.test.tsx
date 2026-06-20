import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './page';

const { mockPush, mockAuthCubit } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockAuthCubit: {
    requestMagicLink: vi.fn().mockResolvedValue(undefined),
    authenticateWithToken: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn(() => ({ status: 'initial' })),
    subscribe: vi.fn(() => vi.fn()),
    logout: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

vi.mock('@/src/application/auth/AuthCubit', () => ({
  authCubit: mockAuthCubit,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the login form with title', () => {
    render(<LoginPage />);
    expect(screen.getByText('Acessar meu Baú')).toBeInTheDocument();
  });

  it('should render email input and submit button', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('seu.email@exemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Receber Link Mágico')).toBeInTheDocument();
  });

  it('should call requestMagicLink on form submit', async () => {
    render(<LoginPage />);

    const input = screen.getByPlaceholderText('seu.email@exemplo.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Receber Link Mágico'));

    await waitFor(() => {
      expect(mockAuthCubit.requestMagicLink).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show loading state while submitting', async () => {
    mockAuthCubit.requestMagicLink.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    const input = screen.getByPlaceholderText('seu.email@exemplo.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Receber Link Mágico'));

    expect(screen.getByText('Enviando...')).toBeInTheDocument();
  });
});
