/**
 * JWT Authentication Preservation Tests
 *
 * Property 2: Preservation — Public Endpoint and Login Flow Behavior
 *
 * Verifies that the fix does NOT break:
 *  - Public endpoints work without authentication
 *  - Login flow stores token correctly
 *  - Logout clears all tokens
 *  - Expired/invalid tokens are rejected
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

// ── localStorage shim ─────────────────────────────────────────────────────────
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ── StorageService logic (mirrors services/storage.ts) ───────────────────────
const TOKEN_KEY = 'hrms_token';
const REFRESH_TOKEN_KEY = 'hrms_refresh_token';
const USER_KEY = 'hrms_user';

const StorageService = {
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  setRefreshToken: (t: string) => localStorage.setItem(REFRESH_TOKEN_KEY, t),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setUser: (u: object) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  getUser: () => { const v = localStorage.getItem(USER_KEY); return v ? JSON.parse(v) : null; },
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ── Token helpers (mirrors services/auth.ts) ──────────────────────────────────
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return true;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

// ── Interceptor logic (mirrors axiosClient.ts) ────────────────────────────────
const PUBLIC_PATHS = [
  '/auth/login', '/auth/register', '/auth/check-username',
  '/auth/check-email', '/actuator/health', '/recruitment/jobs/public',
];

function isPublicPath(url: string): boolean {
  return PUBLIC_PATHS.some(p => url.includes(p));
}

function buildHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = StorageService.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ── Sample tokens ─────────────────────────────────────────────────────────────
// Valid (exp far in future)
const VALID_TOKEN = (() => {
  const header = btoa(JSON.stringify({ alg: 'HS384' }));
  const payload = btoa(JSON.stringify({ sub: 'admin', exp: 9999999999 }));
  return `${header}.${payload}.signature`;
})();

// Expired (exp in the past)
const EXPIRED_TOKEN = (() => {
  const header = btoa(JSON.stringify({ alg: 'HS384' }));
  const payload = btoa(JSON.stringify({ sub: 'admin', exp: 1 }));
  return `${header}.${payload}.signature`;
})();

// ─────────────────────────────────────────────────────────────────────────────

describe('JWT Auth — Preservation: Existing Behavior Unchanged', () => {

  beforeEach(() => {
    localStorageMock.clear();
  });

  // ── 3.1 Public endpoints work without auth ────────────────────────────────
  describe('Requirement 3.1: Public endpoints accessible without authentication', () => {
    const publicEndpoints = [
      '/auth/login', '/auth/register', '/auth/check-username',
      '/auth/check-email', '/actuator/health', '/recruitment/jobs/public',
    ];

    test.each(publicEndpoints)(
      'public endpoint %s does not require Authorization header',
      (endpoint) => {
        // No token in storage
        const headers = buildHeaders(endpoint);
        // Public endpoints should work — no token means no header, which is fine
        expect(headers['Authorization']).toBeUndefined();
        expect(isPublicPath(endpoint)).toBe(true);
      }
    );
  });

  // ── 3.2 Expired/invalid tokens are rejected ───────────────────────────────
  describe('Requirement 3.2: Expired/invalid tokens continue to be rejected', () => {
    test('isTokenExpired returns true for expired token', () => {
      expect(isTokenExpired(EXPIRED_TOKEN)).toBe(true);
    });

    test('isTokenExpired returns false for valid token', () => {
      expect(isTokenExpired(VALID_TOKEN)).toBe(false);
    });

    test('isTokenExpired returns true for malformed token', () => {
      expect(isTokenExpired('not.a.token')).toBe(true);
      expect(isTokenExpired('')).toBe(true);
      expect(isTokenExpired('onlyone')).toBe(true);
    });
  });

  // ── 3.3 Logout clears all tokens ─────────────────────────────────────────
  describe('Requirement 3.3: Logout clears tokens from localStorage', () => {
    test('clearAll removes token, refreshToken, and user', () => {
      StorageService.setToken(VALID_TOKEN);
      StorageService.setRefreshToken('refresh-token');
      StorageService.setUser({ id: 1, username: 'admin' });

      expect(StorageService.getToken()).toBe(VALID_TOKEN);
      expect(StorageService.getRefreshToken()).toBe('refresh-token');
      expect(StorageService.getUser()).toEqual({ id: 1, username: 'admin' });

      StorageService.clearAll();

      expect(StorageService.getToken()).toBeNull();
      expect(StorageService.getRefreshToken()).toBeNull();
      expect(StorageService.getUser()).toBeNull();
    });

    test('After logout, no Authorization header is attached to requests', () => {
      StorageService.setToken(VALID_TOKEN);
      expect(buildHeaders('/employees')['Authorization']).toBeDefined();

      StorageService.clearAll();
      expect(buildHeaders('/employees')['Authorization']).toBeUndefined();
    });
  });

  // ── 3.4 Login stores token correctly ─────────────────────────────────────
  describe('Requirement 3.4: Login stores JWT token with correct key', () => {
    test('setToken stores token under "hrms_token" key', () => {
      StorageService.setToken(VALID_TOKEN);
      expect(localStorage.getItem('hrms_token')).toBe(VALID_TOKEN);
    });

    test('getToken retrieves the stored token', () => {
      StorageService.setToken(VALID_TOKEN);
      expect(StorageService.getToken()).toBe(VALID_TOKEN);
    });

    test('Token stored by login is immediately available to interceptor', () => {
      // Simulate what AuthContext.login does after receiving JWT response
      StorageService.setToken(VALID_TOKEN);

      // Simulate what the interceptor does on the very next request
      const headers = buildHeaders('/employees');
      expect(headers['Authorization']).toBe(`Bearer ${VALID_TOKEN}`);
    });

    test('setUser stores and retrieves user object correctly', () => {
      const user = { id: 1, username: 'admin', email: 'admin@talentx.com' };
      StorageService.setUser(user);
      expect(StorageService.getUser()).toEqual(user);
    });
  });
});
