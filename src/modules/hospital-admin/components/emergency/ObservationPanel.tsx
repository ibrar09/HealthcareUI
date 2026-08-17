import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { observationStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyObservationStatus } from "@modules/hospital-admin/api";

type ObservationRow = {
  id: string;
  queueNumber: string;
  patientName: string;
  reason: string;
  startTime: string;
  expectedReviewTime: string;
  assignedDoctorName?: string;
  assignedNurseName?: string;
  progressNotes: { timestamp: string; note: string; author: string }[];
  status: EmergencyObservationStatus;
};

interface ObservationPanelProps {
  observations: ObservationRow[];
  onAdd: () => void;
  onAddNote: (id: string, note: string) => void;
  onComplete: (id: string, outcome: EmergencyObservationStatus) => void;
}

/** Module-local — Emergency Observation (spec §16): patients who don't immediately need admission or discharge. */
export function ObservationPanel({ observations, onAdd, onAddNote, onComplete }: ObservationPanelProps) {
  const [noteTarget, setNoteTarget] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button onClick={onAdd}><Plus size={14} /> Start Observation</Button>
      </div>
      {observations.length === 0 ? (
        <Card hero><p className="text-center text-sm text-on-surface-variant py-12">No patients in observation.</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {observations.map((o) => {
            const status = observationStatusMeta[o.status];
            return (
              <Card hero key={o.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{o.queueNumber} — {o.patientName}</p>
                    <p className="text-xs text-on-surface-variant">{o.reason}</p>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0" style={statusPillStyle(status.color)}>{status.label}</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-1">Started {formatDateTime(o.startTime)} · Review by {formatDateTime(o.expectedReviewTime)}</p>
                <p className="text-xs text-on-surface-variant mb-3">Dr. {o.assignedDoctorName ?? "—"} · Nurse {o.assignedNurseName ?? "—"}</p>
                {o.progressNotes.length > 0 && (
                  <div className="mb-3 flex flex-col gap-1.5 max-h-28 overflow-y-auto">
                    {[...o.progressNotes].reverse().map((n, i) => (
                      <p key={i} className="text-xs text-on-surface"><span className="text-on-surface-variant">{formatDateTime(n.timestamp)} — {n.author}:</span> {n.note}</p>
                    ))}
                  </div>
                )}
                {o.status === "active" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setNoteTarget(o.id)}>Add Progress Note</Button>
                    <Button size="sm" onClick={() => onComplete(o.id, "completed")}>Complete</Button>
                    <Button size="sm" variant="ghost" onClick={() => onComplete(o.id, "converted-to-admission")}>Convert to Admission</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {noteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/40 backdrop-blur-sm" onClick={() => setNoteTarget(null)}>
          <div className="bg-white rounded-hero p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-on-surface mb-3">Add Progress Note</h3>
            <textarea className={formInputClass} rows={3} placeholder="Progress note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setNoteTarget(null)}>Cancel</Button>
              <Button disabled={!noteText.trim()} onClick={() => { onAddNote(noteTarget, noteText); setNoteTarget(null); setNoteText(""); }}>Save Note</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
