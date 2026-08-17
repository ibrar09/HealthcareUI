import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

interface RejectAuthorizationDrawerProps {
  authorizationId: string | null;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => void;
}

/** Module-local — rejects a pending preauthorization with a required reason (spec §13). */
export function RejectAuthorizationDrawer({ authorizationId, onClose, onSubmit }: RejectAuthorizationDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (authorizationId) setReason("");
  }, [authorizationId]);

  function handleSubmit() {
    if (!authorizationId || !reason.trim()) return;
    onSubmit(authorizationId, reason.trim());
    onClose();
  }

  return (
    <Drawer
      open={Boolean(authorizationId)}
      onClose={onClose}
      title="Reject Authorization"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Reject
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this authorization being rejected?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Not medically necessary per payer review" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
