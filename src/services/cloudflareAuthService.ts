export interface CloudflareUser {
  id: string;
  email: string;
}

const TOKEN_KEY = 'my_cookbook_cf_token';
const USER_KEY = 'my_cookbook_cf_user';

type AuthListener = (user: CloudflareUser | null) => void;
const listeners = new Set<AuthListener>();

function notify(user: CloudflareUser | null) {
  listeners.forEach(fn => fn(user));
}

export const cloudflareAuth = {
  getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getAuthUser(): CloudflareUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAuthToken() && this.getAuthUser());
  },

  onAuthStateChange(callback: AuthListener): () => void {
    listeners.add(callback);
    callback(this.getAuthUser());
    return () => listeners.delete(callback);
  },

  async register(email: string, password: string): Promise<{ user: CloudflareUser; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json() as any;
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    notify(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<{ user: CloudflareUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json() as any;
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    notify(data.user);
    return data;
  },

  async logout(): Promise<void> {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Logout network error (clearing local session anyway):', err);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notify(null);
  },

  async checkSession(): Promise<CloudflareUser | null> {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Session expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        notify(null);
        return null;
      }

      const data = await res.json() as { user: CloudflareUser };
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      notify(data.user);
      return data.user;
    } catch (err) {
      // Offline: keep cached user
      return this.getAuthUser();
    }
  },
};
