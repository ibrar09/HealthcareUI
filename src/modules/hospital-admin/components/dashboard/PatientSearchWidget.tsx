import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/hospital-admin/api";

/** Module-local — the Reception Dashboard's Patient Search (spec §22): the single most-used reception feature, so it gets its own prominent widget with live results as the user types. */
export function PatientSearchWidget() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof api.getPatients>>["results"]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      api.getPatients({ page: 1, pageSize: 5, search: query }).then((page) => setResults(page.results));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Card hero accentColor="var(--signal-indigo)">
      <h2 className="font-display font-semibold text-on-surface mb-1">Search Patient</h2>
      <p className="text-xs text-on-surface-variant mb-3">Name, MRN, national ID, phone, or date of birth</p>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search........................."
          className="w-full rounded-input border border-line pl-10 pr-4 py-3 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
        />
      </div>

      {results.length > 0 && (
        <div className="flex flex-col divide-y divide-line -mx-2">
          {results.map((p) => {
            const mrn = api.getIdentifier(p.identifiers, "mrn")?.value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.PATIENT_DETAIL(p.id))}
                className="flex items-center justify-between gap-3 px-2 py-2.5 text-left hover:bg-surface-container-low rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{api.getPatientFullName(p.name)}</p>
                  <p className="text-xs text-on-surface-variant">{mrn ?? "No MRN"} · DOB {p.dob} · {p.phone}</p>
                </div>
                <ChevronRight size={14} className="text-on-surface-variant flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
      {query.trim().length >= 2 && results.length === 0 && (
        <p className="text-sm text-on-surface-variant text-center py-4">No patients found for "{query}".</p>
      )}
    </Card>
  );
}
