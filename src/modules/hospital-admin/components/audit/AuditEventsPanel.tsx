import { Search } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { severityMeta, resultMeta, categoryLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditEvent, AuditEventCategory, AuditSeverity, SavedAuditQuery } from "@modules/hospital-admin/api";

type AuditEventRow = AuditEvent & { departmentName?: string; patientName?: string };

interface AuditEventsPanelProps {
  events: AuditEventRow[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: AuditEventCategory | "all";
  onCategoryFilterChange: (value: AuditEventCategory | "all") => void;
  severityFilter: AuditSeverity | "all";
  onSeverityFilterChange: (value: AuditSeverity | "all") => void;
  savedQueries: SavedAuditQuery[];
  onApplySavedQuery: (query: SavedAuditQuery) => void;
  onSelect: (id: string) => void;
}

const categories: (AuditEventCategory | "all")[] = ["all", "authentication", "patient", "clinical", "medication", "laboratory", "radiology", "billing", "administration", "integration", "security", "system"];
const severities: (AuditSeverity | "all")[] = ["all", "info", "low", "medium", "high", "critical"];

/** Module-local — the main Audit Event List (spec §2-3, §29-30): search, filters, and saved queries over every audit event. */
export function AuditEventsPanel({ events, search, onSearchChange, categoryFilter, onCategoryFilterChange, severityFilter, onSeverityFilterChange, savedQueries, onApplySavedQuery, onSelect }: AuditEventsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search audit ID, user, patient, IP, resource..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value as AuditEventCategory | "all")}>
            {categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Categories" : categoryLabels[c]}</option>
            ))}
          </select>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={severityFilter} onChange={(e) => onSeverityFilterChange(e.target.value as AuditSeverity | "all")}>
            {severities.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Severities" : severityMeta[s].label}</option>
            ))}
          </select>
          <select
            className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo"
            value=""
            onChange={(e) => {
              const q = savedQueries.find((s) => s.id === e.target.value);
              if (q) onApplySavedQuery(q);
            }}
          >
            <option value="">My Saved Queries…</option>
            {savedQueries.map((q) => (
              <option key={q.id} value={q.id}>{q.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Card hero>
        {events.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No audit events match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">User</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Action</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Resource</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Result</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((e) => {
                  const severity = severityMeta[e.severity];
                  const result = resultMeta[e.result];
                  return (
                    <tr key={e.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(e.id)}>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(e.timestamp)}</td>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{e.actorName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        <span className="font-mono text-xs font-bold">{e.action}</span> <span className="text-xs">{e.eventName}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{e.resourceType ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{e.patientName ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(result.color)}>{result.label}</span>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
