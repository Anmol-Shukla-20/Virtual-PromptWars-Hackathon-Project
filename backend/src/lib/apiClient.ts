/**
 * Frontend API client for all EcoPath AI backend requests.
 * Automatically attaches the Bearer token from localStorage.
 */

const API_BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'API Error' }));
    throw new Error(err.message ?? err.error ?? 'Something went wrong');
  }

  return res.json() as Promise<T>;
}

// Auth endpoints
export const authApi = {
  register: (fullName: string, email: string, password: string) =>
    request<{ token: string; user: { id: string; fullName: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; fullName: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  googleLogin: (email: string) =>
    request<{ token: string; user: { id: string; fullName: string; email: string } }>('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// Tracker endpoints
export const trackerApi = {
  logActivity: (data: Record<string, unknown>) =>
    request<{ message: string; activity: Record<string, unknown>; co2Saved: number; earnedPoints: number }>('/tracker/log', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSummary: () =>
    request<{
      breakdown: { transportation: number; electricity: number; lifestyle: number; shopping: number; total: number };
      trend: { _id: string; dailyTotal: number }[];
      ecoPoints: number;
      co2Saved: number;
      sustainabilityScore: number;
    }>('/tracker/summary'),

  getActivities: () => request<Record<string, unknown>[]>('/tracker/activities'),
};

// AI endpoint
export const aiApi = {
  chat: (message: string) =>
    request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

