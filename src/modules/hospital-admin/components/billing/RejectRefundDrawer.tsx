import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { RefundView } from "@modules/hospital-admin/api";

interface RejectRefundDrawerProps {
  refund: RefundView | null;
  onClose: () => void;
  onSubmit: (refundId: string, reason: string) => void;
}

/** Module-local — rejects a requested refund with a required reason. */
export function RejectRefundDrawer({ refund, onClose, onSubmit }: RejectRefundDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (refund) setReason("");
  }, [refund]);

  function handleSubmit() {
    if (!refund || !reason.trim()) return;
    onSubmit(refund.id, reason.trim());
    onClose();
  }

  return (
    <Drawer
      open={Boolean(refund)}
      onClose={onClose}
      title="Reject Refund"
      subtitle={refund?.refundNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Reject
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this refund being rejected?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. No overpayment found on review" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
