import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewObservationInput } from "@modules/hospital-admin/api";

function emptyValues(visitId: string, assignedDoctorId: string): NewObservationInput {
  return { visitId, reason: "", expectedReviewTime: "", assignedDoctorId };
}

interface ObservationFormDrawerProps {
  open: boolean;
  visitId: string | null;
  visitLabel?: string;
  onClose: () => void;
  onSubmit: (values: NewObservationInput) => void;
  doctors: { id: string; name: string }[];
  nurses: { id: string; name: string }[];
}

/** Module-local — start an Observation (spec §16). */
export function ObservationFormDrawer({ open, visitId, visitLabel, onClose, onSubmit, doctors, nurses }: ObservationFormDrawerProps) {
  const [values, setValues] = useState<NewObservationInput>(emptyValues(visitId ?? "", doctors[0]?.id ?? ""));

  useEffect(() => {
    if (open && visitId) setValues(emptyValues(visitId, doctors[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitId]);

  function set<K extends keyof NewObservationInput>(key: K, value: NewObservationInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.reason.trim() && values.expectedReviewTime && values.assignedDoctorId;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Start Observation"
      subtitle={visitLabel}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Start Observation</Button>
        </div>
      }
    >
      <FormSection title="Observation">
        <div className="mb-4">
          <FormField label="Reason">
            <textarea className={formInputClass} rows={2} value={values.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. Post-nebulizer monitoring" />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Expected Review Time">
            <input type="datetime-local" className={formInputClass} value={values.expectedReviewTime} onChange={(e) => set("expectedReviewTime", e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Assigned Doctor">
            <select className={formInputClass} value={values.assignedDoctorId} onChange={(e) => set("assignedDoctorId", e.target.value)}>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Assigned Nurse">
            <select className={formInputClass} value={values.assignedNurseId ?? ""} onChange={(e) => set("assignedNurseId", e.target.value || undefined)}>
              <option value="">—</option>
              {nurses.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
