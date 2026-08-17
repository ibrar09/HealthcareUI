import { Card, KPICard } from "@shared/design-system/components";
import { severityMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { SecurityAuditData, AuditEvent } from "@modules/hospital-admin/api";

type AuditEventRow = AuditEvent & { departmentName?: string; patientName?: string };

interface SecurityAuditPanelProps {
  data: SecurityAuditData | null;
  securityEvents: AuditEventRow[];
  permissionChanges: AuditEventRow[];
  onSelect: (id: string) => void;
}

/** Module-local — Security Audit (spec §18) + Permission Audit (spec §19), combined per this project's established consolidation discipline. */
export function SecurityAuditPanel({ data, securityEvents, permissionChanges, onSelect }: SecurityAuditPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <KPICard label="Failed Logins" value={data.failedLogins} accentColor="var(--caution-amber)" />
        <KPICard label="Blocked Requests" value={data.blockedRequests} accentColor="var(--pulse-coral)" />
        <KPICard label="Permission Changes" value={data.permissionChanges} accentColor="var(--signal-indigo)" />
        <KPICard label="Account Lockouts" value={data.accountLockouts} accentColor="var(--pulse-coral)" />
        <KPICard label="Suspicious Activities" value={data.suspiciousActivities} accentColor="var(--pulse-coral)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Security Events</h2>
        {securityEvents.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No security events recorded.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {securityEvents.map((e) => {
              const severity = severityMeta[e.severity];
              return (
                <div key={e.id} className="py-2.5 cursor-pointer hover:bg-surface-container-low -mx-2 px-2 rounded-lg" onClick={() => onSelect(e.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-on-surface">{e.eventName}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{e.actorName} · {formatDateTime(e.timestamp)} {e.denialReason && `— ${e.denialReason}`}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Permission Changes</h2>
        {permissionChanges.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No permission changes recorded.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {permissionChanges.map((e) => (
              <div key={e.id} className="py-2.5 cursor-pointer hover:bg-surface-container-low -mx-2 px-2 rounded-lg" onClick={() => onSelect(e.id)}>
                <p className="text-sm font-semibold text-on-surface">{e.resourceId} — {e.changes?.map((c) => `${c.fieldName}: ${c.oldValue} → ${c.newValue}`).join(", ")}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Changed by {e.actorName} · {formatDateTime(e.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
