import { CSSProperties, ReactNode } from "react";
import { Pencil } from "lucide-react";
import { StatusChip, StatusTone } from "@shared/design-system/components";

interface StaffRowProps {
  name: string;
  initials: string;
  specialty: string;
  title: string;
  licenseNumber: string;
  statusTone: StatusTone;
  statusLabel: string;
  roleIcon: ReactNode;
  accentColor: string;
  onDutyToday: boolean;
  onView?: () => void;
  onManage?: () => void;
}

/** Module-local — the Staff Directory row (avatar + role badge, gradient bar, hover glow). */
export function StaffRow({
  name,
  initials,
  specialty,
  title,
  licenseNumber,
  statusTone,
  statusLabel,
  roleIcon,
  accentColor,
  onDutyToday,
  onView,
  onManage,
}: StaffRowProps) {
  return (
    <button
      type="button"
      onClick={onView}
      className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_var(--row-glow)]"
      style={{ "--row-glow": `color-mix(in srgb, ${accentColor} 30%, transparent)` } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)` }}
      />
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundImage: `linear-gradient(180deg, ${accentColor}, color-mix(in srgb, ${accentColor} 30%, transparent))` }}
      />

      <div className="relative z-10 flex-shrink-0">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold border-2"
          style={{
            backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 18%, white), color-mix(in srgb, ${accentColor} 8%, white))`,
            color: accentColor,
            borderColor: `color-mix(in srgb, ${accentColor} 35%, transparent)`,
          }}
        >
          {initials}
        </span>
        <span
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-line shadow-sm"
          style={{ color: accentColor }}
        >
          {roleIcon}
        </span>
        <span
          className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${onDutyToday ? "bg-vital-green animate-pulseGlow" : "bg-outline-variant"}`}
          title={onDutyToday ? "On duty today" : "Off today"}
        />
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-on-surface truncate">{name}</h3>
          {onDutyToday && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-vital-green flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-vital-green animate-pulseGlow" />
              On Duty
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant truncate">
          {specialty} · {title}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-6 flex-shrink-0">
        <div className="hidden sm:block text-right">
          <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">License</p>
          <p className="font-mono text-xs text-on-surface">{licenseNumber}</p>
        </div>
        <StatusChip tone={statusTone}>{statusLabel}</StatusChip>
        {onManage && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onManage();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onManage();
              }
            }}
            aria-label={`Edit ${name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-signal-indigo transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </span>
        )}
      </div>
    </button>
  );
}
