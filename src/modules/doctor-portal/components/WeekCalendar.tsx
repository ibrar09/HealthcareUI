import type { Appointment, AppointmentStatus, RosterPatient } from "@modules/doctor-portal/api";

interface WeekCalendarProps {
  referenceDate: string; // any ISO date within the target week
  appointments: Appointment[]; // all appointments, filtered internally
  roster: RosterPatient[];
  todayIso: string;
  onSelectAppointment: (id: string) => void;
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  Requested: "bg-slate-400", Scheduled: "bg-blue-500", Confirmed: "bg-blue-500",
  "Checked-in": "bg-violet-500", Waiting: "bg-amber-500", "In Consultation": "bg-emerald-500",
  Completed: "bg-slate-300", Cancelled: "bg-rose-400", "No-show": "bg-rose-400", Rescheduled: "bg-blue-500",
};

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let [, h, m, ampm] = match;
  let hours = parseInt(h, 10);
  if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
  return hours * 60 + parseInt(m, 10);
}

export function weekLabel(referenceDate: string): string {
  const ref = new Date(`${referenceDate}T00:00:00`);
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

/** Module-local — 7-column week view for the Appointments calendar: compact per-day appointment lists, click to open the shared Details slide-over. */
export function WeekCalendar({ referenceDate, appointments, roster, todayIso, onSelectAppointment }: WeekCalendarProps) {
  const ref = new Date(`${referenceDate}T00:00:00`);
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
      {days.map((d) => {
        const iso = toLocalISO(d);
        const isToday = iso === todayIso;
        const dayAppointments = appointments.filter((a) => a.date === iso).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

        return (
          <div key={iso} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${isToday ? "border-blue-200" : "border-slate-100"}`}>
            <div className={`px-3 py-2 text-center border-b ${isToday ? "bg-blue-50/60 border-blue-100" : "border-slate-50"}`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
              <p className={`text-sm font-bold ${isToday ? "text-blue-600" : "text-slate-700"}`}>{d.getDate()}</p>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-1.5 min-h-[160px]">
              {dayAppointments.length === 0 ? (
                <p className="text-[10px] text-slate-300 text-center mt-3">—</p>
              ) : (
                dayAppointments.map((a) => {
                  const patient = roster.find((p) => p.id === a.patientId);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onSelectAppointment(a.id)}
                      className="flex items-center gap-1.5 text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-50"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[a.status]}`} />
                      <span className="min-w-0">
                        <span className="block text-[10px] text-slate-400">{a.time}</span>
                        <span className="block text-[11px] font-semibold text-slate-700 truncate">{patient?.name ?? "Unknown"}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
