import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

interface DelaySurgicalCaseDrawerProps {
  caseRow: SurgicalCaseRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Delay Management (spec §33): records a delay against the scheduled time without changing the case's status. */
export function DelaySurgicalCaseDrawer({ caseRow, onClose, onComplete }: DelaySurgicalCaseDrawerProps) {
  const [minutes, setMinutes] = useState(15);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (caseRow) {
      setMinutes(15);
      setReason("");
    }
  }, [caseRow]);

  async function handleSubmit() {
    if (!caseRow || !reason.trim()) return;
    await api.delaySurgicalCase(caseRow.id, minutes, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(caseRow)}
      onClose={onClose}
      title="Record Delay"
      subtitle={caseRow ? caseRow.caseNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim() || minutes <= 0}>
            Record Delay
          </Button>
        </div>
      }
    >
      <FormSection title="Delay">
        <div className="mb-4">
          <FormField label="Delay (minutes)">
            <input type="number" min={1} className={formInputClass} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Previous surgery extended" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
