import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewEmergencyVisitInput, EmergencyArrivalMode } from "@modules/hospital-admin/api";

const modes: EmergencyArrivalMode[] = ["walk-in", "ambulance", "transfer", "police", "referral"];

function emptyValues(patientId: string): NewEmergencyVisitInput {
  return { patientId, arrivalMode: "walk-in", chiefComplaint: "" };
}

interface RegisterVisitDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewEmergencyVisitInput) => void;
  patients: { id: string; fullName: string }[];
}

/** Module-local — Patient Arrival -> Registration/Identification (spec §3), the entry point into the ED queue. */
export function RegisterVisitDrawer({ open, onClose, onSubmit, patients }: RegisterVisitDrawerProps) {
  const [values, setValues] = useState<NewEmergencyVisitInput>(emptyValues(patients[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(patients[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewEmergencyVisitInput>(key: K, value: NewEmergencyVisitInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Register Emergency Arrival"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!values.patientId || !values.chiefComplaint.trim()}>Add to Queue</Button>
        </div>
      }
    >
      <FormSection title="Arrival">
        <div className="mb-4">
          <FormField label="Patient">
            <select className={formInputClass} value={values.patientId} onChange={(e) => set("patientId", e.target.value)}>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Arrival Mode">
          <select className={formInputClass} value={values.arrivalMode} onChange={(e) => set("arrivalMode", e.target.value as EmergencyArrivalMode)}>
            {modes.map((m) => (
              <option key={m} value={m}>{m.replace(/-/g, " ")}</option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Presenting Complaint">
        <FormField label="Chief Complaint">
          <textarea className={formInputClass} rows={3} value={values.chiefComplaint} onChange={(e) => set("chiefComplaint", e.target.value)} placeholder="e.g. Severe chest pain, onset 30 minutes ago" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
