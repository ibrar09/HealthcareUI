import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { CriticalFindingRow } from "@modules/hospital-admin/api";

interface AcknowledgeRadiologyCriticalFindingDrawerProps {
  finding: CriticalFindingRow | null;
  onClose: () => void;
  onComplete: () => void;
  currentUserName: string;
}

/** Module-local — Critical Finding acknowledgment: administrative escalation record (who was notified, what was done), never a report edit. */
export function AcknowledgeRadiologyCriticalFindingDrawer({ finding, onClose, onComplete, currentUserName }: AcknowledgeRadiologyCriticalFindingDrawerProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (finding) setNote("");
  }, [finding]);

  async function handleSubmit() {
    if (!finding) return;
    await api.acknowledgeRadiologyCriticalFinding(finding.id, currentUserName, note.trim() || undefined);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(finding)}
      onClose={onClose}
      title="Acknowledge Critical Finding"
      subtitle={finding ? `${finding.finding} — ${finding.patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Acknowledge</Button>
        </div>
      }
    >
      {finding && (
        <div className="mb-6 rounded-xl border border-pulse-coral/30 bg-pulse-coral/5 px-4 py-3">
          <p className="text-sm font-bold text-on-surface">{finding.finding}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {finding.patientName} · {finding.orderNumber} · Radiologist: {finding.radiologistName}
          </p>
        </div>
      )}
      <FormSection title="Escalation Note">
        <FormField label="Who was notified, and what action was taken?">
          <textarea className={formInputClass} rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Notified Dr. Sarah Jenkins by phone — neurosurgical consult requested" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
