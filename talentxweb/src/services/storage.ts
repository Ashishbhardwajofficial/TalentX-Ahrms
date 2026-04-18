// Local storage utilities for token management
export class StorageService {
  private static readonly TOKEN_KEY = 'hrms_token';
  private static readonly REFRESH_TOKEN_KEY = 'hrms_refresh_token';
  private static readonly USER_KEY = 'hrms_user';

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  static clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
  }
}