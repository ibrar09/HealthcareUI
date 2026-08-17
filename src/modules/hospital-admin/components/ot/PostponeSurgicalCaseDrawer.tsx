import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

interface PostponeSurgicalCaseDrawerProps {
  caseRow: SurgicalCaseRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — postpone a surgical case (spec §32) — distinct from Cancel, keeps the case open for a future date rather than closing it out. */
export function PostponeSurgicalCaseDrawer({ caseRow, onClose, onComplete }: PostponeSurgicalCaseDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (caseRow) setReason("");
  }, [caseRow]);

  async function handleSubmit() {
    if (!caseRow || !reason.trim()) return;
    await api.postponeSurgicalCase(caseRow.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(caseRow)}
      onClose={onClose}
      title="Postpone Surgical Case"
      subtitle={caseRow ? caseRow.caseNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Postpone Case
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this case being postponed?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Awaiting cardiology clearance" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
