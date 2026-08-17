import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { statusPillStyle } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { PerformTriageInput, TriageCategory, EmergencyAreaConfig, EmergencyQueueRow } from "@modules/hospital-admin/api";

function emptyValues(visitId: string, triageCategoryId: string, areaId: string, triagedBy: string): PerformTriageInput {
  return {
    visitId,
    symptoms: "",
    onset: "",
    duration: "",
    severity: "",
    triageCategoryId,
    triagedBy,
    assignedAreaId: areaId,
    vitals: {},
  };
}

interface TriageFormDrawerProps {
  visit: EmergencyQueueRow | null;
  onClose: () => void;
  onSubmit: (values: PerformTriageInput) => void;
  triageCategories: TriageCategory[];
  areas: EmergencyAreaConfig[];
  triageStaffOptions: { id: string; name: string }[];
}

/** Module-local — the full Triage documentation workflow (spec §3): presenting complaint + vitals + priority + area, in one pass. */
export function TriageFormDrawer({ visit, onClose, onSubmit, triageCategories, areas, triageStaffOptions }: TriageFormDrawerProps) {
  const [values, setValues] = useState<PerformTriageInput>(emptyValues("", triageCategories[2]?.id ?? "", areas[0]?.id ?? "", triageStaffOptions[0]?.id ?? ""));

  useEffect(() => {
    if (visit) setValues(emptyValues(visit.id, triageCategories[2]?.id ?? "", areas[0]?.id ?? "", triageStaffOptions[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit?.id]);

  function set<K extends keyof PerformTriageInput>(key: K, value: PerformTriageInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  function setVital<K extends keyof PerformTriageInput["vitals"]>(key: K, value: PerformTriageInput["vitals"][K]) {
    setValues((v) => ({ ...v, vitals: { ...v.vitals, [key]: value } }));
  }

  const canSubmit = values.symptoms.trim() && values.triageCategoryId && values.assignedAreaId && values.triagedBy;

  return (
    <Drawer
      open={Boolean(visit)}
      onClose={onClose}
      title="Perform Triage"
      subtitle={visit ? `${visit.queueNumber} — ${visit.patientName}` : undefined}
      widthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Complete Triage</Button>
        </div>
      }
    >
      <FormSection title="Presenting Complaint">
        <div className="mb-4">
          <FormField label="Symptoms">
            <textarea className={formInputClass} rows={2} value={values.symptoms} onChange={(e) => set("symptoms", e.target.value)} placeholder="e.g. Chest pain radiating to left arm, diaphoresis" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Onset">
            <input className={formInputClass} value={values.onset} onChange={(e) => set("onset", e.target.value)} placeholder="e.g. 45 minutes ago" />
          </FormField>
          <FormField label="Duration">
            <input className={formInputClass} value={values.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. Continuous" />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Severity">
            <input className={formInputClass} value={values.severity} onChange={(e) => set("severity", e.target.value)} placeholder="e.g. 9/10, worsening" />
          </FormField>
        </div>
        <FormField label="Relevant History (optional)">
          <input className={formInputClass} value={values.relevantHistory ?? ""} onChange={(e) => set("relevantHistory", e.target.value || undefined)} />
        </FormField>
      </FormSection>

      <FormSection title="Vital Signs">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <FormField label="Temp (°C)">
            <input type="number" step={0.1} className={formInputClass} value={values.vitals.temperature ?? ""} onChange={(e) => setVital("temperature", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="Heart Rate">
            <input type="number" className={formInputClass} value={values.vitals.heartRate ?? ""} onChange={(e) => setVital("heartRate", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="Resp. Rate">
            <input type="number" className={formInputClass} value={values.vitals.respiratoryRate ?? ""} onChange={(e) => setVital("respiratoryRate", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <FormField label="BP Systolic">
            <input type="number" className={formInputClass} value={values.vitals.bpSystolic ?? ""} onChange={(e) => setVital("bpSystolic", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="BP Diastolic">
            <input type="number" className={formInputClass} value={values.vitals.bpDiastolic ?? ""} onChange={(e) => setVital("bpDiastolic", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="SpO2 (%)">
            <input type="number" className={formInputClass} value={values.vitals.spo2 ?? ""} onChange={(e) => setVital("spo2", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Pain (0-10)">
            <input type="number" min={0} max={10} className={formInputClass} value={values.vitals.painScore ?? ""} onChange={(e) => setVital("painScore", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="Weight (kg)">
            <input type="number" className={formInputClass} value={values.vitals.weight ?? ""} onChange={(e) => setVital("weight", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="GCS (optional)">
            <input type="number" min={3} max={15} className={formInputClass} value={values.vitals.gcs ?? ""} onChange={(e) => setVital("gcs", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Priority & Assignment">
        <div className="mb-3">
          <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Triage Priority</span>
          <div className="flex flex-wrap gap-2">
            {triageCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set("triageCategoryId", c.id)}
                className="rounded-full px-3 py-1.5 text-xs font-bold border-2 transition-all"
                style={values.triageCategoryId === c.id ? { ...statusPillStyle(c.color), borderColor: c.color } : { borderColor: "transparent", backgroundColor: "var(--surface-container-low)", color: "var(--on-surface-variant)" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Emergency Area">
            <select className={formInputClass} value={values.assignedAreaId} onChange={(e) => set("assignedAreaId", e.target.value)}>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Triaged By">
            <select className={formInputClass} value={values.triagedBy} onChange={(e) => set("triagedBy", e.target.value)}>
              {triageStaffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
