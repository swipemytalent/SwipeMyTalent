import { jwtDecode } from 'jwt-decode';

export class AuthService {
  private static TOKEN_KEY = 'token';
  private static EXP_KEY = 'token_exp';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    const decoded: { exp: number } = jwtDecode(token);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXP_KEY, decoded.exp.toString());
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXP_KEY);
  }

  static isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const expString = localStorage.getItem(this.EXP_KEY);
    if (!expString) {
      return false;
    }

    const expirationTime = parseInt(expString, 10);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    return nowInSeconds < expirationTime;
  }
} 