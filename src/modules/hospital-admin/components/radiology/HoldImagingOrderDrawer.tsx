import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { ImagingOrderRow } from "@modules/hospital-admin/api";

interface HoldImagingOrderDrawerProps {
  order: ImagingOrderRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — puts an order on hold (spec §41's alternate ON_HOLD path), e.g. pending safety clearance. Release happens directly from Order Details, no separate form needed. */
export function HoldImagingOrderDrawer({ order, onClose, onComplete }: HoldImagingOrderDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (order) setReason("");
  }, [order]);

  async function handleSubmit() {
    if (!order || !reason.trim()) return;
    await api.putImagingOrderOnHold(order.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title="Put Order On Hold"
      subtitle={order ? order.orderNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim()}>
            Put On Hold
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this order being held?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Pending pacemaker MRI-safety clearance" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
