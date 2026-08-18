import { AppointmentActionsMenu } from "@modules/doctor-portal/components/AppointmentActionsMenu";
import type { Appointment, AppointmentStatus, RosterPatient } from "@modules/doctor-portal/api";

interface QueueListProps {
  entries: { appointment: Appointment; position: number }[];
  roster: RosterPatient[];
  onCheckIn: (id: string) => void;
  onMarkWaiting: (id: string) => void;
  onStartEncounter: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onMarkNoShow: (id: string) => void;
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  Requested: "bg-slate-100 text-slate-600 border-slate-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  Confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  "Checked-in": "bg-violet-50 text-violet-700 border-violet-100",
  Waiting: "bg-amber-50 text-amber-700 border-amber-100",
  "In Consultation": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Completed: "bg-slate-100 text-slate-500 border-slate-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  "No-show": "bg-rose-50 text-rose-700 border-rose-100",
  Rescheduled: "bg-blue-50 text-blue-700 border-blue-100",
};

function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const mod100 = n % 100;
  return `${n}${suffixes[mod100 - 20] ?? suffixes[mod100] ?? "th"}`;
}

/** Module-local — the remaining queue below NOW/NEXT: everyone else booked for today, in order, with the same real actions as the main Appointments list. */
export function QueueList({ entries, roster, onCheckIn, onMarkWaiting, onStartEncounter, onCancel, onMarkNoShow }: QueueListProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
        <p className="text-sm text-slate-400">No one else in the queue for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
      {entries.map(({ appointment: appt, position }) => {
        const patient = roster.find((p) => p.id === appt.patientId);
        if (!patient) return null;

        const menuItems: { label: string; onClick: () => void; danger?: boolean }[] = [];
        if (appt.status === "Scheduled" || appt.status === "Confirmed") {
          menuItems.push({ label: "Mark No-show", onClick: () => onMarkNoShow(appt.id) });
        }
        menuItems.push({ label: "Cancel Appointment", onClick: () => onCancel(appt), danger: true });

        return (
          <div key={appt.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="w-9 text-xs font-bold text-slate-400 flex-shrink-0">{ordinal(position)}</span>
            <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">{patient.name}</p>
              <p className="text-[11px] text-slate-400">{appt.time} · {appt.visitType}{appt.checkedInAt ? ` · Checked in ${appt.checkedInAt}` : ""}</p>
            </div>
            <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${STATUS_STYLE[appt.status]}`}>{appt.status}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {(appt.status === "Scheduled" || appt.status === "Confirmed") && (
                <button type="button" onClick={() => onCheckIn(appt.id)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">Check In</button>
              )}
              {appt.status === "Checked-in" && (
                <button type="button" onClick={() => onMarkWaiting(appt.id)} className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg px-3 py-1.5">Mark Waiting</button>
              )}
              {appt.status === "Waiting" && (
                <button type="button" onClick={() => onStartEncounter(appt)} className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">Start Encounter</button>
              )}
              <AppointmentActionsMenu items={menuItems} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
