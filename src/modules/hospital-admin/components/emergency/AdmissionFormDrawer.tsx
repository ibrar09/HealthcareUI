import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { RequestAdmissionInput, BedRequestPriority } from "@modules/hospital-admin/api";

interface DepartmentOption {
  id: string;
  name: string;
}
interface BedTypeOption {
  id: string;
  name: string;
}

function emptyValues(visitId: string, departmentId: string, bedTypeId: string, decidedBy: string): RequestAdmissionInput {
  return { visitId, targetDepartmentId: departmentId, bedTypeId, priority: "emergency", decidedBy };
}

interface AdmissionFormDrawerProps {
  open: boolean;
  visitId: string | null;
  visitLabel?: string;
  onClose: () => void;
  onSubmit: (values: RequestAdmissionInput) => void;
  departments: DepartmentOption[];
  bedTypes: BedTypeOption[];
  decidedBy: string;
}

/** Module-local — Emergency Admission (spec §19): Admission Decision -> Bed Request -> real Bed Management queue, never a duplicate flow. */
export function AdmissionFormDrawer({ open, visitId, visitLabel, onClose, onSubmit, departments, bedTypes, decidedBy }: AdmissionFormDrawerProps) {
  const [values, setValues] = useState<RequestAdmissionInput>(emptyValues(visitId ?? "", departments[0]?.id ?? "", bedTypes[0]?.id ?? "", decidedBy));

  useEffect(() => {
    if (open && visitId) setValues(emptyValues(visitId, departments[0]?.id ?? "", bedTypes[0]?.id ?? "", decidedBy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitId]);

  function set<K extends keyof RequestAdmissionInput>(key: K, value: RequestAdmissionInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.targetDepartmentId && values.bedTypeId;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request Admission"
      subtitle={visitLabel}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Submit Bed Request</Button>
        </div>
      }
    >
      <FormSection title="Admission">
        <div className="mb-4">
          <FormField label="Target Department">
            <select className={formInputClass} value={values.targetDepartmentId} onChange={(e) => set("targetDepartmentId", e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Bed Type">
            <select className={formInputClass} value={values.bedTypeId} onChange={(e) => set("bedTypeId", e.target.value)}>
              {bedTypes.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Priority">
          <select className={formInputClass} value={values.priority} onChange={(e) => set("priority", e.target.value as BedRequestPriority)}>
            <option value="emergency">Emergency</option>
            <option value="urgent">Urgent</option>
            <option value="routine">Routine</option>
          </select>
        </FormField>
      </FormSection>
      <p className="text-xs text-on-surface-variant">This creates a real request in Bed Management's own Requests queue — the receiving ward assigns the actual bed there.</p>
    </Drawer>
  );
}
