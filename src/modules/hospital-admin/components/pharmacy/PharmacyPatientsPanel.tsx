import { Search, UserRound } from "lucide-react";
import { Card } from "@shared/design-system/components";

interface PharmacyPatientsPanelProps {
  patients: { id: string; fullName: string }[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
}

/** Module-local — Patient Pharmacy Profile entry point (spec §5): search a patient to see current medications and medication history. */
export function PharmacyPatientsPanel({ patients, search, onSearchChange, onSelect }: PharmacyPatientsPanelProps) {
  const filtered = search.trim() ? patients.filter((p) => p.fullName.toLowerCase().includes(search.trim().toLowerCase())) : patients;
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="relative w-full sm:w-80">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
          placeholder="Search patient by name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => (
          <button key={p.id} type="button" onClick={() => onSelect(p.id)} className="text-left">
            <Card hero className="hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                  <UserRound size={16} />
                </span>
                <span className="font-semibold text-on-surface">{p.fullName}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
