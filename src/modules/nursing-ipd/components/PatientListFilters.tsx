import { Search, SlidersHorizontal } from "lucide-react";

export type QuickFilterKey = "all" | "critical" | "medication-due" | "assessment-due" | "discharge-pending";

export interface QuickFilterChip {
  key: QuickFilterKey;
  label: string;
  count: number;
}

interface PatientListFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  chips: QuickFilterChip[];
  activeChip: QuickFilterKey;
  onChipChange: (chip: QuickFilterKey) => void;
  onToggleFilters: () => void;
  filtersActive: boolean;
}

/** Module-local — search + quick-filter chips for the Nursing Portal's My Patients list. */
export function PatientListFilters({ search, onSearchChange, chips, activeChip, onChipChange, onToggleFilters, filtersActive }: PatientListFiltersProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, MRN, room, bed, or diagnosis…"
            aria-label="Search patients"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400"
          />
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-lg border transition-colors flex-shrink-0 ${
            filtersActive ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Quick filters">
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
                isActive ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
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
