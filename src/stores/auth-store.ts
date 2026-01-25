import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  zone?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate successful login (in production, this would validate with backend)
        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name: email.split("@")[0],
        };

        set({ user: mockUser, isLoading: false });
        return true;
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate successful registration
        const mockUser: User = {
          id: `user_${Date.now()}`,
          email: data.email,
          name: data.name,
          phone: data.phone,
        };

        set({ user: mockUser, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null });
      },

      updateProfile: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: "encanto-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
