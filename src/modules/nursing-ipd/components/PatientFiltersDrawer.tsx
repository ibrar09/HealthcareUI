export interface PatientListFilters {
  rooms: string[];
  fallRisk: string[];
  isolationOnly: boolean;
}

export const EMPTY_FILTERS: PatientListFilters = { rooms: [], fallRisk: [], isolationOnly: false };

interface PatientFiltersDrawerProps {
  filters: PatientListFilters;
  onChange: (filters: PatientListFilters) => void;
  roomOptions: string[];
  onClear: () => void;
}

const FALL_RISK_OPTIONS = ["Low", "Medium", "High"];

/** Module-local — the finer-grained filter drawer (Room, Fall Risk, Isolation) for My Patients, kept separate from the always-visible quick chips. */
export function PatientFiltersDrawer({ filters, onChange, roomOptions, onClear }: PatientFiltersDrawerProps) {
  function toggleRoom(room: string) {
    const next = filters.rooms.includes(room) ? filters.rooms.filter((r) => r !== room) : [...filters.rooms, room];
    onChange({ ...filters, rooms: next });
  }
  function toggleFallRisk(risk: string) {
    const next = filters.fallRisk.includes(risk) ? filters.fallRisk.filter((r) => r !== risk) : [...filters.fallRisk, risk];
    onChange({ ...filters, fallRisk: next });
  }

  const hasAny = filters.rooms.length > 0 || filters.fallRisk.length > 0 || filters.isolationOnly;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800">Filters</h2>
        {hasAny && (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Room</p>
          <div className="flex flex-col gap-1.5">
            {roomOptions.map((room) => (
              <label key={room} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filters.rooms.includes(room)} onChange={() => toggleRoom(room)} className="accent-teal-600" />
                Room {room}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fall Risk</p>
          <div className="flex flex-col gap-1.5">
            {FALL_RISK_OPTIONS.map((risk) => (
              <label key={risk} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filters.fallRisk.includes(risk)} onChange={() => toggleFallRisk(risk)} className="accent-teal-600" />
                {risk}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Isolation</p>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input type="checkbox" checked={filters.isolationOnly} onChange={(e) => onChange({ ...filters, isolationOnly: e.target.checked })} className="accent-teal-600" />
            Isolation patients only
          </label>
        </div>
      </div>
    </div>
  );
}
