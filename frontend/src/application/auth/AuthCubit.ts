import { jwtDecode } from "jwt-decode";
import { AuthSession } from "@/src/domain/entities/User";

type AuthState = 
  | { status: "initial" }
  | { status: "loading" }
  | { status: "authenticated"; session: AuthSession; claims: any }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export class AuthCubit {
  private state: AuthState = { status: "initial" };
  private listeners: Set<(state: AuthState) => void> = new Set();

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

  // Simulação de login com o Mock
  async loginMock(token: string) {
    try {
      this.emit({ status: "loading" });
      // Decode JWT futuramente...
      // const decoded = jwtDecode(token);
      
      const mockSession: AuthSession = {
        user: { id: "u1", email: "user@example.com" },
        token: token,
      };

      this.emit({ 
        status: "authenticated", 
        session: mockSession, 
        claims: { role: "admin" } 
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", token);
      }
    } catch (error: any) {
      this.emit({ status: "error", message: error.message });
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
    }
    this.emit({ status: "unauthenticated" });
  }
}

export const authCubit = new AuthCubit();
