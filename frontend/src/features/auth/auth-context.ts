import { createContext } from 'react';
import type { AuthUser } from '../../types/api';

export interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  homePath: string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
