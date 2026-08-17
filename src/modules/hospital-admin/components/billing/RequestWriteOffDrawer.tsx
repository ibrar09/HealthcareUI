import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import * as api from "@modules/hospital-admin/api";

interface RequestWriteOffDrawerProps {
  invoiceId: string | null;
  invoiceNumber?: string;
  outstandingBalance?: number;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Write-Off Request (spec §51) — the auditable start of "don't just set Outstanding = 0". */
export function RequestWriteOffDrawer({ invoiceId, invoiceNumber, outstandingBalance = 0, onClose, onComplete }: RequestWriteOffDrawerProps) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (invoiceId) {
      setAmount(outstandingBalance);
      setReason("");
    }
  }, [invoiceId, outstandingBalance]);

  async function handleSubmit() {
    if (!invoiceId || amount <= 0 || !reason.trim()) return;
    await api.requestWriteOff({ invoiceId, amount, reason: reason.trim() });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(invoiceId)}
      onClose={onClose}
      title="Request Write-Off"
      subtitle={invoiceNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={amount <= 0 || !reason.trim()}>
            Request Write-Off
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label={`Amount (SAR) — outstanding is ${formatSAR(outstandingBalance)}`}>
            <input type="number" min={0} className={formInputClass} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} />
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Denial upheld on appeal — deemed uncollectible" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
