import { Card, Button } from "@shared/design-system/components";
import type { FacilityIncidentRow, FacilityIncidentStatus, FacilityIncidentSeverity } from "@modules/hospital-admin/api";

interface IncidentsPanelProps {
  incidents: FacilityIncidentRow[];
  statusFilter: FacilityIncidentStatus | "all";
  onStatusFilterChange: (value: FacilityIncidentStatus | "all") => void;
  onAdvanceStatus: (id: string, status: FacilityIncidentStatus) => void;
}

const statuses: (FacilityIncidentStatus | "all")[] = ["all", "reported", "investigating", "corrective-action", "resolved", "closed"];

const severityColor: Record<FacilityIncidentSeverity, string> = {
  critical: "var(--pulse-coral)", high: "var(--caution-amber)", medium: "var(--signal-indigo)", low: "var(--outline)",
};
const statusColor: Record<FacilityIncidentStatus, string> = {
  reported: "var(--signal-indigo)", investigating: "var(--caution-amber)", "corrective-action": "var(--caution-amber)", resolved: "var(--vital-green)", closed: "var(--outline)",
};
const nextStatus: Partial<Record<FacilityIncidentStatus, { label: string; next: FacilityIncidentStatus }>> = {
  reported: { label: "Start Investigation", next: "investigating" },
  investigating: { label: "Begin Corrective Action", next: "corrective-action" },
  "corrective-action": { label: "Mark Resolved", next: "resolved" },
  resolved: { label: "Close", next: "closed" },
};

/** Module-local — Facility Incidents (spec §42-43): a simplified 5-state workflow (Reported → Investigating → Corrective Action → Resolved → Closed). */
export function IncidentsPanel({ incidents, statusFilter, onStatusFilterChange, onAdvanceStatus }: IncidentsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo w-fit" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as FacilityIncidentStatus | "all")}>
        {statuses.map((s) => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/-/g, " ")}</option>)}
      </select>

      <Card hero>
        {incidents.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No incidents match this filter.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {incidents.map((i) => {
              const action = nextStatus[i.status];
              return (
                <div key={i.id} className="py-3.5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{i.description}</p>
                      <p className="text-xs text-on-surface-variant">{i.incidentNumber} · {i.location} · {i.facilityName}{i.departmentName ? ` · ${i.departmentName}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: `color-mix(in srgb, ${severityColor[i.severity]} 16%, transparent)`, color: severityColor[i.severity] }}>{i.severity}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: `color-mix(in srgb, ${statusColor[i.status]} 16%, transparent)`, color: statusColor[i.status] }}>{i.status.replace(/-/g, " ")}</span>
                    </div>
                  </div>
                  {i.resolution && <p className="text-xs text-vital-green mt-1.5">Resolution: {i.resolution}</p>}
                  {action && <Button size="sm" variant="outline" className="mt-2" onClick={() => onAdvanceStatus(i.id, action.next)}>{action.label}</Button>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
