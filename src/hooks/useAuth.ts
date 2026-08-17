import { useAuthStore } from "@/store/authStore";

/**
 * The ONLY way modules should read auth state — never import
 * useAuthStore directly in a page/component. This indirection means
 * we can swap Zustand for something else later without touching
 * every module that checks "who's logged in."
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);

  return {
    user,
    isAuthenticated: !!token,
    signIn,
    signOut,
  };
}
