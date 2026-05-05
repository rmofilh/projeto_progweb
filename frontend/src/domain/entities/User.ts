export interface User {
  id: string;
  email: string;
  lastLoginAt?: Date;
}

export interface AuthSession {
  user: User;
  token: string;
}
