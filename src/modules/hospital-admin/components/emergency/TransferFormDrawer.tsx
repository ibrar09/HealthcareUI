import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { RequestTransferInput, BedRequestPriority } from "@modules/hospital-admin/api";

function emptyValues(visitId: string, decidedBy: string): RequestTransferInput {
  return { visitId, receivingOrganization: "", receivingDepartment: "", transferReason: "", transferPriority: "urgent", clinicalSummary: "", decidedBy };
}

interface TransferFormDrawerProps {
  open: boolean;
  visitId: string | null;
  visitLabel?: string;
  onClose: () => void;
  onSubmit: (values: RequestTransferInput) => void;
  decidedBy: string;
}

/** Module-local — Emergency Transfer (spec §20): receiving organization/department/physician, reason, priority, clinical summary. */
export function TransferFormDrawer({ open, visitId, visitLabel, onClose, onSubmit, decidedBy }: TransferFormDrawerProps) {
  const [values, setValues] = useState<RequestTransferInput>(emptyValues(visitId ?? "", decidedBy));

  useEffect(() => {
    if (open && visitId) setValues(emptyValues(visitId, decidedBy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitId]);

  function set<K extends keyof RequestTransferInput>(key: K, value: RequestTransferInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.receivingOrganization.trim() && values.receivingDepartment.trim() && values.transferReason.trim() && values.clinicalSummary.trim();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request Transfer"
      subtitle={visitLabel}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Submit Transfer Request</Button>
        </div>
      }
    >
      <FormSection title="Receiving Facility">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Receiving Organization">
            <input className={formInputClass} value={values.receivingOrganization} onChange={(e) => set("receivingOrganization", e.target.value)} placeholder="e.g. St. Mary's Trauma Center" />
          </FormField>
          <FormField label="Receiving Department">
            <input className={formInputClass} value={values.receivingDepartment} onChange={(e) => set("receivingDepartment", e.target.value)} placeholder="e.g. Neurosurgery" />
          </FormField>
        </div>
        <FormField label="Receiving Physician (optional)">
          <input className={formInputClass} value={values.receivingPhysician ?? ""} onChange={(e) => set("receivingPhysician", e.target.value || undefined)} />
        </FormField>
      </FormSection>

      <FormSection title="Transfer Details">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Reason">
            <input className={formInputClass} value={values.transferReason} onChange={(e) => set("transferReason", e.target.value)} />
          </FormField>
          <FormField label="Priority">
            <select className={formInputClass} value={values.transferPriority} onChange={(e) => set("transferPriority", e.target.value as BedRequestPriority)}>
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent</option>
              <option value="routine">Routine</option>
            </select>
          </FormField>
        </div>
        <FormField label="Clinical Summary">
          <textarea className={formInputClass} rows={3} value={values.clinicalSummary} onChange={(e) => set("clinicalSummary", e.target.value)} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
