import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { AuthSession } from "../../domain/entities/User";

export class MockAuthRepository implements IAuthRepository {
  async requestMagicLink(email: string): Promise<void> {
    console.log(`Magic link requested for ${email}`);
  }

  async authenticate(token: string): Promise<AuthSession> {
    if (typeof window !== 'undefined') {
      localStorage.setItem("token", token);
    }
    return {
      user: { id: "u1", email: "user@example.com" },
      token: token,
    };
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
    }
    console.log("Logged out");
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        return {
          user: { id: "u1", email: "user@example.com" },
          token: token,
        };
      }
    }
    return null;
  }
}
