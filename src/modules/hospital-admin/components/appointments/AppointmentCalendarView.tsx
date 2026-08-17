import { Ban, Plus } from "lucide-react";
import { appointmentStatusMeta } from "@modules/hospital-admin/components/appointmentStatusMeta";
import type { DaySchedule } from "@modules/hospital-admin/api";

interface AppointmentCalendarViewProps {
  daySchedule: DaySchedule | null;
  onSelectAppointment: (id: string) => void;
  onSelectSlot: (time: string) => void;
}

/** Module-local — Appointments "Calendar" tab, day view (spec §2). Week/Month views are a follow-up. */
export function AppointmentCalendarView({ daySchedule, onSelectAppointment, onSelectSlot }: AppointmentCalendarViewProps) {
  if (!daySchedule) return null;

  if (!daySchedule.working) {
    return (
      <div className="flex flex-col items-center text-center py-16 rounded-2xl border border-line bg-white shadow-card">
        <p className="font-bold text-on-surface">
          {daySchedule.onLeave ? `${daySchedule.practitionerName} is on leave` : `${daySchedule.practitionerName} isn't scheduled this day`}
        </p>
        <p className="text-sm text-on-surface-variant mt-1">
          {daySchedule.onLeave ? daySchedule.leaveReason : "Pick a different date or doctor."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white shadow-card overflow-hidden">
      <div className="flex flex-col divide-y divide-line">
        {daySchedule.slots.map((slot) => {
          if (slot.status === "available") {
            return (
              <button
                key={slot.start}
                type="button"
                onClick={() => onSelectSlot(slot.start)}
                className="group flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-signal-indigo-tint"
              >
                <span className="w-16 flex-shrink-0 font-mono text-xs font-semibold text-on-surface-variant">{slot.start}</span>
                <span className="flex-1 text-sm text-on-surface-variant italic">Available</span>
                <span className="flex-shrink-0 items-center gap-1 text-xs font-semibold text-signal-indigo opacity-0 group-hover:opacity-100 transition-opacity flex">
                  <Plus size={13} /> Book
                </span>
              </button>
            );
          }
          if (slot.status === "blocked") {
            return (
              <div key={slot.start} className="flex items-center gap-4 px-5 py-3">
                <span className="w-16 flex-shrink-0 font-mono text-xs font-semibold text-on-surface-variant">{slot.start}</span>
                <span className="flex-1 flex items-center gap-1.5 text-sm text-on-surface-variant italic">
                  <Ban size={13} /> Blocked{slot.blockedReason ? ` — ${slot.blockedReason}` : ""}
                </span>
              </div>
            );
          }
          const meta = appointmentStatusMeta[slot.appointment!.status];
          return (
            <button
              key={slot.start}
              type="button"
              onClick={() => onSelectAppointment(slot.appointment!.id)}
              className="relative flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-container-low"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
              <span className="w-16 flex-shrink-0 font-mono text-xs font-semibold text-on-surface-variant">{slot.start}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-on-surface truncate">{slot.appointment!.patientName}</p>
                <p className="text-xs text-on-surface-variant truncate">{slot.appointment!.appointmentTypeName}</p>
              </div>
              <span
                className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}
              >
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
