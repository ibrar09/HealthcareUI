import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

interface ResubmitClaimDrawerProps {
  claimId: string | null;
  claimNumber?: string;
  rejectionReason?: string;
  onClose: () => void;
  onSubmit: (claimId: string, correctionNote: string) => void;
}

/** Module-local — Fix → Resubmit (spec §27): a rejected claim goes back into the submission queue with a note on what was corrected. */
export function ResubmitClaimDrawer({ claimId, claimNumber, rejectionReason, onClose, onSubmit }: ResubmitClaimDrawerProps) {
  const [correctionNote, setCorrectionNote] = useState("");

  useEffect(() => {
    if (claimId) setCorrectionNote("");
  }, [claimId]);

  function handleSubmit() {
    if (!claimId || !correctionNote.trim()) return;
    onSubmit(claimId, correctionNote.trim());
    onClose();
  }

  return (
    <Drawer
      open={Boolean(claimId)}
      onClose={onClose}
      title="Resubmit Claim"
      subtitle={claimNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!correctionNote.trim()}>
            Resubmit
          </Button>
        </div>
      }
    >
      {rejectionReason && (
        <FormSection title="Rejection Reason">
          <p className="text-sm text-on-surface-variant italic">"{rejectionReason}"</p>
        </FormSection>
      )}
      <FormSection title="Correction">
        <FormField label="What was corrected before resubmitting?">
          <textarea className={formInputClass} rows={4} value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} placeholder="e.g. Added missing provider identifier" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
