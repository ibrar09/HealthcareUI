import { Card } from "@shared/design-system/components";
import { resultMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditEvent } from "@modules/hospital-admin/api";

type AuditEventRow = AuditEvent & { departmentName?: string; patientName?: string };

interface PatientAccessAuditPanelProps {
  events: AuditEventRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Patient Record Access audit (spec §17): its own dedicated privacy-monitoring view. */
export function PatientAccessAuditPanel({ events, onSelect }: PatientAccessAuditPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {events.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No patient-record access events recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">User</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Resource</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Action</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((e) => {
                  const result = resultMeta[e.result];
                  return (
                    <tr key={e.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(e.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{e.patientName ?? e.patientId}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{e.actorName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{e.resourceType ?? "Record"}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs font-bold text-on-surface">{e.action}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(e.timestamp)}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(result.color)}>{result.label}</span>
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
