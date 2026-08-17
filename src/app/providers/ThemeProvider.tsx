import { ReactNode } from "react";

/**
 * Placeholder — Clinical Ink is currently a single fixed theme (no
 * light/dark toggle). If that changes, this is where the toggle state
 * and CSS variable overrides get wired up. Kept as a pass-through now
 * so the provider composition pattern (see App.tsx) doesn't need to
 * change shape later.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
