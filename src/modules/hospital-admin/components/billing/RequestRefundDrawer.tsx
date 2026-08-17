import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import * as api from "@modules/hospital-admin/api";
import type { PaymentView } from "@modules/hospital-admin/api";

interface RequestRefundDrawerProps {
  payment: PaymentView | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Refund Request (spec §20), started from a specific successful Payment. */
export function RequestRefundDrawer({ payment, onClose, onComplete }: RequestRefundDrawerProps) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount);
      setReason("");
    }
  }, [payment]);

  async function handleSubmit() {
    if (!payment || amount <= 0 || !reason.trim()) return;
    await api.requestRefund({ paymentId: payment.id, amount, reason: reason.trim() });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(payment)}
      onClose={onClose}
      title="Request Refund"
      subtitle={payment ? `${payment.paymentNumber} · ${formatSAR(payment.amount)}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!payment || amount <= 0 || amount > payment.amount || !reason.trim()}>
            Request Refund
          </Button>
        </div>
      }
    >
      {payment && (
        <FormSection title="Refund Details">
          <div className="mb-4">
            <FormField label={`Amount (max ${formatSAR(payment.amount)})`}>
              <input
                type="number"
                min={0}
                max={payment.amount}
                className={formInputClass}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Math.min(payment.amount, Number(e.target.value) || 0)))}
              />
            </FormField>
          </div>
          <FormField label="Reason">
            <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Overpayment correction" />
          </FormField>
        </FormSection>
      )}
    </Drawer>
  );
}
