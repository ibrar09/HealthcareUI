import { Search } from "lucide-react";
import type { EncounterType } from "@modules/doctor-portal/api";

export type AppointmentStatusFilterKey = "all" | "requested" | "upcoming" | "waiting" | "in-progress" | "completed" | "cancelled" | "no-show";

export interface AppointmentStatusChip {
  key: AppointmentStatusFilterKey;
  label: string;
  count: number;
}

interface AppointmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  chips: AppointmentStatusChip[];
  activeChip: AppointmentStatusFilterKey;
  onChipChange: (chip: AppointmentStatusFilterKey) => void;
  typeFilter: EncounterType | "all";
  onTypeFilterChange: (type: EncounterType | "all") => void;
}

const ENCOUNTER_TYPES: (EncounterType | "all")[] = ["all", "OPD", "IPD", "Emergency", "Telemedicine", "Follow-up"];

/** Module-local — search + status chips + encounter-type filter for the Appointments list. */
export function AppointmentFilters({ search, onSearchChange, chips, activeChip, onChipChange, typeFilter, onTypeFilterChange }: AppointmentFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by patient, MRN, appointment ID, department…"
            aria-label="Search appointments"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as EncounterType | "all")}
          aria-label="Filter by encounter type"
          className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {ENCOUNTER_TYPES.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {chips.map((chip) => {
          const isActive = chip.key === activeChip;
          return (
            <button
              key={chip.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChipChange(chip.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {chip.label}
              <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
