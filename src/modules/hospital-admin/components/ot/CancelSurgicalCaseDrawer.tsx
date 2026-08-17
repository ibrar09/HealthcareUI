import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

const reasons = ["Patient unavailable", "Medical reason", "Surgeon unavailable", "OT unavailable", "Equipment unavailable", "Blood unavailable", "Consent issue", "Insurance/authorization issue", "Other"];

interface CancelSurgicalCaseDrawerProps {
  caseRow: SurgicalCaseRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Cancellation Management (spec §32): a coded reason list, hospital-configurable in spirit even though captured as a simple select here — auditable via api.cancelSurgicalCase's own audit hook. */
export function CancelSurgicalCaseDrawer({ caseRow, onClose, onComplete }: CancelSurgicalCaseDrawerProps) {
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (caseRow) {
      setReason(reasons[0]);
      setNote("");
    }
  }, [caseRow]);

  async function handleSubmit() {
    if (!caseRow) return;
    await api.cancelSurgicalCase(caseRow.id, note.trim() ? `${reason} — ${note.trim()}` : reason);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(caseRow)}
      onClose={onClose}
      title="Cancel Surgical Case"
      subtitle={caseRow ? caseRow.caseNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant="danger" onClick={handleSubmit}>
            Cancel Case
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <div className="mb-4">
          <FormField label="Cancellation Reason">
            <select className={formInputClass} value={reason} onChange={(e) => setReason(e.target.value)}>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Additional Notes (optional)">
          <textarea className={formInputClass} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional detail" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
