import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setAuth: (user) => {
        set({ user });
      },
      clearAuth: () => {
        set({ user: null });
      },
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: 'auth-storage',
    }
  )
);
