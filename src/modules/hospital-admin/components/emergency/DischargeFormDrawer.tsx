import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { RecordDischargeInput } from "@modules/hospital-admin/api";

function emptyValues(visitId: string, decidedBy: string): RecordDischargeInput {
  return { visitId, diagnosis: "", treatmentProvided: "", dischargeInstructions: "", decidedBy };
}

interface DischargeFormDrawerProps {
  open: boolean;
  visitId: string | null;
  visitLabel?: string;
  onClose: () => void;
  onSubmit: (values: RecordDischargeInput) => void;
  decidedBy: string;
}

/** Module-local — Emergency Discharge (spec §18): final assessment, treatment, meds, instructions, follow-up, warning signs. */
export function DischargeFormDrawer({ open, visitId, visitLabel, onClose, onSubmit, decidedBy }: DischargeFormDrawerProps) {
  const [values, setValues] = useState<RecordDischargeInput>(emptyValues(visitId ?? "", decidedBy));

  useEffect(() => {
    if (open && visitId) setValues(emptyValues(visitId, decidedBy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitId]);

  function set<K extends keyof RecordDischargeInput>(key: K, value: RecordDischargeInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.diagnosis.trim() && values.treatmentProvided.trim() && values.dischargeInstructions.trim();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Emergency Discharge"
      subtitle={visitLabel}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Complete Discharge</Button>
        </div>
      }
    >
      <FormSection title="Final Assessment">
        <div className="mb-4">
          <FormField label="Diagnosis">
            <input className={formInputClass} value={values.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Treatment Provided">
          <textarea className={formInputClass} rows={2} value={values.treatmentProvided} onChange={(e) => set("treatmentProvided", e.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title="Discharge Plan">
        <div className="mb-4">
          <FormField label="Discharge Medications (optional)">
            <input className={formInputClass} value={values.dischargeMedications ?? ""} onChange={(e) => set("dischargeMedications", e.target.value || undefined)} />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Discharge Instructions">
            <textarea className={formInputClass} rows={2} value={values.dischargeInstructions} onChange={(e) => set("dischargeInstructions", e.target.value)} />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Follow-up (optional)">
            <input className={formInputClass} value={values.followUp ?? ""} onChange={(e) => set("followUp", e.target.value || undefined)} placeholder="e.g. GP follow-up in 1 week" />
          </FormField>
        </div>
        <FormField label="Warning Signs / Return Instructions (optional)">
          <textarea className={formInputClass} rows={2} value={values.warningSign ?? ""} onChange={(e) => set("warningSign", e.target.value || undefined)} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
