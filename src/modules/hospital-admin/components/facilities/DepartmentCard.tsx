import { ReactNode } from "react";
import { StatusChip, StatusTone } from "@shared/design-system/components";

export type DepartmentOperationalStatus = "normal" | "critical" | "overload" | "optimal";

interface DepartmentCardProps {
  name: string;
  code: string;
  headDoctorName: string;
  floorName?: string;
  typeName: string;
  typeAccentColor: string;
  totalStaffCount: number;
  active: boolean;
  operationalStatus: DepartmentOperationalStatus;
  icon: ReactNode;
  accentColor: string;
  onSelect?: () => void;
}

const operationalStatusMeta: Record<DepartmentOperationalStatus, { label: string; tone: StatusTone; color: string }> = {
  critical: { label: "Critical", tone: "critical", color: "var(--pulse-coral)" },
  overload: { label: "Overload", tone: "warning", color: "var(--caution-amber)" },
  normal: { label: "Normal", tone: "neutral", color: "var(--outline)" },
  optimal: { label: "Optimal", tone: "success", color: "var(--vital-green)" },
};

/** Module-local — the Department Configuration grid card (Facilities › Departments tab). Click opens the full Department Detail drawer, not the edit form directly. */
export function DepartmentCard({ name, code, headDoctorName, floorName, typeName, typeAccentColor, totalStaffCount, active, operationalStatus, icon, accentColor, onSelect }: DepartmentCardProps) {
  const meta = operationalStatusMeta[operationalStatus];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative bg-white rounded-3xl border border-white shadow-soft overflow-hidden flex flex-col text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${!active ? "opacity-50" : ""}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
      <div className="p-6 pl-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`, color: accentColor }}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-on-surface leading-snug truncate">
                {name} <span className="text-xs font-normal text-on-surface-variant font-mono">{code}</span>
              </h3>
              <p className="text-sm text-on-surface-variant truncate">{headDoctorName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
            {!active && <span className="text-[10px] font-bold text-on-surface-variant">Inactive</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ backgroundColor: `color-mix(in srgb, ${typeAccentColor} 14%, transparent)`, color: typeAccentColor }}>
            {typeName}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Floor / Location</p>
            <p className="font-semibold text-on-surface text-sm">{floorName ?? "Not set"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Staff</p>
            <p className="font-bold text-on-surface text-2xl leading-none">{totalStaffCount}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
