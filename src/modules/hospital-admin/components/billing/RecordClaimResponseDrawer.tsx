import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

type Outcome = "accepted" | "rejected" | "denied";

interface RecordClaimResponseDrawerProps {
  claimId: string | null;
  claimNumber?: string;
  onClose: () => void;
  onSubmit: (claimId: string, outcome: Outcome, reason?: string) => void;
}

/** Module-local — records the payer's response to a submitted claim (spec §27): accepted, rejected (data issue), or denied (adjudicated, unpaid). */
export function RecordClaimResponseDrawer({ claimId, claimNumber, onClose, onSubmit }: RecordClaimResponseDrawerProps) {
  const [outcome, setOutcome] = useState<Outcome>("accepted");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (claimId) {
      setOutcome("accepted");
      setReason("");
    }
  }, [claimId]);

  function handleSubmit() {
    if (!claimId) return;
    if ((outcome === "rejected" || outcome === "denied") && !reason.trim()) return;
    onSubmit(claimId, outcome, reason.trim() || undefined);
    onClose();
  }

  const canSubmit = outcome === "accepted" || reason.trim().length > 0;

  return (
    <Drawer
      open={Boolean(claimId)}
      onClose={onClose}
      title="Record Payer Response"
      subtitle={claimNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Record Response
          </Button>
        </div>
      }
    >
      <FormSection title="Outcome">
        <div className="flex gap-2">
          {(["accepted", "rejected", "denied"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all capitalize ${
                outcome === o ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </FormSection>

      {(outcome === "rejected" || outcome === "denied") && (
        <FormSection title={outcome === "rejected" ? "Rejection Reason" : "Denial Reason"}>
          <FormField label={outcome === "rejected" ? "Why couldn't the payer process this claim as submitted?" : "Why did the payer deny payment?"}>
            <textarea
              className={formInputClass}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={outcome === "rejected" ? "e.g. Missing provider identifier" : "e.g. Service not covered under plan benefits"}
            />
          </FormField>
        </FormSection>
      )}
    </Drawer>
  );
}
