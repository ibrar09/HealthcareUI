import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";

interface RecordClaimPaymentDrawerProps {
  claimId: string | null;
  claimNumber?: string;
  claimAmount?: number;
  onClose: () => void;
  onSubmit: (claimId: string, paidAmount: number) => void;
}

/** Module-local — records the payer's payment against an accepted claim; applied automatically to the underlying Invoice. */
export function RecordClaimPaymentDrawer({ claimId, claimNumber, claimAmount = 0, onClose, onSubmit }: RecordClaimPaymentDrawerProps) {
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    if (claimId) setPaidAmount(claimAmount);
  }, [claimId, claimAmount]);

  function handleSubmit() {
    if (!claimId || paidAmount <= 0) return;
    onSubmit(claimId, paidAmount);
    onClose();
  }

  return (
    <Drawer
      open={Boolean(claimId)}
      onClose={onClose}
      title="Record Claim Payment"
      subtitle={claimNumber ? `${claimNumber} · Claimed ${formatSAR(claimAmount)}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={paidAmount <= 0 || paidAmount > claimAmount}>
            Record Payment
          </Button>
        </div>
      }
    >
      <FormSection title="Payment">
        <FormField label={`Amount Paid by Payer (max ${formatSAR(claimAmount)})`}>
          <input
            type="number"
            min={0}
            max={claimAmount}
            className={formInputClass}
            value={paidAmount}
            onChange={(e) => setPaidAmount(Math.max(0, Math.min(claimAmount, Number(e.target.value) || 0)))}
          />
        </FormField>
        {paidAmount < claimAmount && paidAmount > 0 && (
          <p className="mt-3 text-xs text-caution-amber font-semibold">Partial adjudication — {formatSAR(claimAmount - paidAmount)} of the claimed amount will not be paid.</p>
        )}
      </FormSection>
    </Drawer>
  );
}
