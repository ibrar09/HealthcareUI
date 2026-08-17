import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { BedRequestView } from "@modules/hospital-admin/api";

interface RejectRequestDrawerProps {
  request: BedRequestView | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — rejects a pending Bed Request with a required reason. */
export function RejectRequestDrawer({ request, onClose, onComplete }: RejectRequestDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (request) setReason("");
  }, [request]);

  async function handleSubmit() {
    if (!request || !reason.trim()) return;
    await api.rejectBedRequest(request.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(request)}
      onClose={onClose}
      title="Reject Bed Request"
      subtitle={request ? `${request.patientName} · ${request.bedTypeName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Reject Request
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this request being rejected?">
          <textarea
            className={formInputClass}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. No matching bed type available at this facility"
          />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
