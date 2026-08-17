import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { AdjustmentType } from "@modules/hospital-admin/api";

interface CreateAdjustmentDrawerProps {
  invoiceId: string | null;
  invoiceNumber?: string;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Credit Note / Debit Adjustment (spec §21) — never edits the invoice directly; a separate record netted in at read time. */
export function CreateAdjustmentDrawer({ invoiceId, invoiceNumber, onClose, onComplete }: CreateAdjustmentDrawerProps) {
  const [type, setType] = useState<AdjustmentType>("credit");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (invoiceId) {
      setType("credit");
      setAmount(0);
      setReason("");
    }
  }, [invoiceId]);

  async function handleSubmit() {
    if (!invoiceId || amount <= 0 || !reason.trim()) return;
    await api.createAdjustment({ invoiceId, type, amount, reason: reason.trim() });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(invoiceId)}
      onClose={onClose}
      title="Add Adjustment"
      subtitle={invoiceNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={amount <= 0 || !reason.trim()}>
            Add Adjustment
          </Button>
        </div>
      }
    >
      <FormSection title="Type">
        <div className="flex gap-2">
          {(["credit", "debit"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all capitalize ${
                type === t ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {t === "credit" ? "Credit Note (reduces balance)" : "Debit Adjustment (increases balance)"}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Amount (SAR)">
            <input type="number" min={0} className={formInputClass} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} />
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Billing error correction" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
