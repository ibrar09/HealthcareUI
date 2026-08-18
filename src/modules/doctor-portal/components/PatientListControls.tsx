import { Search, SlidersHorizontal, Columns3, LayoutGrid, LayoutList } from "lucide-react";
import type { SmartViewKey } from "@modules/doctor-portal/api";

export interface SmartViewChip {
  key: SmartViewKey;
  label: string;
  count: number;
}

interface PatientListControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  chips: SmartViewChip[];
  activeChip: SmartViewKey;
  onChipChange: (chip: SmartViewKey) => void;
  onToggleFilters: () => void;
  filtersActive: boolean;
  onToggleColumns: () => void;
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
  groupBy: "none" | "department" | "location";
  onGroupByChange: (value: "none" | "department" | "location") => void;
}

/** Module-local — search bar, smart-view chips, and the Filters/Columns/view-mode/group-by toolbar for My Patients. */
export function PatientListControls({
  search, onSearchChange, chips, activeChip, onChipChange,
  onToggleFilters, filtersActive, onToggleColumns, viewMode, onViewModeChange, groupBy, onGroupByChange,
}: PatientListControlsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, MRN, patient ID, encounter #, phone, DOB, diagnosis, medication, department…"
          aria-label="Search patients"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Smart views">
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

        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as typeof groupBy)}
            aria-label="Group by"
            className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="none">No grouping</option>
            <option value="department">Group by Department</option>
            <option value="location">Group by Location</option>
          </select>

          <button
            type="button"
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              filtersActive ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>

          <button
            type="button"
            onClick={onToggleColumns}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Columns3 className="w-3.5 h-3.5" /> Columns
          </button>

          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              aria-label="Table view"
              className={`p-1.5 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("card")}
              aria-label="Card view"
              className={`p-1.5 ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
