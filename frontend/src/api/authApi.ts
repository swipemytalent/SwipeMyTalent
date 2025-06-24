import { HttpService } from '../services/httpService';
import { AuthService } from '../services/authService';

interface AuthData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  avatar?: string;
  bio?: string;
}

interface AuthResponse {
  token?: string;
  message?: string;
}

export async function login(data: AuthData): Promise<AuthResponse> {
  const response = await HttpService.post<AuthResponse>('/login', data, false);
  if (response.token) {
    AuthService.setToken(response.token);
  }
  return response;
}

export async function register(data: AuthData): Promise<AuthResponse> {
  return await HttpService.post<AuthResponse>('/register', data, false);
} 