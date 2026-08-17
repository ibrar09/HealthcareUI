import type { LiveStatusRow } from "@modules/hospital-admin/api";

const levelMeta: Record<LiveStatusRow["level"], { color: string; label: string }> = {
  normal: { color: "var(--vital-green)", label: "Normal" },
  busy: { color: "var(--caution-amber)", label: "Busy" },
  critical: { color: "var(--pulse-coral)", label: "Critical" },
  offline: { color: "var(--pulse-coral)", label: "Offline" },
};

interface LiveStatusListProps {
  rows: LiveStatusRow[];
}

/** Module-local — the Admin Dashboard's "Live Hospital Status" traffic-light list (spec §6): tells admin where the problem is without opening every module. */
export function LiveStatusList({ rows }: LiveStatusListProps) {
  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((r) => {
        const meta = levelMeta[r.level];
        return (
          <div key={r.module} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
              <span className="text-sm font-semibold text-on-surface truncate">{r.module}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</p>
              <p className="text-[11px] text-on-surface-variant/80">{r.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
