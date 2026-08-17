import { CSSProperties } from "react";
import { ShieldAlert } from "lucide-react";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { BedListRow } from "@modules/hospital-admin/api";

interface BedListProps {
  rows: BedListRow[];
  onSelectBed: (id: string) => void;
}

/** Module-local — the Bed Management "Beds" tab searchable list (spec §3), row-card pattern matching PatientRow/StaffRow. */
export function BedList({ rows, onSelectBed }: BedListProps) {
  if (rows.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No beds match your filters.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => {
        const meta = bedStatusMeta[r.status];
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectBed(r.id)}
            className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_var(--row-glow)]"
            style={{ "--row-glow": `color-mix(in srgb, ${meta.color} 30%, transparent)` } as CSSProperties}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />

            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: meta.color }}
            >
              {r.identifier.split("-").pop()}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-on-surface truncate">{r.identifier}</h3>
                {r.isolationRequired && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-sunset-coral/10 text-sunset-coral flex-shrink-0">
                    <ShieldAlert size={10} /> Isolation
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant truncate">
                {r.wardName} · {r.roomName}
                {r.departmentName ? ` · ${r.departmentName}` : ""}
              </p>
            </div>

            <div className="hidden md:block text-right flex-shrink-0 w-28">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Type</p>
              <p className="text-xs font-semibold text-on-surface">{r.bedTypeName}</p>
            </div>

            <div className="hidden lg:block text-right flex-shrink-0 w-36">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Patient</p>
              <p className="text-xs font-semibold text-on-surface truncate">
                {r.patientName ?? (r.reservedForName ? `Reserved — ${r.reservedForName}` : "—")}
              </p>
            </div>

            <div className="hidden xl:block text-right flex-shrink-0 w-24">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Updated</p>
              <p className="text-xs font-semibold text-on-surface">{r.lastUpdated}</p>
            </div>

            <div className="flex-shrink-0">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
