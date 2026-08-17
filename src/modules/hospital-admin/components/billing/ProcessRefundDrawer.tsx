import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { RefundView } from "@modules/hospital-admin/api";

interface ProcessRefundDrawerProps {
  refund: RefundView | null;
  onClose: () => void;
  onSubmit: (refundId: string, paymentReference: string) => void;
}

/** Module-local — Refund Processing (spec §20) — the step that actually moves money back to the patient. */
export function ProcessRefundDrawer({ refund, onClose, onSubmit }: ProcessRefundDrawerProps) {
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    if (refund) setPaymentReference("");
  }, [refund]);

  function handleSubmit() {
    if (!refund || !paymentReference.trim()) return;
    onSubmit(refund.id, paymentReference.trim());
    onClose();
  }

  return (
    <Drawer
      open={Boolean(refund)}
      onClose={onClose}
      title="Process Refund"
      subtitle={refund ? `${refund.refundNumber} · ${formatSAR(refund.amount)}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!paymentReference.trim()}>
            Mark Completed
          </Button>
        </div>
      }
    >
      <FormSection title="Payment Reference">
        <FormField label="How was this refund sent?">
          <input className={formInputClass} value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="e.g. TXN-REFUND-88213 or bank reference" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
