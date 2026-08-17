import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewSurgeryRequestInput, SurgeryPriority, Laterality, SurgicalProcedure, SurgicalTeamOption } from "@modules/hospital-admin/api";

const priorities: SurgeryPriority[] = ["emergency", "urgent", "semi-urgent", "elective"];
const lateralities: Laterality[] = ["not-applicable", "left", "right", "bilateral"];

function emptyValues(): NewSurgeryRequestInput {
  return {
    patientId: "",
    procedureCode: "",
    plannedProcedure: "",
    clinicalIndication: "",
    priority: "elective",
    primarySurgeonId: "",
    estimatedDurationMinutes: 60,
    laterality: "not-applicable",
  };
}

interface PatientOption {
  id: string;
  fullName: string;
}

interface SurgeryRequestDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewSurgeryRequestInput) => void;
  patients: PatientOption[];
  procedures: SurgicalProcedure[];
  surgeons: SurgicalTeamOption[];
  anesthesiologists: SurgicalTeamOption[];
  nurses: SurgicalTeamOption[];
  technicians: SurgicalTeamOption[];
}

/** Module-local — Surgery Request form (spec §9-11): the doctor's request capture, not clinical authorship of the surgery's outcome. */
export function SurgeryRequestDrawer({ open, onClose, onSubmit, patients, procedures, surgeons, anesthesiologists, nurses, technicians }: SurgeryRequestDrawerProps) {
  const [values, setValues] = useState<NewSurgeryRequestInput>(emptyValues());

  useEffect(() => {
    if (open) setValues(emptyValues());
  }, [open]);

  function set<K extends keyof NewSurgeryRequestInput>(key: K, value: NewSurgeryRequestInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function selectProcedure(code: string) {
    const procedure = procedures.find((p) => p.code === code);
    setValues((v) => ({
      ...v,
      procedureCode: code,
      plannedProcedure: procedure?.name ?? v.plannedProcedure,
      estimatedDurationMinutes: procedure?.estimatedDurationMinutes ?? v.estimatedDurationMinutes,
    }));
  }

  const canSubmit = values.patientId && values.procedureCode && values.clinicalIndication.trim() && values.primarySurgeonId;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Surgery Request"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(values);
              onClose();
            }}
            disabled={!canSubmit}
          >
            Submit Request
          </Button>
        </div>
      }
    >
      <FormSection title="Patient">
        <FormField label="Patient">
          <select className={formInputClass} value={values.patientId} onChange={(e) => set("patientId", e.target.value)}>
            <option value="">Select patient...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Procedure">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Procedure">
            <select className={formInputClass} value={values.procedureCode} onChange={(e) => selectProcedure(e.target.value)}>
              <option value="">Select procedure...</option>
              {procedures.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className={formInputClass} value={values.priority} onChange={(e) => set("priority", e.target.value as SurgeryPriority)}>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Surgical Site">
            <input className={formInputClass} value={values.surgicalSite ?? ""} onChange={(e) => set("surgicalSite", e.target.value || undefined)} placeholder="e.g. Abdomen" />
          </FormField>
          <FormField label="Laterality">
            <select className={formInputClass} value={values.laterality} onChange={(e) => set("laterality", e.target.value as Laterality)}>
              {lateralities.map((l) => (
                <option key={l} value={l}>
                  {l.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Clinical Indication">
            <input className={formInputClass} value={values.clinicalIndication} onChange={(e) => set("clinicalIndication", e.target.value)} placeholder="e.g. Acute appendicitis" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Diagnosis Code (optional)">
            <input className={formInputClass} value={values.diagnosis ?? ""} onChange={(e) => set("diagnosis", e.target.value || undefined)} placeholder="e.g. K35.80" />
          </FormField>
          <FormField label="Estimated Duration (minutes)">
            <input type="number" min={5} className={formInputClass} value={values.estimatedDurationMinutes} onChange={(e) => set("estimatedDurationMinutes", Number(e.target.value))} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Surgical Team">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Primary Surgeon">
            <select className={formInputClass} value={values.primarySurgeonId} onChange={(e) => set("primarySurgeonId", e.target.value)}>
              <option value="">Select surgeon...</option>
              {surgeons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Assistant Surgeon (optional)">
            <select className={formInputClass} value={values.assistantSurgeonId ?? ""} onChange={(e) => set("assistantSurgeonId", e.target.value || undefined)}>
              <option value="">None</option>
              {surgeons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Anesthesiologist (optional)">
            <select className={formInputClass} value={values.anesthesiologistId ?? ""} onChange={(e) => set("anesthesiologistId", e.target.value || undefined)}>
              <option value="">Unassigned</option>
              {anesthesiologists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Required Anesthesia">
            <input className={formInputClass} value={values.requiredAnesthesia ?? ""} onChange={(e) => set("requiredAnesthesia", e.target.value || undefined)} placeholder="e.g. General" />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Scrub Nurse (optional)">
            <select className={formInputClass} value={values.scrubNurseId ?? ""} onChange={(e) => set("scrubNurseId", e.target.value || undefined)}>
              <option value="">Unassigned</option>
              {nurses.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Circulating Nurse (optional)">
            <select className={formInputClass} value={values.circulatingNurseId ?? ""} onChange={(e) => set("circulatingNurseId", e.target.value || undefined)}>
              <option value="">Unassigned</option>
              {nurses.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Technician (optional)">
            <select className={formInputClass} value={values.technicianId ?? ""} onChange={(e) => set("technicianId", e.target.value || undefined)}>
              <option value="">Unassigned</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Requirements">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Required OT Type (optional)">
            <input className={formInputClass} value={values.requiredOtType ?? ""} onChange={(e) => set("requiredOtType", e.target.value || undefined)} placeholder="e.g. Cardiac" />
          </FormField>
          <FormField label="Blood Requirement (optional)">
            <input className={formInputClass} value={values.bloodRequirement ?? ""} onChange={(e) => set("bloodRequirement", e.target.value || undefined)} placeholder="e.g. 2 units PRBC" />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Required Equipment (optional)">
            <input className={formInputClass} value={values.requiredEquipment ?? ""} onChange={(e) => set("requiredEquipment", e.target.value || undefined)} placeholder="e.g. C-Arm Fluoroscopy" />
          </FormField>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.implantRequirement ?? false} onChange={(e) => set("implantRequirement", e.target.checked)} />
            Implant Required
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.isolationRequirement ?? false} onChange={(e) => set("isolationRequirement", e.target.checked)} />
            Isolation Required
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.icuBedRequirement ?? false} onChange={(e) => set("icuBedRequirement", e.target.checked)} />
            ICU Bed Required
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.pacuRequirement ?? false} onChange={(e) => set("pacuRequirement", e.target.checked)} />
            PACU Required
          </label>
        </div>
        <FormField label="Special Instructions (optional)">
          <input className={formInputClass} value={values.specialInstructions ?? ""} onChange={(e) => set("specialInstructions", e.target.value || undefined)} placeholder="e.g. Latex allergy — use latex-free supplies" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
