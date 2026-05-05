import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { AuthSession } from "../../domain/entities/User";

export class MockAuthRepository implements IAuthRepository {
  async requestMagicLink(email: string): Promise<void> {
    console.log(`Magic link requested for ${email}`);
  }

  async authenticate(token: string): Promise<AuthSession> {
    return {
      user: { id: "u1", email: "user@example.com" },
      token: "mock-token",
    };
  }

  async logout(): Promise<void> {
    console.log("Logged out");
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    return null;
  }
}
