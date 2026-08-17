import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { WriteOffView } from "@modules/hospital-admin/api";

interface RejectWriteOffDrawerProps {
  writeOff: WriteOffView | null;
  onClose: () => void;
  onSubmit: (writeOffId: string, reason: string) => void;
}

/** Module-local — rejects a requested write-off with a required reason. */
export function RejectWriteOffDrawer({ writeOff, onClose, onSubmit }: RejectWriteOffDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (writeOff) setReason("");
  }, [writeOff]);

  function handleSubmit() {
    if (!writeOff || !reason.trim()) return;
    onSubmit(writeOff.id, reason.trim());
    onClose();
  }

  return (
    <Drawer
      open={Boolean(writeOff)}
      onClose={onClose}
      title="Reject Write-Off"
      subtitle={writeOff?.writeOffNumber}
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
        <FormField label="Why is this write-off being rejected?">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Collections should continue pursuing this balance" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
