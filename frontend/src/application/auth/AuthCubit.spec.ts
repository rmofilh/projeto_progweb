import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthCubit } from './AuthCubit';
import { IAuthRepository } from '@/src/domain/repositories/IAuthRepository';

describe('AuthCubit (Application Layer)', () => {
  let authCubit: AuthCubit;
  let mockAuthRepo: IAuthRepository;

  beforeEach(() => {
    mockAuthRepo = {
      requestMagicLink: vi.fn(),
      authenticate: vi.fn(),
      logout: vi.fn(),
      getCurrentSession: vi.fn(),
    };
    authCubit = new AuthCubit(mockAuthRepo);
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should start with initial state', () => {
    // Assert
    expect(authCubit.getState().status).toBe('initial');
  });

  it('should emit loading and then authenticated states on successful login', async () => {
    // Arrange
    const states: any[] = [];
    authCubit.subscribe(state => states.push(state));
    const mockToken = 'mock-jwt-token';
    const mockSession = { user: { id: 'u1', email: 'test@example.com' }, token: mockToken };
    
    // Configura o mock do repositório para retornar a sessão
    vi.mocked(mockAuthRepo.authenticate).mockResolvedValue(mockSession);

    // Act
    await authCubit.loginMock(mockToken);

    // Assert
    expect(states).toHaveLength(3); // initial -> loading -> authenticated
    expect(states[1].status).toBe('loading');
    expect(states[2].status).toBe('authenticated');
    expect((states[2] as any).session.token).toBe(mockToken);
    expect(mockAuthRepo.authenticate).toHaveBeenCalledWith(mockToken);
  });

  it('should transition to unauthenticated and clear storage on logout', async () => {
    // Act
    await authCubit.logout();

    // Assert
    expect(authCubit.getState().status).toBe('unauthenticated');
    expect(mockAuthRepo.logout).toHaveBeenCalled();
  });

  it('should emit error state if login fails', async () => {
    // Arrange
    const states: any[] = [];
    authCubit.subscribe(state => states.push(state));
    
    // Configura o mock do repositório para simular um erro na autenticação
    vi.mocked(mockAuthRepo.authenticate).mockRejectedValue(new Error('Forced Error'));

    // Act
    await authCubit.loginMock('invalid');

    // Assert
    expect(authCubit.getState().status).toBe('error');
    if (authCubit.getState().status === 'error') {
      expect((authCubit.getState() as any).message).toBe('Forced Error');
    }
  });

  it('should call repository on requestMagicLink and emit unauthenticated on success', async () => {
    const states: any[] = [];
    authCubit.subscribe(state => states.push(state));
    await authCubit.requestMagicLink('test@example.com');
    expect(mockAuthRepo.requestMagicLink).toHaveBeenCalledWith('test@example.com');
    // initial -> loading -> unauthenticated
    expect(states[states.length - 1].status).toBe('unauthenticated');
  });

  it('should emit error if requestMagicLink fails', async () => {
    vi.mocked(mockAuthRepo.requestMagicLink).mockRejectedValue(new Error('Magic Link Error'));
    await authCubit.requestMagicLink('test@example.com');
    expect(authCubit.getState().status).toBe('error');
    if (authCubit.getState().status === 'error') {
      expect((authCubit.getState() as any).message).toBe('Magic Link Error');
    }
  });
});
