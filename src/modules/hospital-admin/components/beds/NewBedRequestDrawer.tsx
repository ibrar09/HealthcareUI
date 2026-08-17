import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import * as api from "@modules/hospital-admin/api";
import type { BedRequestPriority, BedTypeConfig } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface NewBedRequestDrawerProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  bedTypes: BedTypeConfig[];
  departmentOptions: { id: string; name: string }[];
  staffOptions: { id: string; name: string }[];
  requestedByStaffId: string;
}

const priorityOptions: { value: BedRequestPriority; label: string; color: string }[] = [
  { value: "routine", label: "Routine", color: "var(--signal-indigo)" },
  { value: "urgent", label: "Urgent", color: "var(--caution-amber)" },
  { value: "emergency", label: "Emergency", color: "var(--pulse-coral)" },
];

/** Module-local — raise a new Bed Request (spec §14) for a patient who needs a bed of a given type. */
export function NewBedRequestDrawer({ open, onClose, onComplete, bedTypes, departmentOptions, staffOptions, requestedByStaffId }: NewBedRequestDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [bedTypeId, setBedTypeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState<BedRequestPriority>("routine");
  const [requesterId, setRequesterId] = useState(requestedByStaffId);

  useEffect(() => {
    if (open) {
      setPatient(undefined);
      setBedTypeId("");
      setDepartmentId("");
      setPriority("routine");
      setRequesterId(requestedByStaffId);
    }
  }, [open, requestedByStaffId]);

  async function handleSubmit() {
    if (!patient || !bedTypeId) return;
    await api.createBedRequest({
      patientId: patient.id,
      bedTypeId,
      departmentId: departmentId || undefined,
      priority,
      requestedByStaffId: requesterId,
    });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Bed Request"
      subtitle="Request a bed for a patient who needs one."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!patient || !bedTypeId}>
            Submit Request
          </Button>
        </div>
      }
    >
      <FormSection title="Patient">
        <PatientPicker value={patient} onChange={setPatient} />
      </FormSection>

      <FormSection title="Requirements">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Bed Type">
            <select className={formInputClass} value={bedTypeId} onChange={(e) => setBedTypeId(e.target.value)}>
              <option value="" disabled>
                Select a bed type
              </option>
              {bedTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Department (optional)">
            <select className={formInputClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Any department</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Priority</span>
        <div className="mb-4 flex gap-2">
          {priorityOptions.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all"
              style={
                priority === p.value
                  ? { borderColor: p.color, backgroundColor: `color-mix(in srgb, ${p.color} 12%, transparent)`, color: p.color }
                  : { borderColor: "var(--line)", color: "var(--on-surface-variant)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <FormField label="Requested By">
          <select className={formInputClass} value={requesterId} onChange={(e) => setRequesterId(e.target.value)}>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
