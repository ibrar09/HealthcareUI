import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { ImagingOrderRow } from "@modules/hospital-admin/api";

interface AuthorizeImagingOrderDrawerProps {
  order: ImagingOrderRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — records the payer's authorization decision (spec §31: Approve/Reject). Administrative record-keeping, not a clinical decision. */
export function AuthorizeImagingOrderDrawer({ order, onClose, onComplete }: AuthorizeImagingOrderDrawerProps) {
  const [authorizationNumber, setAuthorizationNumber] = useState("");

  useEffect(() => {
    if (order) setAuthorizationNumber("");
  }, [order]);

  async function handleDecision(decision: "approved" | "rejected") {
    if (!order) return;
    await api.authorizeImagingOrder(order.id, decision, decision === "approved" ? authorizationNumber || undefined : undefined);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title="Authorize Imaging Order"
      subtitle={order ? order.orderNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDecision("rejected")}>
            Reject
          </Button>
          <Button onClick={() => handleDecision("approved")}>Approve</Button>
        </div>
      }
    >
      <FormSection title="Authorization Number">
        <FormField label="Authorization Number (if approving)">
          <input className={formInputClass} value={authorizationNumber} onChange={(e) => setAuthorizationNumber(e.target.value)} placeholder="e.g. AUTH-78399" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
