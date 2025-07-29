import { AuthService } from './authService';
import { clearUser } from '../redux/userSlice';
import { AppDispatch } from '../redux/store';

let dispatch: AppDispatch | null = null;

export function setupHttpService(appDispatch: AppDispatch) {
  dispatch = appDispatch;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requiresAuth?: boolean;
}

export class HttpService {
  private static BASE_URL = '/api';

  private static handleUnauthorized(): void {
    AuthService.removeToken();
    if (dispatch) {
      dispatch(clearUser());
    }
    window.location.href = '/login';
  }

  static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, requiresAuth = true } = options;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = AuthService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Si l'authentification est requise mais qu'il n'y a pas de token,
        // on peut directement rediriger.
        this.handleUnauthorized();
        // On lève une erreur pour arrêter l'exécution de la requête.
        throw new Error('No token found for authorized request.');
      }
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const fullUrl = `${this.BASE_URL}${endpoint}`;

    const response = await fetch(fullUrl, config);

    if (response.status === 401) {
        this.handleUnauthorized();
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || response.statusText);
    }

    // Gérer le cas où la réponse est vide (ex: 204 No Content)
    const responseText = await response.text();
    if (!responseText) {
        return {} as T;
    }
    
    return JSON.parse(responseText);
  }

  static get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  static post<T>(endpoint: string, body: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  static put<T>(endpoint: string, body: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  static delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
} 