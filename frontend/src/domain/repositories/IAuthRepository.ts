import { AuthSession } from "../entities/User";

export interface IAuthRepository {
  requestMagicLink(email: string): Promise<void>;
  authenticate(token: string): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
}
