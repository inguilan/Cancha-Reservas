"use client";

import { create } from "zustand";

import { authService } from "@/lib/services";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,
  login: async (username, password) => {
    set({ loading: true });
    try {
      const response = await authService.login({ username, password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      const profile = await authService.me();
      set({ user: profile, hydrated: true });
    } finally {
      set({ loading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, hydrated: true });
  },
  fetchProfile: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ user: null, hydrated: true });
      return;
    }

    set({ loading: true });
    try {
      const profile = await authService.me();
      set({ user: profile, hydrated: true });
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({ user: null, hydrated: true });
    } finally {
      set({ loading: false });
    }
  },
}));
