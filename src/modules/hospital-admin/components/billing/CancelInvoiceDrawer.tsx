import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { InvoiceView } from "@modules/hospital-admin/api";

interface CancelInvoiceDrawerProps {
  invoice: InvoiceView | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — cancels an unpaid invoice with a required reason; its charges revert to validated so they can be re-invoiced. */
export function CancelInvoiceDrawer({ invoice, onClose, onComplete }: CancelInvoiceDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (invoice) setReason("");
  }, [invoice]);

  async function handleSubmit() {
    if (!invoice || !reason.trim()) return;
    await api.cancelInvoice(invoice.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(invoice)}
      onClose={onClose}
      title="Cancel Invoice"
      subtitle={invoice ? invoice.invoiceNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Cancel Invoice
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this invoice being cancelled?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate invoice raised in error" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
