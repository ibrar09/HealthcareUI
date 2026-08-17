import { Card } from "@shared/design-system/components";
import { severityMeta, statusMeta, categoryLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { Alert } from "@modules/hospital-admin/api";

interface AlertListTableProps {
  alerts: Alert[];
  onSelect: (id: string) => void;
  emptyMessage?: string;
}

/** Module-local — shared alert table, reused by Alert Center (spec §2), Critical Alerts, and My Alerts so the row markup exists exactly once. */
export function AlertListTable({ alerts, onSelect, emptyMessage = "No alerts match this filter." }: AlertListTableProps) {
  return (
    <Card hero>
      {alerts.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Alert</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Severity</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Source</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Created</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {alerts.map((a) => {
                const severity = severityMeta[a.severity];
                const status = statusMeta[a.status];
                return (
                  <tr key={a.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(a.id)}>
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-on-surface">{a.title}</p>
                      <p className="text-xs text-on-surface-variant">{categoryLabels[a.category]} · {a.alertType}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{a.patientName ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{a.departmentName ?? "—"}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{a.source}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                      {a.escalationLevel > 0 && <span className="ml-1 text-[10px] font-bold text-pulse-coral">L{a.escalationLevel}</span>}
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(a.createdAt)}</td>
                    <td className="py-2.5 text-on-surface-variant">{a.assignedToName ?? "Unassigned"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
