import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { PrescriptionRow } from "@modules/hospital-admin/api";

export type ReasonDrawerMode = "reject" | "cancel" | "return";

const titles: Record<ReasonDrawerMode, string> = { reject: "Reject Prescription", cancel: "Cancel Prescription", return: "Record Return" };
const buttonLabels: Record<ReasonDrawerMode, string> = { reject: "Reject", cancel: "Cancel Prescription", return: "Record Return" };
const placeholders: Record<ReasonDrawerMode, string> = {
  reject: "e.g. Invalid prescription — missing prescriber signature",
  cancel: "e.g. Patient no longer requires medication",
  return: "e.g. Patient reported adverse reaction",
};

interface PrescriptionReasonDrawerProps {
  prescription: PrescriptionRow | null;
  mode: ReasonDrawerMode;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — shared reason-capture drawer for Reject/Cancel/Return (spec §3, §22, §29), same one-drawer-many-modes pattern as OT's Schedule/Reschedule drawer. */
export function PrescriptionReasonDrawer({ prescription, mode, onClose, onComplete }: PrescriptionReasonDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (prescription) setReason("");
  }, [prescription]);

  async function handleSubmit() {
    if (!prescription || !reason.trim()) return;
    if (mode === "reject") await api.rejectPrescription(prescription.id, reason.trim());
    else if (mode === "cancel") await api.cancelPrescription(prescription.id, reason.trim());
    else await api.recordPrescriptionReturn(prescription.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(prescription)}
      onClose={onClose}
      title={titles[mode]}
      subtitle={prescription ? prescription.prescriptionNumber : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Back
          </Button>
          <Button variant={mode === "return" ? "primary" : "danger"} onClick={handleSubmit} disabled={!reason.trim()}>
            {buttonLabels[mode]}
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Reason">
          <textarea className={formInputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={placeholders[mode]} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
