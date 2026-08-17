import { ReactNode } from "react";

/**
 * Placeholder for real auth bootstrapping (e.g. reading a stored token
 * on app load, silently refreshing it). Right now auth state lives
 * entirely in the Zustand store (src/store/authStore.ts) with no
 * persistence — this is where that gets added once real IAM exists.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
