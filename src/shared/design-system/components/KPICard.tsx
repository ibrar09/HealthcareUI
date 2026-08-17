import { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "./Card";
import { Sparkline } from "./Sparkline";

interface KPICardProps {
  label: string;
  value?: string | number;
  unit?: string;
  trend?: number[];
  trendDelta?: string;
  trendDirection?: "up" | "down";
  trendGood?: boolean;
  accentColor?: string;
  icon?: ReactNode;
  valueColor?: string;
  children?: ReactNode;
}

/** The hero metric card pattern used on every dashboard across every module. */
export function KPICard({
  label,
  value,
  unit,
  trend,
  trendDelta,
  trendDirection = "up",
  trendGood = trendDirection === "up",
  accentColor = "var(--signal-indigo)",
  icon,
  valueColor = "var(--on-surface)",
  children,
}: KPICardProps) {
  const deltaColor = trendGood ? "var(--vital-green)" : "var(--pulse-coral)";

  return (
    <Card accentColor={accentColor} className="flex flex-col gap-3 min-w-[180px]">
      <div
        className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 20%, transparent)` }}
      />
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          {icon && (
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`, color: accentColor }}
            >
              {icon}
            </span>
          )}
          <span className="text-xs font-body text-on-surface-variant uppercase tracking-wide">{label}</span>
        </div>
        {trendDelta && (
          <span
            className="flex items-center gap-0.5 rounded-full pl-1 pr-1.5 py-0.5 text-[11px] font-mono font-bold flex-shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${deltaColor} 14%, transparent)`, color: deltaColor }}
          >
            {trendDirection === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendDelta}
          </span>
        )}
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        {children ?? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-bold text-3xl leading-none" style={{ color: valueColor }}>
                {value}
              </span>
              {unit && <span className="font-mono text-sm text-on-surface-variant/70">{unit}</span>}
            </div>
            {trend && <Sparkline data={trend} color={accentColor} height={28} />}
          </>
        )}
      </div>
    </Card>
  );
}
