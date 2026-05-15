import { describe, it, expect, beforeEach } from 'vitest';
import { AuthCubit } from './AuthCubit';

describe('AuthCubit (Application Layer)', () => {
  let authCubit: AuthCubit;

  beforeEach(() => {
    authCubit = new AuthCubit();
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

    // Act
    await authCubit.loginMock(mockToken);

    // Assert
    expect(states).toHaveLength(3); // initial -> loading -> authenticated
    expect(states[1].status).toBe('loading');
    expect(states[2].status).toBe('authenticated');
    expect(states[2].session.token).toBe(mockToken);
    
    if (typeof window !== 'undefined') {
      expect(localStorage.getItem('token')).toBe(mockToken);
    }
  });

  it('should transition to unauthenticated and clear storage on logout', () => {
    // Arrange
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'old-token');
    }

    // Act
    authCubit.logout();

    // Assert
    expect(authCubit.getState().status).toBe('unauthenticated');
    if (typeof window !== 'undefined') {
      expect(localStorage.getItem('token')).toBeNull();
    }
  });

  it('should emit error state if login fails', async () => {
    // Arrange
    const states: any[] = [];
    authCubit.subscribe(state => states.push(state));
    
    // Forçar erro mockando o emit ou algum comportamento interno se fosse o caso,
    // mas aqui vamos apenas simular um erro lançando exceção se o token for 'invalid'
    // Para isso, precisamos ajustar o AuthCubit para validar o token ou mockar.
    // Como é um mock, vamos apenas testar o fluxo de erro.
    
    // Mocking an error by spying on a hypothetical validator or just testing the catch block
    vi.spyOn(authCubit as any, 'emit').mockImplementationOnce(() => {
       throw new Error('Forced Error');
    });

    // Act
    await authCubit.loginMock('any');

    // Assert
    expect(authCubit.getState().status).toBe('error');
    if (authCubit.getState().status === 'error') {
      expect((authCubit.getState() as any).message).toBe('Forced Error');
    }
  });
});
