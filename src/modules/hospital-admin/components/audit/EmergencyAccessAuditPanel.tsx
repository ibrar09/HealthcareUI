import { AlertTriangle } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { EmergencyAccessEvent } from "@modules/hospital-admin/api";

interface EmergencyAccessAuditPanelProps {
  events: EmergencyAccessEvent[];
}

/** Module-local — Emergency / Break-Glass Access Audit (spec §26): deliberately made highly visible, per the spec's own instruction. */
export function EmergencyAccessAuditPanel({ events }: EmergencyAccessAuditPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {events.length === 0 ? (
        <Card hero><p className="text-center text-sm text-on-surface-variant py-12">No break-glass access events recorded.</p></Card>
      ) : (
        events.map((e) => (
          <Card hero key={e.id} accentColor="var(--pulse-coral)">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-pulse-coral" />
              <h2 className="text-lg font-bold text-pulse-coral">Break-Glass Access</h2>
            </div>
            <div className="flex flex-col divide-y divide-line">
              <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-on-surface-variant">Provider</span><span className="font-semibold text-on-surface">{e.providerId}</span></div>
              <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-on-surface-variant">Patient</span><span className="font-semibold text-on-surface">{e.patientId}</span></div>
              <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-on-surface-variant">Reason</span><span className="font-semibold text-on-surface text-right max-w-xs">{e.reason}</span></div>
              <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-on-surface-variant">Access Time</span><span className="font-semibold text-on-surface">{formatDateTime(e.timestamp)}</span></div>
              <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-on-surface-variant">Resources</span><span className="font-semibold text-on-surface">{e.resourcesAccessed.join(", ")}</span></div>
              <div className="flex items-center justify-between py-1.5 text-sm"><span className="text-on-surface-variant">Authorization</span><span className="font-semibold text-on-surface">{e.authorizationPolicy}</span></div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
