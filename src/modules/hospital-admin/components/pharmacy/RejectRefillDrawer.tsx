import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { RefillRequestRow } from "@modules/hospital-admin/api";

interface RejectRefillDrawerProps {
  refill: RefillRequestRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — reject a Refill Request (spec §21) with a reason. */
export function RejectRefillDrawer({ refill, onClose, onComplete }: RejectRefillDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (refill) setReason("");
  }, [refill]);

  async function handleSubmit() {
    if (!refill || !reason.trim()) return;
    await api.rejectRefill(refill.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(refill)}
      onClose={onClose}
      title="Reject Refill Request"
      subtitle={refill ? refill.prescriptionNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Reject
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this refill being rejected?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Requires new consultation before refill" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
