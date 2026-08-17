import { Search, Layers } from "lucide-react";
import { formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { ImagingStudyRow } from "@modules/hospital-admin/api";

interface ImagingStudiesPanelProps {
  studies: ImagingStudyRow[];
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}

/** Module-local — Radiology "Studies" tab (spec §17): imaging actually performed, distinct from Orders (the request). */
export function ImagingStudiesPanel({ studies, search, onSearchChange, onSelect }: ImagingStudiesPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by patient or order number..."
          className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
        />
      </div>

      {studies.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No studies match your search.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {studies.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                <Layers size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-on-surface truncate">{s.orderNumber}</h3>
                <p className="text-xs text-on-surface-variant truncate">
                  {s.patientName} · {s.studyName}
                </p>
                <p className="text-xs text-on-surface-variant truncate">{formatDateTime(s.performedDateTime)} · {s.technologistName}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                <span className="text-xs font-semibold text-on-surface">{s.seriesCount} series</span>
                <span className="text-xs text-on-surface-variant">{s.imageCount.toLocaleString()} images</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
