import { ReactNode } from "react";

/**
 * Placeholder for React Query (or similar) once real backend calls
 * replace the mock API layer — gives every module consistent caching/
 * retry/loading-state behavior for free instead of each module
 * hand-rolling useEffect + useState fetching (as the current mock
 * screens do). Add the real QueryClientProvider here when that day comes.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
