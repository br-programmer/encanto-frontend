import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiError, type AuthTokens, type UserProfile } from "@/lib/api";
import {
  signInAction,
  signUpAction,
  refreshTokenAction,
  getMeAction,
} from "@/actions/auth-actions";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

// Token storage helpers
const TOKENS_KEY = "encanto-tokens";

function saveTokens(tokens: AuthTokens) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }
}

function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(TOKENS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKENS_KEY);
  }
}

// Map UserProfile to User
function mapUserProfile(profile: UserProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    phone: profile.phone,
    avatarUrl: profile.avatarUrl,
    emailVerified: profile.emailVerified,
    isActive: profile.isActive,
  };
}

// Check if an error from a Server Action is a specific HTTP status
function isApiStatus(error: unknown, status: number): boolean {
  if (error instanceof ApiError) return error.status === status;
  if (error instanceof Error) return error.message.includes(`${status}`);
  return false;
}

// Parse API error message
function parseApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        return data.message[0];
      }
      return data.message;
    }
    if (error.status === 401) {
      return "Credenciales incorrectas";
    }
    if (error.status === 409) {
      return "Este correo ya está registrado";
    }
    if (error.status === 403) {
      return "Tu cuenta está inactiva";
    }
  }
  // Fallback: check message for common status codes
  if (error instanceof Error) {
    if (error.message.includes("401")) return "Credenciales incorrectas";
    if (error.message.includes("409")) return "Este correo ya está registrado";
    if (error.message.includes("403")) return "Tu cuenta está inactiva";
  }
  return "Ha ocurrido un error. Intenta de nuevo.";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Sign in to get tokens
          const tokens = await signInAction({ email, password });
          saveTokens(tokens);
          set({ tokens });

          // Fetch user profile
          const profile = await getMeAction(tokens.accessToken);
          const user = mapUserProfile(profile);

          set({ user, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = parseApiError(error);
          set({ isLoading: false, error: errorMessage, user: null, tokens: null });
          clearTokens();
          return { success: false, error: errorMessage };
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          // Register user
          await signUpAction({
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            phone: data.phone,
          });

          // Auto login after registration
          const tokens = await signInAction({
            email: data.email,
            password: data.password,
          });
          saveTokens(tokens);
          set({ tokens });

          // Fetch user profile
          const profile = await getMeAction(tokens.accessToken);
          const user = mapUserProfile(profile);

          set({ user, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = parseApiError(error);
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        clearTokens();
        set({ user: null, tokens: null, error: null });
      },

      refreshToken: async () => {
        const currentTokens = get().tokens || getTokens();
        if (!currentTokens?.refreshToken) {
          get().logout();
          return false;
        }

        try {
          const newTokens = await refreshTokenAction(currentTokens.refreshToken);
          saveTokens(newTokens);
          set({ tokens: newTokens });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      fetchUser: async () => {
        const currentTokens = get().tokens || getTokens();
        if (!currentTokens?.accessToken) return;

        set({ isLoading: true });

        try {
          const profile = await getMeAction(currentTokens.accessToken);
          const user = mapUserProfile(profile);
          set({ user, isLoading: false });
        } catch (error) {
          if (isApiStatus(error, 401)) {
            // Try to refresh token
            const refreshed = await get().refreshToken();
            if (refreshed) {
              // Retry fetching user with new token
              try {
                const newTokens = get().tokens;
                if (!newTokens?.accessToken) throw new Error("No token after refresh");
                const profile = await getMeAction(newTokens.accessToken);
                const user = mapUserProfile(profile);
                set({ user, isLoading: false });
                return;
              } catch {
                // Refresh didn't help
              }
            }
          }
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "encanto-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);
