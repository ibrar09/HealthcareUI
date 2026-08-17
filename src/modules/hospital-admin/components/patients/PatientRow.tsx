import { CSSProperties } from "react";
import { Copy } from "lucide-react";
import { StatusChip, StatusTone } from "@shared/design-system/components";
import type { PatientStatus } from "@modules/hospital-admin/api";

interface PatientRowProps {
  name: string;
  initials: string;
  mrn: string;
  universalHealthId: string;
  organizationName: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
  status: PatientStatus;
  possibleDuplicate: boolean;
  onView?: () => void;
}

const statusMeta: Record<PatientStatus, { label: string; tone: StatusTone; color: string }> = {
  active: { label: "Active", tone: "success", color: "var(--vital-green)" },
  discharged: { label: "Discharged", tone: "neutral", color: "var(--outline)" },
  "pending-verification": { label: "Pending Verification", tone: "warning", color: "var(--caution-amber)" },
  flagged: { label: "Flagged", tone: "critical", color: "var(--pulse-coral)" },
  merged: { label: "Merged", tone: "neutral", color: "var(--outline-variant)" },
};

/** Module-local — a patient registry row (Patient Administration). */
export function PatientRow({
  name,
  initials,
  mrn,
  universalHealthId,
  organizationName,
  dob,
  age,
  gender,
  phone,
  lastVisit,
  status,
  possibleDuplicate,
  onView,
}: PatientRowProps) {
  const meta = statusMeta[status];
  const accentColor = possibleDuplicate ? "var(--pulse-coral)" : meta.color;

  return (
    <button
      type="button"
      onClick={onView}
      className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_var(--row-glow)]"
      style={{ "--row-glow": `color-mix(in srgb, ${accentColor} 30%, transparent)` } as CSSProperties}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundImage: `linear-gradient(180deg, ${accentColor}, color-mix(in srgb, ${accentColor} 30%, transparent))` }}
      />

      <span
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold border-2"
        style={{
          backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 18%, white), color-mix(in srgb, ${accentColor} 8%, white))`,
          color: accentColor,
          borderColor: `color-mix(in srgb, ${accentColor} 35%, transparent)`,
        }}
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-on-surface truncate">{name}</h3>
          {possibleDuplicate && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-pulse-coral/10 text-pulse-coral flex-shrink-0">
              <Copy size={10} /> Possible Duplicate
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant font-mono truncate">
          {mrn} · {universalHealthId}
        </p>
        <p className="text-[10px] text-on-surface-variant truncate">{organizationName}</p>
      </div>

      <div className="hidden md:block text-right flex-shrink-0 w-24">
        <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">DOB / Sex</p>
        <p className="text-xs font-semibold text-on-surface">
          {dob} · {gender}
        </p>
        <p className="text-[10px] text-on-surface-variant">{age} yrs</p>
      </div>

      <div className="hidden lg:block text-right flex-shrink-0 w-32">
        <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Phone</p>
        <p className="text-xs font-semibold text-on-surface">{phone}</p>
      </div>

      <div className="hidden xl:block text-right flex-shrink-0 w-24">
        <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Last Visit</p>
        <p className="text-xs font-semibold text-on-surface">{lastVisit}</p>
      </div>

      <div className="flex-shrink-0">
        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
      </div>
    </button>
  );
}
