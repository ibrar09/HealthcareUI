import { Drawer, Button } from "@shared/design-system/components";
import { severityMeta, resultMeta, categoryLabels, sourceLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditEvent } from "@modules/hospital-admin/api";

type AuditEventDetail = AuditEvent & { departmentName?: string; patientName?: string; previousEvent?: AuditEvent; nextEvent?: AuditEvent };

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-xs text-on-surface-variant flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

interface AuditEventDetailDrawerProps {
  event: AuditEventDetail | null;
  onClose: () => void;
  onOpenInvestigation: () => void;
  onSelectRelated: (id: string) => void;
}

/** Module-local — Audit Event Details (spec §8-15, §38): Actor/Patient Context/Resource/Before-After/Where From/Source, plus Related Events chain. */
export function AuditEventDetailDrawer({ event, onClose, onOpenInvestigation, onSelectRelated }: AuditEventDetailDrawerProps) {
  const severity = event ? severityMeta[event.severity] : null;
  const result = event ? resultMeta[event.result] : null;

  return (
    <Drawer open={Boolean(event)} onClose={onClose} title={event?.auditId ?? ""} subtitle={event?.eventName} widthClass="max-w-xl">
      {event && severity && result && (
        <>
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(result.color)}>{result.label}</span>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-surface-container-low text-on-surface-variant">{categoryLabels[event.category]}</span>
          </div>

          {event.denialReason && (
            <div className="mb-5 rounded-card bg-pulse-coral/5 border border-pulse-coral/20 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-pulse-coral mb-1">Reason</h3>
              <p className="text-sm text-on-surface">{event.denialReason}</p>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Event</h3>
            <div className="flex flex-col divide-y divide-line">
              <Row label="Timestamp" value={formatDateTime(event.timestamp)} />
              <Row label="Action" value={event.action} />
              <Row label="Integrity" value={event.integrityStatus === "verified" ? "✓ Verified" : event.integrityStatus === "pending" ? "⚠ Verification Pending" : "✕ Integrity Error"} />
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Actor</h3>
            <div className="flex flex-col divide-y divide-line">
              <Row label="User" value={event.actorName} />
              <Row label="Role" value={event.actorRole} />
              <Row label="Department" value={event.departmentName} />
              <Row label="Organization" value={event.organizationName} />
            </div>
          </div>

          {event.patientId && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Patient Context</h3>
              <div className="flex flex-col divide-y divide-line">
                <Row label="Patient" value={event.patientName} />
                <Row label="Patient ID" value={event.patientId} />
                <Row label="Encounter" value={event.encounterId} />
              </div>
            </div>
          )}

          {event.resourceType && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Resource</h3>
              <div className="flex flex-col divide-y divide-line">
                <Row label="Resource Type" value={event.resourceType} />
                <Row label="Resource ID" value={event.resourceId} />
                <Row label="Endpoint" value={event.endpoint} />
              </div>
            </div>
          )}

          {event.changes && event.changes.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Before / After</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left py-1.5 pr-3 text-[10px] uppercase text-on-surface-variant font-semibold">Field</th>
                      <th className="text-left py-1.5 pr-3 text-[10px] uppercase text-on-surface-variant font-semibold">Before</th>
                      <th className="text-left py-1.5 text-[10px] uppercase text-on-surface-variant font-semibold">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {event.changes.map((c, i) => (
                      <tr key={i}>
                        <td className="py-1.5 pr-3 font-semibold text-on-surface">{c.fieldName}</td>
                        <td className="py-1.5 pr-3 text-pulse-coral">{c.oldValue}</td>
                        <td className="py-1.5 text-vital-green">{c.newValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Where From</h3>
            <div className="flex flex-col divide-y divide-line">
              <Row label="IP Address" value={event.ipAddress} />
              <Row label="Device" value={event.device} />
              <Row label="Browser" value={event.browser} />
              <Row label="Operating System" value={event.operatingSystem} />
              <Row label="Application" value={event.application} />
              <Row label="Session ID" value={event.sessionId} />
              <Row label="Source" value={sourceLabels[event.source]} />
            </div>
          </div>

          {(event.correlationId || event.requestId) && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Traceability</h3>
              <div className="flex flex-col divide-y divide-line">
                <Row label="Correlation ID" value={event.correlationId} />
                <Row label="Request ID" value={event.requestId} />
              </div>
            </div>
          )}

          {(event.previousEvent || event.nextEvent) && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Related Events (this patient)</h3>
              <div className="flex flex-col gap-1.5">
                {event.previousEvent && (
                  <button type="button" onClick={() => onSelectRelated(event.previousEvent!.id)} className="text-left text-sm text-signal-indigo hover:underline">
                    ← Previous: {event.previousEvent.eventName} ({formatDateTime(event.previousEvent.timestamp)})
                  </button>
                )}
                {event.nextEvent && (
                  <button type="button" onClick={() => onSelectRelated(event.nextEvent!.id)} className="text-left text-sm text-signal-indigo hover:underline">
                    Next: {event.nextEvent.eventName} ({formatDateTime(event.nextEvent.timestamp)}) →
                  </button>
                )}
              </div>
            </div>
          )}

          <Button size="sm" variant="outline" onClick={onOpenInvestigation}>Open Investigation</Button>
        </>
      )}
    </Drawer>
  );
}
