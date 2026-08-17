import { Search, AlertTriangle, Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { visitStatusMeta, arrivalModeLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyQueueRow, EmergencyVisitStatus, TriageCategory } from "@modules/hospital-admin/api";

interface EmergencyQueuePanelProps {
  rows: EmergencyQueueRow[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: EmergencyVisitStatus | "active";
  onStatusFilterChange: (value: EmergencyVisitStatus | "active") => void;
  triageCategories: TriageCategory[];
  onSelect: (id: string) => void;
  onRegister: () => void;
}

const statuses: (EmergencyVisitStatus | "active")[] = [
  "active", "waiting-triage", "waiting-doctor", "in-treatment", "in-observation", "disposition-pending", "discharged", "admitted", "transferred", "left-without-treatment",
];

/** Module-local — Emergency Patient Queue (spec §2): strong visual priority indicators, never color alone. */
export function EmergencyQueuePanel({ rows, search, onSearchChange, statusFilter, onStatusFilterChange, onSelect, onRegister }: EmergencyQueuePanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search queue #, patient, complaint..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as EmergencyVisitStatus | "active")}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "active" ? "All Active" : visitStatusMeta[s].label}</option>
            ))}
          </select>
          <Button onClick={onRegister}><Plus size={14} /> Register Arrival</Button>
        </div>
      </div>

      <Card hero>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No patients match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Queue #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Age/Sex</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Arrival</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Triage</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Chief Complaint</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Area / Doctor</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Wait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                  const status = visitStatusMeta[r.status];
                  const critical = r.triageCategoryId === "triage-critical";
                  return (
                    <tr key={r.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(r.id)} style={critical ? { backgroundColor: "color-mix(in srgb, var(--pulse-coral) 6%, transparent)" } : undefined}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          {critical && <AlertTriangle size={12} className="text-pulse-coral flex-shrink-0" />}
                          {r.queueNumber}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.age} / {r.sex}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">
                        {formatDateTime(r.arrivalTime)}
                        <div className="text-[10px] text-on-surface-variant/70">{arrivalModeLabels[r.arrivalMode]}</div>
                      </td>
                      <td className="py-2.5 pr-3">
                        {r.triageCategoryName ? (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(r.triageColor ?? "var(--outline)")}>{r.triageCategoryName}</span>
                        ) : (
                          <span className="text-xs text-on-surface-variant/60">Pending</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant max-w-[220px] truncate">{r.chiefComplaint}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        {r.assignedAreaName ?? "—"}
                        {r.assignedDoctorName && <div className="text-[10px] text-on-surface-variant/70">{r.assignedDoctorName}</div>}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold" style={{ color: r.waitMinutes > 60 ? "var(--pulse-coral)" : r.waitMinutes > 30 ? "var(--caution-amber)" : "var(--on-surface)" }}>
                        {r.waitMinutes}m
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
