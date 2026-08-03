import { AuthState } from "@/types";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ user: null, profile: null, isLoading: false }),
}));
