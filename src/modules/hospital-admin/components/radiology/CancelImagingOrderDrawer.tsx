import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { ImagingOrderRow } from "@modules/hospital-admin/api";

interface CancelImagingOrderDrawerProps {
  order: ImagingOrderRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — administrative order cancellation (a completed order can't be cancelled — see api.cancelImagingOrder). */
export function CancelImagingOrderDrawer({ order, onClose, onComplete }: CancelImagingOrderDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (order) setReason("");
  }, [order]);

  async function handleSubmit() {
    if (!order || !reason.trim()) return;
    await api.cancelImagingOrder(order.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title="Cancel Imaging Order"
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
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Patient declined" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
