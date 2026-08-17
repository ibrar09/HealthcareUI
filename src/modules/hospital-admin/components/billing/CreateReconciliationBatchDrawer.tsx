import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewReconciliationBatchInput, Payer } from "@modules/hospital-admin/api";

interface CreateReconciliationBatchDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewReconciliationBatchInput) => void;
  payers: Payer[];
}

/** Module-local — Payer Payment → Payment File / Reference (spec §32), the first step of reconciliation. */
export function CreateReconciliationBatchDrawer({ open, onClose, onSubmit, payers }: CreateReconciliationBatchDrawerProps) {
  const [payerId, setPayerId] = useState("");
  const [reference, setReference] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (open) {
      setPayerId(payers[0]?.id ?? "");
      setReference("");
      setTotalAmount(0);
    }
  }, [open, payers]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Payment Batch"
      subtitle="A lump-sum payment received from a payer, to be matched against individual claims."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit({ payerId, reference: reference.trim(), totalAmount });
              onClose();
            }}
            disabled={!payerId || !reference.trim() || totalAmount <= 0}
          >
            Create Batch
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Payer">
            <select className={formInputClass} value={payerId} onChange={(e) => setPayerId(e.target.value)}>
              {payers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Payment Reference">
            <input className={formInputClass} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. Bank reference or payment file ID" />
          </FormField>
        </div>
        <FormField label="Total Amount (SAR)">
          <input type="number" min={0} className={formInputClass} value={totalAmount} onChange={(e) => setTotalAmount(Math.max(0, Number(e.target.value) || 0))} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
