import { FileText, Search } from "lucide-react";
import { KPICard } from "@shared/design-system/components";
import { radiologyReportStatusMeta, formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { RadiologyReportRow, RadiologyReportStatus } from "@modules/hospital-admin/api";

interface RadiologyReportsPanelProps {
  reports: RadiologyReportRow[];
  counts: Record<RadiologyReportStatus, number>;
  statusFilter: RadiologyReportStatus | "all";
  onStatusFilterChange: (v: RadiologyReportStatus | "all") => void;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}

/** Module-local — Radiology "Reports" tab (spec §21): view-only, no authoring — that stays with the radiologist's own workspace. */
export function RadiologyReportsPanel({ reports, counts, statusFilter, onStatusFilterChange, search, onSearchChange, onSelect }: RadiologyReportsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Draft" value={counts.draft} icon={<FileText size={14} />} accentColor="var(--outline)" />
        <KPICard label="Preliminary" value={counts.preliminary} icon={<FileText size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Final" value={counts.final} icon={<FileText size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Amended" value={counts.amended} icon={<FileText size={14} />} accentColor="var(--signal-indigo)" />
      </div>

      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by patient or order number..."
          className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "draft", "preliminary", "final", "amended"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusFilterChange(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {s === "all" ? "All" : radiologyReportStatusMeta[s].label}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No reports match your filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => {
            const meta = radiologyReportStatusMeta[r.status];
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                  <FileText size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-on-surface truncate">{r.orderNumber}</h3>
                  <p className="text-xs text-on-surface-variant truncate">
                    {r.patientName} · {r.studyName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {r.radiologistName} · {formatDateTime(r.effectiveDateTime)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
