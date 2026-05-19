import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthRepository } from './MockAuthRepository';

describe('MockAuthRepository (Infrastructure Layer)', () => {
  let repo: MockAuthRepository;

  beforeEach(() => {
    repo = new MockAuthRepository();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should store token in localStorage on authenticate', async () => {
    const session = await repo.authenticate('test-token');
    expect(session.token).toBe('test-token');
    expect(session.user.id).toBe('u1');
    if (typeof window !== 'undefined') {
      expect(localStorage.getItem('token')).toBe('test-token');
    }
  });

  it('should remove token from localStorage on logout', async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'existing-token');
    }
    await repo.logout();
    if (typeof window !== 'undefined') {
      expect(localStorage.getItem('token')).toBeNull();
    }
  });

  it('should return session if token exists in localStorage', async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'valid-token');
    }
    const session = await repo.getCurrentSession();
    expect(session).not.toBeNull();
    expect(session?.token).toBe('valid-token');
  });

  it('should return null if no token exists in localStorage', async () => {
    const session = await repo.getCurrentSession();
    expect(session).toBeNull();
  });

  it('should execute magic link request without errors', async () => {
    await repo.requestMagicLink('test@example.com');
    // Magic link is just a console log in mock, so we just check it doesn't throw
    expect(true).toBe(true);
  });
});
