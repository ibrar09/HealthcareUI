import { CheckCircle2, PlayCircle, Users } from "lucide-react";
import { appointmentStatusMeta } from "@modules/hospital-admin/components/appointmentStatusMeta";
import type { AppointmentListRow } from "@modules/hospital-admin/api";

interface QueueViewProps {
  rows: AppointmentListRow[];
  onStartConsultation: (id: string) => void;
  onCompleteConsultation: (id: string) => void;
  onSelect: (id: string) => void;
}

/** Module-local — Appointments "Queue" tab (spec §27): today's checked-in/waiting/in-progress patients, in arrival order. */
export function QueueView({ rows, onStartConsultation, onCompleteConsultation, onSelect }: QueueViewProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vital-green/10 text-vital-green mb-3">
          <Users size={22} />
        </span>
        <p className="font-bold text-on-surface">Queue is empty</p>
        <p className="text-sm text-on-surface-variant mt-1">No patients are currently checked in or waiting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => {
        const meta = appointmentStatusMeta[r.status];
        const [, time] = r.start.split("T");
        return (
          <div
            key={r.id}
            className="relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden shadow-card"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-low font-mono text-xs font-bold text-on-surface-variant">
              {String(i + 1).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => onSelect(r.id)} className="min-w-0 flex-1 text-left">
              <h3 className="font-bold text-on-surface truncate">{r.patientName}</h3>
              <p className="text-xs text-on-surface-variant truncate">
                {r.practitionerName} · {r.appointmentTypeName} · Booked {time}
              </p>
            </button>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}
            >
              {meta.label}
            </span>
            {(r.status === "checked-in" || r.status === "waiting") && (
              <button
                type="button"
                onClick={() => onStartConsultation(r.id)}
                className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-glow hover:brightness-110 transition-all flex-shrink-0"
              >
                <PlayCircle size={13} /> Start
              </button>
            )}
            {r.status === "in-progress" && (
              <button
                type="button"
                onClick={() => onCompleteConsultation(r.id)}
                className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-glow hover:brightness-110 transition-all flex-shrink-0"
              >
                <CheckCircle2 size={13} /> Complete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
