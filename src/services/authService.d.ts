import { User } from 'firebase/auth';

interface LoginResult {
  success: boolean;
  user: User;
  message: string;
}

interface LogoutResult {
  success: boolean;
  message: string;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

interface AccessCheckResult {
  status: string;
  message?: string;
}

declare class AuthService {
  login(email: string, password: string): Promise<LoginResult>;
  logout(): Promise<LogoutResult>;
  resetPassword(email: string): Promise<ResetPasswordResult>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  getCurrentUser(): User | null;
  checkUserAccess(email: string): Promise<AccessCheckResult>;
}

declare const authService: AuthService;
export default authService;
