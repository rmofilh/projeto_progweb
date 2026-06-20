import { jwtDecode } from "jwt-decode";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { AuthSession } from "../../domain/entities/User";
import { axiosClient } from "../http/axiosClient";
import { TOKEN_KEY, USER_KEY } from "../config";

export class ApiAuthRepository implements IAuthRepository {
  async requestMagicLink(email: string): Promise<void> {
    const { data } = await axiosClient.post("/v1/auth/magic-link", { email });
    if (data.magic_link) {
      console.log("[MAGIC LINK]", data.magic_link);
    }
  }

  async authenticate(token: string): Promise<AuthSession> {
    const { data } = await axiosClient.post("/v1/auth/verify", null, {
      params: { token },
    });

    const decoded = jwtDecode<{ sub?: string }>(data.access_token);
    const user = { id: decoded.sub ?? "", email: decoded.sub ?? "" };

    const session: AuthSession = { user, token: data.access_token };

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return session;
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const userJson = localStorage.getItem(USER_KEY);
    const user = userJson ? JSON.parse(userJson) : { id: "", email: "" };

    return { user, token };
  }
}
