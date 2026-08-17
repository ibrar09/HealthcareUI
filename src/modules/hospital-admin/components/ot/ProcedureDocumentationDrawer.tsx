import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

function emptyValues() {
  return {
    performedProcedure: "",
    findings: "",
    technique: "",
    complications: "",
    estimatedBloodLoss: "",
    specimensCollected: false,
    specimenNote: "",
    implantsUsed: false,
    implantNote: "",
    devices: "",
    drains: "",
    closure: "",
    postOpDiagnosis: "",
    postOpInstructions: "",
  };
}

interface ProcedureDocumentationDrawerProps {
  caseRow: SurgicalCaseRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Surgical Procedure Documentation (spec §19): structured completion capture, not a freeform operative-note editor. Completing this closes out the surgical phase and frees the OT room for cleaning. */
export function ProcedureDocumentationDrawer({ caseRow, onClose, onComplete }: ProcedureDocumentationDrawerProps) {
  const [values, setValues] = useState(emptyValues());

  useEffect(() => {
    if (caseRow) setValues({ ...emptyValues(), performedProcedure: caseRow.procedureName });
  }, [caseRow]);

  function set<K extends keyof ReturnType<typeof emptyValues>>(key: K, value: ReturnType<typeof emptyValues>[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit() {
    if (!caseRow) return;
    await api.completeCaseSurgery(caseRow.id, {
      ...values,
      performedProcedure: values.performedProcedure || undefined,
      findings: values.findings || undefined,
      technique: values.technique || undefined,
      complications: values.complications || undefined,
      estimatedBloodLoss: values.estimatedBloodLoss || undefined,
      specimenNote: values.specimenNote || undefined,
      implantNote: values.implantNote || undefined,
      devices: values.devices || undefined,
      drains: values.drains || undefined,
      closure: values.closure || undefined,
      postOpDiagnosis: values.postOpDiagnosis || undefined,
      postOpInstructions: values.postOpInstructions || undefined,
    });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(caseRow)}
      onClose={onClose}
      title="Complete Surgery"
      subtitle={caseRow ? `${caseRow.caseNumber} · ${caseRow.patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Complete Surgery</Button>
        </div>
      }
    >
      <FormSection title="Procedure">
        <div className="mb-4">
          <FormField label="Performed Procedure">
            <input className={formInputClass} value={values.performedProcedure} onChange={(e) => set("performedProcedure", e.target.value)} />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Findings">
            <textarea className={formInputClass} rows={2} value={values.findings} onChange={(e) => set("findings", e.target.value)} placeholder="e.g. Acutely inflamed appendix, no perforation" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Technique">
            <input className={formInputClass} value={values.technique} onChange={(e) => set("technique", e.target.value)} placeholder="e.g. 3-port laparoscopic approach" />
          </FormField>
          <FormField label="Estimated Blood Loss">
            <input className={formInputClass} value={values.estimatedBloodLoss} onChange={(e) => set("estimatedBloodLoss", e.target.value)} placeholder="e.g. 50 mL" />
          </FormField>
        </div>
        <FormField label="Complications">
          <input className={formInputClass} value={values.complications} onChange={(e) => set("complications", e.target.value)} placeholder="e.g. None" />
        </FormField>
      </FormSection>

      <FormSection title="Specimens & Implants">
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.specimensCollected} onChange={(e) => set("specimensCollected", e.target.checked)} />
            Specimens Collected
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.implantsUsed} onChange={(e) => set("implantsUsed", e.target.checked)} />
            Implants Used
          </label>
        </div>
        {values.specimensCollected && (
          <div className="mb-4">
            <FormField label="Specimen Note">
              <input className={formInputClass} value={values.specimenNote} onChange={(e) => set("specimenNote", e.target.value)} placeholder="e.g. Appendix sent to pathology" />
            </FormField>
          </div>
        )}
        {values.implantsUsed && (
          <FormField label="Implant Note">
            <input className={formInputClass} value={values.implantNote} onChange={(e) => set("implantNote", e.target.value)} placeholder="e.g. Titanium mesh, lot #4821" />
          </FormField>
        )}
      </FormSection>

      <FormSection title="Closure">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Devices">
            <input className={formInputClass} value={values.devices} onChange={(e) => set("devices", e.target.value)} placeholder="e.g. None" />
          </FormField>
          <FormField label="Drains">
            <input className={formInputClass} value={values.drains} onChange={(e) => set("drains", e.target.value)} placeholder="e.g. None" />
          </FormField>
        </div>
        <FormField label="Closure">
          <input className={formInputClass} value={values.closure} onChange={(e) => set("closure", e.target.value)} placeholder="e.g. Layered closure, subcuticular skin closure" />
        </FormField>
      </FormSection>

      <FormSection title="Post-Operative">
        <div className="mb-4">
          <FormField label="Post-Op Diagnosis">
            <input className={formInputClass} value={values.postOpDiagnosis} onChange={(e) => set("postOpDiagnosis", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Post-Op Instructions">
          <input className={formInputClass} value={values.postOpInstructions} onChange={(e) => set("postOpInstructions", e.target.value)} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
