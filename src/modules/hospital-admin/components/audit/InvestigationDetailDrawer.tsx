import { useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { Investigation, InvestigationStatus } from "@modules/hospital-admin/api";

const statusMeta: Record<InvestigationStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "var(--pulse-coral)" },
  "under-review": { label: "Under Review", color: "var(--caution-amber)" },
  resolved: { label: "Resolved", color: "var(--vital-green)" },
  closed: { label: "Closed", color: "var(--outline)" },
};

interface InvestigationDetailDrawerProps {
  investigation: Investigation | null;
  onClose: () => void;
  onAddNote: (note: string) => void;
  onUpdateStatus: (status: InvestigationStatus, resolution?: string) => void;
}

/** Module-local — Investigation detail (spec §37): Timeline/Evidence/Related Events/Notes/Actions/Resolution. */
export function InvestigationDetailDrawer({ investigation, onClose, onAddNote, onUpdateStatus }: InvestigationDetailDrawerProps) {
  const [noteText, setNoteText] = useState("");
  const status = investigation ? statusMeta[investigation.status] : null;

  return (
    <Drawer open={Boolean(investigation)} onClose={onClose} title={investigation?.caseNumber ?? ""} subtitle={investigation?.subject}>
      {investigation && status && (
        <>
          <div className="mb-5">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Case</h3>
            <p className="text-sm text-on-surface">Users: {investigation.userIds.join(", ") || "—"}</p>
            <p className="text-sm text-on-surface">Patients: {investigation.patientIds.join(", ") || "—"}</p>
            <p className="text-sm text-on-surface-variant">Assigned to {investigation.assignedTo} · opened {formatDateTime(investigation.openedAt)}</p>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Notes</h3>
            <div className="flex flex-col gap-2 mb-3">
              {investigation.notes.map((n, i) => (
                <div key={i} className="text-sm">
                  <p className="text-on-surface">{n.note}</p>
                  <p className="text-xs text-on-surface-variant">{n.author} · {formatDateTime(n.timestamp)}</p>
                </div>
              ))}
            </div>
            <textarea className={formInputClass} rows={2} placeholder="Add investigation note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <Button size="sm" className="mt-2" disabled={!noteText.trim()} onClick={() => { onAddNote(noteText); setNoteText(""); }}>Add Note</Button>
          </div>

          {investigation.resolution && (
            <div className="mb-5 rounded-card bg-vital-green/5 border border-vital-green/20 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-vital-green mb-1">Resolution</h3>
              <p className="text-sm text-on-surface">{investigation.resolution}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {investigation.status === "open" && <Button size="sm" onClick={() => onUpdateStatus("under-review")}>Mark Under Review</Button>}
            {investigation.status === "under-review" && <Button size="sm" onClick={() => onUpdateStatus("resolved", "Access justified — confirmed with department head, no policy violation found.")}>Mark Resolved</Button>}
            {investigation.status === "resolved" && <Button size="sm" variant="outline" onClick={() => onUpdateStatus("closed")}>Close Case</Button>}
          </div>
        </>
      )}
    </Drawer>
  );
}
