import { Card } from "@shared/design-system/components";
import { resultMeta, severityMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditEvent, AggregatedModuleAuditRow } from "@modules/hospital-admin/api";

type AuditEventRow = AuditEvent & { departmentName?: string; patientName?: string };

interface SystemAuditPanelProps {
  events: AuditEventRow[];
  moduleLog: AggregatedModuleAuditRow[];
}

/** Module-local — System Audit (spec §27): not every event is performed by a human — background jobs, scheduled tasks, and integration processing. The second section surfaces the real per-module audit logs (Beds/Laboratory/Radiology/Pharmacy/OT/Inventory/Emergency) already recorded by their own modules, as genuine system-of-record activity. */
export function SystemAuditPanel({ events, moduleLog }: SystemAuditPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">System & Background Jobs</h2>
        {events.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No system events recorded.</p>
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
                  <p className="text-xs text-on-surface-variant mt-0.5">{e.actorName} · {formatDateTime(e.timestamp)} {e.denialReason && `— ${e.denialReason}`}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Module Activity Log</h2>
        <p className="text-xs text-on-surface-variant mb-4">Real audit entries recorded by each module's own audit log — Beds, Laboratory, Radiology, Pharmacy, OT/Surgery, Inventory, Emergency — surfaced here, not duplicated.</p>
        {moduleLog.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No module activity recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line max-h-96 overflow-y-auto">
            {moduleLog.slice(0, 50).map((e) => {
              const severity = severityMeta[e.severity];
              return (
                <div key={`${e.module}-${e.id}`} className="py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-on-surface">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold mr-1.5 bg-surface-container-low text-on-surface-variant">{e.module}</span>
                      <span className="font-semibold">{e.actor}</span> — {e.action}
                    </p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0" style={statusPillStyle(severity.color)}>{severity.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{e.entityId}{e.detail && ` — ${e.detail}`} · {formatDateTime(e.timestamp)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
