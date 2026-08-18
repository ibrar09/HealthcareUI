import type { EncounterType, LocationType } from "@modules/doctor-portal/api";

export interface PatientListFilters {
  encounterTypes: EncounterType[];
  statuses: string[];
  departments: string[];
  locationTypes: LocationType[];
  clinical: string[];
}

export const EMPTY_FILTERS: PatientListFilters = { encounterTypes: [], statuses: [], departments: [], locationTypes: [], clinical: [] };

interface PatientFiltersPanelProps {
  filters: PatientListFilters;
  onChange: (filters: PatientListFilters) => void;
  departmentOptions: string[];
  onClear: () => void;
}

const ENCOUNTER_TYPES: EncounterType[] = ["OPD", "IPD", "Emergency", "Telemedicine", "Follow-up"];
const STATUSES = ["Active", "Stable", "Attention", "High Risk", "Critical", "Discharged", "Follow-up"];
const LOCATION_TYPES: LocationType[] = ["My Clinic", "Ward", "ICU", "Emergency", "Other Facility"];
const CLINICAL_FILTERS = ["Diabetes", "Hypertension", "Heart Disease", "High Risk", "Allergy", "Critical Result"];

function CheckboxGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} className="accent-blue-600" />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Module-local — the detailed multi-select filter drawer for My Patients (encounter type, status, department, location, clinical). */
export function PatientFiltersPanel({ filters, onChange, departmentOptions, onClear }: PatientFiltersPanelProps) {
  function toggle<K extends keyof PatientListFilters>(key: K, value: string) {
    const current = filters[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  const hasAny = Object.values(filters).some((arr) => arr.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800">Filters</h2>
        {hasAny && (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <CheckboxGroup title="Encounter Type" options={ENCOUNTER_TYPES} selected={filters.encounterTypes} onToggle={(v) => toggle("encounterTypes", v)} />
        <CheckboxGroup title="Patient Status" options={STATUSES} selected={filters.statuses} onToggle={(v) => toggle("statuses", v)} />
        <CheckboxGroup title="Department" options={departmentOptions} selected={filters.departments} onToggle={(v) => toggle("departments", v)} />
        <CheckboxGroup title="Location" options={LOCATION_TYPES} selected={filters.locationTypes} onToggle={(v) => toggle("locationTypes", v)} />
        <CheckboxGroup title="Clinical" options={CLINICAL_FILTERS} selected={filters.clinical} onToggle={(v) => toggle("clinical", v)} />
      </div>
    </div>
  );
}
