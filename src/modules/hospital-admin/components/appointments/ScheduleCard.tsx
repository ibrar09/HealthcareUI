import { Ban, CalendarOff, Clock, Pencil, Plus, X } from "lucide-react";
import type { BlockedTime, DoctorLeave } from "@modules/hospital-admin/api";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ScheduleView {
  id: string;
  practitionerId: string;
  practitionerName: string;
  departmentName?: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean;
}

interface ScheduleCardProps {
  schedule: ScheduleView;
  leaves: DoctorLeave[];
  blockedTimes: BlockedTime[];
  onEdit: () => void;
  onAddLeave: () => void;
  onAddBlockedTime: () => void;
  onRemoveLeave: (id: string) => void;
  onRemoveBlockedTime: (id: string) => void;
}

/** Module-local — Appointments "Schedules" tab card (spec §10, §13-14): working pattern + leave + blocked time for one doctor. */
export function ScheduleCard({ schedule, leaves, blockedTimes, onEdit, onAddLeave, onAddBlockedTime, onRemoveLeave, onRemoveBlockedTime }: ScheduleCardProps) {
  return (
    <div className="relative bg-white rounded-3xl border border-white shadow-soft overflow-hidden p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-signal-indigo-tint text-signal-indigo">
            <Clock size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-on-surface leading-snug truncate">{schedule.practitionerName}</h3>
            <p className="text-xs text-on-surface-variant truncate">{schedule.departmentName ?? "No department"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{
              backgroundColor: schedule.active ? "color-mix(in srgb, var(--vital-green) 14%, transparent)" : "color-mix(in srgb, var(--outline) 14%, transparent)",
              color: schedule.active ? "var(--vital-green)" : "var(--outline)",
            }}
          >
            {schedule.active ? "Active" : "Inactive"}
          </span>
          <button type="button" onClick={onEdit} className="text-signal-indigo hover:text-signal-indigo-dark transition-colors">
            <Pencil size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {weekDays.map((d) => (
          <span
            key={d}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              schedule.workingDays.includes(d) ? "bg-signal-indigo-tint text-signal-indigo" : "bg-surface-container-low text-on-surface-variant/50"
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
        <span className="text-on-surface-variant">Hours</span>
        <span className="font-semibold text-on-surface">
          {schedule.startTime} – {schedule.endTime}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm -mt-3">
        <span className="text-on-surface-variant">Slot Duration</span>
        <span className="font-semibold text-on-surface">{schedule.slotDurationMinutes} min</span>
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Upcoming Leave</p>
          <button type="button" onClick={onAddLeave} className="flex items-center gap-1 text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark">
            <Plus size={12} /> Add
          </button>
        </div>
        {leaves.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">None scheduled.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {leaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg bg-sunset-coral/[0.06] px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CalendarOff size={12} className="text-sunset-coral flex-shrink-0" />
                  <span className="text-xs text-on-surface truncate">
                    {l.startDate === l.endDate ? l.startDate : `${l.startDate} – ${l.endDate}`} · {l.type}
                  </span>
                </div>
                <button type="button" onClick={() => onRemoveLeave(l.id)} className="flex-shrink-0 text-on-surface-variant hover:text-pulse-coral">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Blocked Time</p>
          <button type="button" onClick={onAddBlockedTime} className="flex items-center gap-1 text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark">
            <Plus size={12} /> Add
          </button>
        </div>
        {blockedTimes.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">None scheduled.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {blockedTimes.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 rounded-lg bg-caution-amber/[0.08] px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Ban size={12} className="text-caution-amber flex-shrink-0" />
                  <span className="text-xs text-on-surface truncate">
                    {b.date} · {b.startTime}–{b.endTime} · {b.reason}
                  </span>
                </div>
                <button type="button" onClick={() => onRemoveBlockedTime(b.id)} className="flex-shrink-0 text-on-surface-variant hover:text-pulse-coral">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
