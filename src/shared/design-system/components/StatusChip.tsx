import { ReactNode } from "react";

export type StatusTone = "success" | "warning" | "critical" | "info" | "neutral";

/** Base color per tone, sourced from tokens.css — never a hardcoded hex here. */
const toneVar: Record<StatusTone, string> = {
  success: "var(--vital-green)",
  warning: "var(--caution-amber)",
  critical: "var(--pulse-coral)",
  info: "var(--signal-indigo)",
  neutral: "var(--outline)",
};

interface StatusChipProps {
  tone: StatusTone;
  children: ReactNode;
  pulse?: boolean;
}

export function StatusChip({ tone, children, pulse }: StatusChipProps) {
  const base = toneVar[tone];
  const fg = `color-mix(in srgb, ${base} 70%, black)`;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-display font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${base} 14%, white)`, color: fg }}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full animate-pulseGlow" style={{ backgroundColor: fg }} />}
      {children}
    </span>
  );
}
