import type { SlotDurationConfig, VisitType } from "@modules/doctor-portal/api";

interface SlotDurationCardProps {
  durations: SlotDurationConfig[];
  onChange: (visitType: VisitType, minutes: number) => void;
}

/** Module-local — default appointment duration per visit type; Book Appointment reads this to auto-fill its duration field. */
export function SlotDurationCard({ durations, onChange }: SlotDurationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-1">Appointment Slot Durations</h2>
      <p className="text-[11px] text-slate-400 mb-4">Used to auto-fill duration when booking, based on the selected visit type.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {durations.map((d) => (
          <div key={d.visitType} className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-600">{d.visitType}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="number"
                min={5}
                step={5}
                value={d.minutes}
                onChange={(e) => onChange(d.visitType, Number(e.target.value))}
                className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <span className="text-[11px] text-slate-400">min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
