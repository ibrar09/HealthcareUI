import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { LabOrderRow } from "@modules/hospital-admin/api";

interface CancelLabOrderDrawerProps {
  order: LabOrderRow | null;
  onClose: () => void;
  onComplete: () => void;
  currentUserName: string;
}

/** Module-local — administrative order cancellation (a verified/finalized order can't be cancelled — see api.cancelLabOrder). */
export function CancelLabOrderDrawer({ order, onClose, onComplete, currentUserName }: CancelLabOrderDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (order) setReason("");
  }, [order]);

  async function handleSubmit() {
    if (!order || !reason.trim()) return;
    await api.cancelLabOrder(order.id, reason.trim(), currentUserName);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title="Cancel Lab Order"
      subtitle={order ? order.orderNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Cancel Order
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this order being cancelled?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate order — already drawn under another order" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
