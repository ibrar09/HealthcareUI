import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarGranularity = "week" | "month";

interface CalendarNavProps {
  granularity: CalendarGranularity;
  onGranularityChange: (g: CalendarGranularity) => void;
  referenceDate: string; // ISO
  onReferenceDateChange: (iso: string) => void;
  label: string;
}

// Local calendar-field arithmetic throughout — never round-trips through
// toISOString(), which converts to UTC and silently shifts the date
// whenever the runner's local offset isn't UTC+0 (see AppointmentDateNav).
function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toLocalISO(d);
}

export function shiftMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return toLocalISO(d);
}

/** Module-local — prev/next/today navigation + Week/Month toggle for the Appointments calendar view. */
export function CalendarNav({ granularity, onGranularityChange, referenceDate, onReferenceDateChange, label }: CalendarNavProps) {
  function handlePrev() {
    onReferenceDateChange(granularity === "week" ? shiftDays(referenceDate, -7) : shiftMonths(referenceDate, -1));
  }
  function handleNext() {
    onReferenceDateChange(granularity === "week" ? shiftDays(referenceDate, 7) : shiftMonths(referenceDate, 1));
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={handlePrev} aria-label={`Previous ${granularity}`} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 min-w-[180px] text-center">{label}</div>
        <button type="button" onClick={handleNext} aria-label={`Next ${granularity}`} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onReferenceDateChange("2026-08-18")}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2"
        >
          Today
        </button>
      </div>

      <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => onGranularityChange("week")}
          className={`px-3 py-1.5 text-xs font-semibold ${granularity === "week" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => onGranularityChange("month")}
          className={`px-3 py-1.5 text-xs font-semibold ${granularity === "month" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
        >
          Month
        </button>
      </div>
    </div>
  );
}
