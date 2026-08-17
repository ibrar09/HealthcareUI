import { Card } from "@shared/design-system/components";
import { resultMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditEvent } from "@modules/hospital-admin/api";

type AuditEventRow = AuditEvent & { departmentName?: string; patientName?: string };

interface IntegrationAuditPanelProps {
  events: AuditEventRow[];
}

/** Module-local — Integration / API Audit (spec §16): FHIR/HL7/DICOM/external-system activity, since our HMS is part of the Universal Healthcare Data Exchange. */
export function IntegrationAuditPanel({ events }: IntegrationAuditPanelProps) {
  const total = events.length || 1;
  const successful = events.filter((e) => e.result === "success").length;
  const failed = events.filter((e) => e.result === "failed").length;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-3 gap-4">
        <Card accentColor="var(--signal-indigo)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Total Messages</p><p className="text-2xl font-mono font-bold text-on-surface">{events.length}</p></Card>
        <Card accentColor="var(--vital-green)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Successful</p><p className="text-2xl font-mono font-bold text-on-surface">{Math.round((successful / total) * 100)}%</p></Card>
        <Card accentColor="var(--pulse-coral)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Failed</p><p className="text-2xl font-mono font-bold text-on-surface">{Math.round((failed / total) * 100)}%</p></Card>
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Integration Activity</h2>
        {events.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No integration events recorded.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {events.map((e) => {
              const result = resultMeta[e.result];
              return (
                <div key={e.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-on-surface">{e.eventName}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(result.color)}>{result.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {e.actorName} · {e.endpoint ?? e.resourceType ?? ""} · {formatDateTime(e.timestamp)}
                    {e.denialReason && ` — ${e.denialReason}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
