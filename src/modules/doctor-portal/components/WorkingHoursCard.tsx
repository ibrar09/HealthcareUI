import type { DayHours, DayName } from "@modules/doctor-portal/api";

interface WorkingHoursCardProps {
  hours: DayHours[];
  onChange: (day: DayName, updates: Partial<Omit<DayHours, "day">>) => void;
}

const timeInputClass = "text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-300";

/** Module-local — weekly working hours + optional per-day break window. Toggling a day off disables its time inputs rather than hiding them, so the last-set hours aren't lost. */
export function WorkingHoursCard({ hours, onChange }: WorkingHoursCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-4">Working Hours</h2>
      <div className="flex flex-col divide-y divide-slate-50">
        {hours.map((d) => (
          <div key={d.day} className="flex items-center gap-4 py-3 flex-wrap">
            <label className="flex items-center gap-2 w-32 flex-shrink-0">
              <input type="checkbox" checked={d.enabled} onChange={(e) => onChange(d.day, { enabled: e.target.checked })} className="accent-blue-600" />
              <span className="text-xs font-semibold text-slate-700">{d.day}</span>
            </label>

            {d.enabled ? (
              <>
                <div className="flex items-center gap-1.5">
                  <input type="time" value={d.start} onChange={(e) => onChange(d.day, { start: e.target.value })} className={timeInputClass} />
                  <span className="text-xs text-slate-400">to</span>
                  <input type="time" value={d.end} onChange={(e) => onChange(d.day, { end: e.target.value })} className={timeInputClass} />
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[11px] text-slate-400">Break</span>
                  <input
                    type="time"
                    value={d.breakStart ?? ""}
                    onChange={(e) => onChange(d.day, { breakStart: e.target.value || undefined })}
                    className={timeInputClass}
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="time"
                    value={d.breakEnd ?? ""}
                    onChange={(e) => onChange(d.day, { breakEnd: e.target.value || undefined })}
                    className={timeInputClass}
                  />
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400">Off</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
