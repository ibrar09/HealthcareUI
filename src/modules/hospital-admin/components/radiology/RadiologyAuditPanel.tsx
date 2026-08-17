import { Search, History } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { RadiologyAuditEntry, RadiologyAuditEntityType } from "@modules/hospital-admin/api";

const entityTypes: RadiologyAuditEntityType[] = ["order", "study", "report", "critical-finding", "modality", "room", "procedure", "protocol"];

const entityLabels: Record<RadiologyAuditEntityType, string> = {
  order: "Order",
  study: "Study",
  report: "Report",
  "critical-finding": "Critical Finding",
  modality: "Modality",
  room: "Room",
  procedure: "Procedure",
  protocol: "Protocol",
};

interface RadiologyAuditPanelProps {
  entries: RadiologyAuditEntry[];
  search: string;
  onSearchChange: (value: string) => void;
  entityFilter: RadiologyAuditEntityType | "all";
  onEntityFilterChange: (value: RadiologyAuditEntityType | "all") => void;
}

/** Module-local — Radiology "Audit" tab (spec §34): a logistics-level trail of every workflow mutation this section owns. Never shows clinical content (Findings/Impression text), matching the [oversight] boundary. */
export function RadiologyAuditPanel({ entries, search, onSearchChange, entityFilter, onEntityFilterChange }: RadiologyAuditPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <History size={16} className="text-signal-indigo" /> Audit Log
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={entityFilter} onChange={(e) => onEntityFilterChange(e.target.value as RadiologyAuditEntityType | "all")}>
              <option value="all">All Entity Types</option>
              {entityTypes.map((t) => (
                <option key={t} value={t}>
                  {entityLabels[t]}
                </option>
              ))}
            </select>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
                placeholder="Search actor, action, or entity..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-12 text-center">No audit entries match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Timestamp</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actor</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Action</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Entity</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(e.timestamp)}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.actor}</td>
                    <td className="py-2.5 pr-3 font-medium text-on-surface">{e.action}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-signal-indigo-tint text-signal-indigo">
                        {entityLabels[e.entityType]} · {e.entityId}
                      </span>
                    </td>
                    <td className="py-2.5 text-on-surface-variant">{e.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
