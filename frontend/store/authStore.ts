'use client';

import { create } from 'zustand';
import { authApi } from '@/lib/api';
import type { AuthUser } from '@shared/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  hydrate: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    set({
      token,
      user: user ? (JSON.parse(user) as AuthUser) : null,
      hydrated: true,
    });
  },

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authApi.login(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
      throw err;
    }
  },

  async register(payload) {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authApi.register(payload);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
      throw err;
    }
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAdmin: () => get().user?.role === 'admin',
}));
