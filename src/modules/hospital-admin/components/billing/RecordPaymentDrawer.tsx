import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import { paymentMethodLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type { InvoiceView, PaymentMethod } from "@modules/hospital-admin/api";

const methodOptions: PaymentMethod[] = ["cash", "card", "bank-transfer", "online", "insurance", "corporate"];

interface RecordPaymentDrawerProps {
  invoice: InvoiceView | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Payment recording (spec §17-19): supports partial payment, configured payment methods. */
export function RecordPaymentDrawer({ invoice, onClose, onComplete }: RecordPaymentDrawerProps) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [transactionReference, setTransactionReference] = useState("");

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.balance);
      setMethod("cash");
      setTransactionReference("");
    }
  }, [invoice]);

  async function handleSubmit() {
    if (!invoice || amount <= 0) return;
    await api.recordPayment({ invoiceId: invoice.id, amount, method, transactionReference: transactionReference || undefined });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(invoice)}
      onClose={onClose}
      title="Record Payment"
      subtitle={invoice ? `${invoice.invoiceNumber} · Outstanding ${formatSAR(invoice.balance)}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!invoice || amount <= 0 || amount > invoice.balance}>
            Record Payment
          </Button>
        </div>
      }
    >
      {invoice && (
        <FormSection title="Payment Details">
          <div className="mb-4">
            <FormField label={`Amount (max ${formatSAR(invoice.balance)})`}>
              <input
                type="number"
                min={0}
                max={invoice.balance}
                className={formInputClass}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Math.min(invoice.balance, Number(e.target.value) || 0)))}
              />
            </FormField>
          </div>
          <div className="mb-4">
            <FormField label="Method">
              <select className={formInputClass} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {methodOptions.map((m) => (
                  <option key={m} value={m}>
                    {paymentMethodLabel[m]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Transaction Reference (optional)">
            <input className={formInputClass} value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="e.g. TXN-928372" />
          </FormField>
          {amount < invoice.balance && amount > 0 && (
            <p className="mt-3 text-xs text-caution-amber font-semibold">
              Partial payment — remaining balance will be {formatSAR(invoice.balance - amount)}.
            </p>
          )}
        </FormSection>
      )}
    </Drawer>
  );
}
