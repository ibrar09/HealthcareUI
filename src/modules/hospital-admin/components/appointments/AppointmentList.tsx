import { CSSProperties } from "react";
import { appointmentStatusMeta } from "@modules/hospital-admin/components/appointmentStatusMeta";
import type { AppointmentListRow } from "@modules/hospital-admin/api";

const priorityLabel: Record<AppointmentListRow["priority"], string> = {
  routine: "Routine",
  urgent: "Urgent",
  high: "High",
  emergency: "Emergency",
};

interface AppointmentListProps {
  rows: AppointmentListRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Appointments "Appointments" tab, searchable list (spec §3). */
export function AppointmentList({ rows, onSelect }: AppointmentListProps) {
  if (rows.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No appointments match your filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => {
        const meta = appointmentStatusMeta[r.status];
        const [, time] = r.start.split("T");
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_var(--row-glow)]"
            style={{ "--row-glow": `color-mix(in srgb, ${meta.color} 30%, transparent)` } as CSSProperties}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />

            <div className="w-16 flex-shrink-0 text-center">
              <p className="font-mono text-sm font-bold text-on-surface">{time}</p>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-on-surface truncate">{r.patientName}</h3>
                {r.priority !== "routine" && (
                  <span className="rounded-md bg-pulse-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pulse-coral flex-shrink-0">
                    {priorityLabel[r.priority]}
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant truncate">
                {r.practitionerName} · {r.appointmentTypeName}
                {r.departmentName ? ` · ${r.departmentName}` : ""}
              </p>
            </div>

            <div className="hidden md:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Patient MRN</p>
              <p className="text-xs font-semibold text-on-surface font-mono">{r.patientMrn ?? "—"}</p>
            </div>

            <div className="flex-shrink-0">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
