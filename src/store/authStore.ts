import { create } from "zustand";
import type { Role } from "@/constants/roles";

interface AuthUser {
  name: string;
  role: Role;
  hospital?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  signIn: (user: AuthUser, token: string) => void;
  signOut: () => void;
}

/**
 * Real global auth state — replaces "nothing" from the earlier version.
 * Any module reads current user/role via the useAuth() hook (hooks/useAuth.ts),
 * never by importing this store directly, so the storage mechanism can
 * change later (e.g. to real JWT handling) without touching module code.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  signIn: (user, token) => set({ user, token }),
  signOut: () => set({ user: null, token: null }),
}));
