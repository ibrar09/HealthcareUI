import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import { getIdentifier, getPatientFullName } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface PatientPickerProps {
  value?: PatientOption;
  onChange: (patient: PatientOption | undefined) => void;
}

/** Module-local — search-as-you-type patient picker for bed assignment/reservation forms. */
export function PatientPicker({ value, onChange }: PatientPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientOption[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    api.getPatients({ page: 1, pageSize: 6, search: query }).then((page) => {
      setResults(
        page.results.map((p) => ({
          id: p.id,
          name: getPatientFullName(p.name),
          mrn: getIdentifier(p.identifiers, "mrn")?.value ?? "—",
        }))
      );
    });
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-input border border-signal-indigo bg-signal-indigo-tint px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{value.name}</p>
          <p className="text-xs font-mono text-on-surface-variant">{value.mrn}</p>
        </div>
        <button type="button" onClick={() => onChange(undefined)} className="flex-shrink-0 text-on-surface-variant hover:text-on-surface">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      <input
        className={`${formInputClass} pl-9`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patient by name or MRN..."
      />
      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-input border border-line bg-white shadow-card-hover overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange(p);
                setQuery("");
                setResults([]);
              }}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-surface-container-low transition-colors"
            >
              <span className="text-sm font-medium text-on-surface truncate">{p.name}</span>
              <span className="text-xs font-mono text-on-surface-variant flex-shrink-0">{p.mrn}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
