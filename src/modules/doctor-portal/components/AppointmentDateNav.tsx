import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface AppointmentDateNavProps {
  date: string; // ISO yyyy-mm-dd
  onDateChange: (date: string) => void;
  label: string; // "Today, 18 Aug 2026"
}

function shiftDate(iso: string, days: number): string {
  // Stays in local calendar fields throughout — round-tripping through
  // toISOString() here would convert to UTC and silently shift the date
  // by a day whenever the runner's local offset isn't UTC+0.
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Module-local — day-by-day navigation for the Appointments list (prev/next/today/jump-to-date). */
export function AppointmentDateNav({ date, onDateChange, label }: AppointmentDateNavProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onDateChange(shiftDate(date, -1))}
        aria-label="Previous day"
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 min-w-[180px] justify-center">
        <CalendarDays className="w-4 h-4 text-slate-400" /> {label}
      </div>
      <button
        type="button"
        onClick={() => onDateChange(shiftDate(date, 1))}
        aria-label="Next day"
        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => e.target.value && onDateChange(e.target.value)}
        aria-label="Jump to date"
        className="text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
