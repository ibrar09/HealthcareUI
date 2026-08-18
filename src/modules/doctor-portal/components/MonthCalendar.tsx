import type { Appointment, AppointmentStatus } from "@modules/doctor-portal/api";

interface MonthCalendarProps {
  referenceDate: string; // any ISO date within the target month
  appointments: Appointment[]; // all appointments, filtered internally
  todayIso: string;
  onSelectDay: (iso: string) => void;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export function monthLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Module-local — month grid for the Appointments calendar view: date + count + status dots per day, click to jump to List view for that date. */
export function MonthCalendar({ referenceDate, appointments, todayIso, onSelectDay }: MonthCalendarProps) {
  const ref = new Date(`${referenceDate}T00:00:00`);
  const year = ref.getFullYear();
  const month = ref.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first rotation
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toLocalISO(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = appointments.reduce((map, a) => {
    if (!map.has(a.date)) map.set(a.date, []);
    map.get(a.date)!.push(a);
    return map;
  }, new Map<string, Appointment[]>());

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`blank-${i}`} className="border-b border-r border-slate-50 min-h-[92px]" />;
          const dayAppointments = byDate.get(iso) ?? [];
          const statuses = Array.from(new Set(dayAppointments.map((a) => a.status))).slice(0, 4);
          const isToday = iso === todayIso;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(iso)}
              className={`border-b border-r border-slate-50 min-h-[92px] p-2 text-left hover:bg-slate-50 transition-colors ${isToday ? "bg-blue-50/60" : ""}`}
            >
              <span className={`text-xs font-semibold ${isToday ? "text-blue-600" : "text-slate-600"}`}>{parseInt(iso.slice(-2), 10)}</span>
              {dayAppointments.length > 0 && (
                <>
                  <p className="text-[10px] text-slate-400 mt-1">{dayAppointments.length} appt{dayAppointments.length > 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {statuses.map((s) => <span key={s} className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />)}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
