import { jwtDecode } from "jwt-decode";
import { AuthSession } from "@/src/domain/entities/User";
import { IAuthRepository } from "@/src/domain/repositories/IAuthRepository";
import { getAuthRepository } from "@/src/infrastructure/repositories";

type AuthState = 
  | { status: "initial" }
  | { status: "loading" }
  | { status: "authenticated"; session: AuthSession; claims: any }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export class AuthCubit {
  private state: AuthState = { status: "initial" };
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor(private authRepository: IAuthRepository) {}

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emit(newState: AuthState) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState() {
    return this.state;
  }

  async authenticateWithToken(token: string) {
    try {
      this.emit({ status: "loading" });
      const session = await this.authRepository.authenticate(token);
      
      let claims = null;
      try {
        claims = session.token ? jwtDecode(session.token) : null;
      } catch {
        claims = null;
      }

      this.emit({ 
        status: "authenticated", 
        session, 
        claims 
      });
    } catch (error: any) {
      this.emit({ status: "error", message: error.message });
    }
  }

  async requestMagicLink(email: string) {
    try {
      this.emit({ status: "loading" });
      await this.authRepository.requestMagicLink(email);
      this.emit({ status: "unauthenticated" });
    } catch (error: any) {
      this.emit({ status: "error", message: error.message });
    }
  }

  async logout() {
    await this.authRepository.logout();
    this.emit({ status: "unauthenticated" });
  }

  async restoreSession() {
    const session = await this.authRepository.getCurrentSession();
    if (session) {
      const claims = session.token ? jwtDecode(session.token) : null;
      this.emit({ status: "authenticated", session, claims });
    } else {
      this.emit({ status: "unauthenticated" });
    }
  }
}

export const authCubit = new AuthCubit(getAuthRepository());
