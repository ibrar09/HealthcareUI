import { useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { severityMeta, statusMeta, categoryLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { Alert } from "@modules/hospital-admin/api";

interface AlertDetailDrawerProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (note?: string) => void;
  onAssign: (assigneeId: string) => void;
  onEscalate: (note?: string) => void;
  onResolve: (note: string) => void;
  onDismiss: (reason: string) => void;
}

const assignableStaff: { id: string; label: string }[] = [
  { id: "sarah-jenkins", label: "Dr. Sarah Jenkins" },
  { id: "marcus-chen", label: "Marcus Chen, RN" },
  { id: "amina-farooqi", label: "Dr. Amina Farooqi" },
  { id: "farah-chaudhry", label: "Dr. Farah Chaudhry" },
  { id: "nadia-khokhar", label: "Dr. Nadia Khokhar" },
  { id: "waqas-anjum", label: "Waqas Anjum" },
];

/** Module-local — Alert detail (spec §25-26): Acknowledge/Take Action/Assign/Escalate/Resolve/Dismiss, plus the escalation history trail. */
export function AlertDetailDrawer({ alert, onClose, onAcknowledge, onAssign, onEscalate, onResolve, onDismiss }: AlertDetailDrawerProps) {
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState("");
  const severity = alert ? severityMeta[alert.severity] : null;
  const status = alert ? statusMeta[alert.status] : null;

  return (
    <Drawer open={Boolean(alert)} onClose={onClose} title={alert?.alertNumber ?? ""} subtitle={alert?.title}>
      {alert && severity && status && (
        <>
          <div className="mb-5 flex items-center gap-2 flex-wrap">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
            {alert.escalationLevel > 0 && <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle("var(--pulse-coral)")}>Escalation Level {alert.escalationLevel}</span>}
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Details</h3>
            <p className="text-sm text-on-surface">{alert.message}</p>
            <p className="text-sm text-on-surface-variant mt-2">{categoryLabels[alert.category]} · {alert.alertType} · {alert.source}</p>
            {alert.patientName && <p className="text-sm text-on-surface-variant">Patient: {alert.patientName}</p>}
            {alert.departmentName && <p className="text-sm text-on-surface-variant">Department: {alert.departmentName}</p>}
            {alert.location && <p className="text-sm text-on-surface-variant">Location: {alert.location}</p>}
            <p className="text-sm text-on-surface-variant">Created {formatDateTime(alert.createdAt)}</p>
            <p className="text-sm text-on-surface-variant">Assigned to: {alert.assignedToName ?? "Unassigned"}</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">Notified via: {alert.channelsNotified.join(", ")}</p>
          </div>

          {alert.escalationHistory.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Escalation History</h3>
              <div className="flex flex-col gap-2">
                {alert.escalationHistory.map((e, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-on-surface">Level {e.level} — {e.role}</p>
                    <p className="text-xs text-on-surface-variant">{formatDateTime(e.escalatedAt)}{e.note && ` — ${e.note}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(alert.acknowledgedAt || alert.resolvedAt || alert.dismissedAt) && (
            <div className="mb-5 rounded-card bg-vital-green/5 border border-vital-green/20 p-3">
              {alert.acknowledgedAt && <p className="text-sm text-on-surface">Acknowledged by {alert.acknowledgedBy} · {formatDateTime(alert.acknowledgedAt)}</p>}
              {alert.resolvedAt && <p className="text-sm text-on-surface mt-1">Resolved by {alert.resolvedBy} · {formatDateTime(alert.resolvedAt)}{alert.resolutionNote && ` — ${alert.resolutionNote}`}</p>}
              {alert.dismissedAt && <p className="text-sm text-on-surface mt-1">Dismissed by {alert.dismissedBy} · {formatDateTime(alert.dismissedAt)}{alert.dismissReason && ` — ${alert.dismissReason}`}</p>}
            </div>
          )}

          {alert.status !== "resolved" && alert.status !== "dismissed" && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Action Note</h3>
              <textarea className={formInputClass} rows={2} placeholder="Add a note for acknowledge / escalate / resolve..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          )}

          {alert.status !== "resolved" && alert.status !== "dismissed" && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Assign</h3>
              <div className="flex gap-2">
                <select className={formInputClass} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Select staff…</option>
                  {assignableStaff.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <Button size="sm" variant="outline" disabled={!assignee} onClick={() => { onAssign(assignee); setAssignee(""); }}>Assign</Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {alert.status === "new" && <Button size="sm" onClick={() => onAcknowledge(note || undefined)}>Acknowledge</Button>}
            {(alert.status === "acknowledged" || alert.status === "in-progress") && <Button size="sm" onClick={() => onEscalate(note || undefined)}>Escalate</Button>}
            {alert.status !== "resolved" && alert.status !== "dismissed" && <Button size="sm" variant="outline" onClick={() => onResolve(note || "Resolved.")} disabled={!note.trim()}>Resolve</Button>}
            {alert.status === "new" && <Button size="sm" variant="ghost" onClick={() => onDismiss(note || "Dismissed.")}>Dismiss</Button>}
          </div>
        </>
      )}
    </Drawer>
  );
}
