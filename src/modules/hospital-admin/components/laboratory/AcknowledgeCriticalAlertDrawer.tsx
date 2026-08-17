import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { LabCriticalAlertRow } from "@modules/hospital-admin/api";

interface AcknowledgeCriticalAlertDrawerProps {
  alert: LabCriticalAlertRow | null;
  onClose: () => void;
  onComplete: () => void;
  currentUserName: string;
}

/** Module-local — Critical Results escalation acknowledgment: genuinely administrative oversight (who was notified, what was done), never a result edit. */
export function AcknowledgeCriticalAlertDrawer({ alert, onClose, onComplete, currentUserName }: AcknowledgeCriticalAlertDrawerProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (alert) setNote("");
  }, [alert]);

  async function handleSubmit() {
    if (!alert) return;
    await api.acknowledgeCriticalAlert(alert.id, currentUserName, note.trim() || undefined);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(alert)}
      onClose={onClose}
      title="Acknowledge Critical Result"
      subtitle={alert ? `${alert.testName} — ${alert.patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Acknowledge</Button>
        </div>
      }
    >
      {alert && (
        <div className="mb-6 rounded-xl border border-pulse-coral/30 bg-pulse-coral/5 px-4 py-3">
          <p className="text-sm font-bold text-on-surface">
            {alert.testName}: <span className="font-mono">{alert.value}</span>
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">Reference: {alert.referenceRangeText}</p>
          <p className="text-xs text-on-surface-variant">
            {alert.patientName} · {alert.orderNumber}
          </p>
        </div>
      )}
      <FormSection title="Escalation Note">
        <FormField label="Who was notified, and what action was taken?">
          <textarea className={formInputClass} rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Notified Dr. Sarah Jenkins by phone — repeat draw ordered" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
