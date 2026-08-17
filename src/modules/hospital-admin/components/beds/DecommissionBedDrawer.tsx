import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

interface DecommissionBedDrawerProps {
  bed: { id: string; identifier: string } | null;
  onClose: () => void;
  onSubmit: (bedId: string, reason: string) => void;
}

/** Module-local — Bed Management Phase 4 config screen (spec §29): permanently retire a bed, with a required reason. */
export function DecommissionBedDrawer({ bed, onClose, onSubmit }: DecommissionBedDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (bed) setReason("");
  }, [bed]);

  function handleSubmit() {
    if (!bed || !reason.trim()) return;
    onSubmit(bed.id, reason.trim());
    onClose();
  }

  return (
    <Drawer
      open={Boolean(bed)}
      onClose={onClose}
      title="Decommission Bed"
      subtitle={bed ? `Bed ${bed.identifier} — permanently removed from active service` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Decommission
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this bed being decommissioned?">
          <textarea
            className={formInputClass}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Ward renovation — bed permanently removed from inventory"
          />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
