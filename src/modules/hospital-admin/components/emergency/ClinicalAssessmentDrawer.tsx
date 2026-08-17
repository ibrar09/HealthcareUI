import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { SaveClinicalAssessmentInput, EmergencyClinicalAssessment } from "@modules/hospital-admin/api";

function emptyValues(visitId: string, authoredBy: string): SaveClinicalAssessmentInput {
  return { visitId, historyOfPresentIllness: "", examinationFindings: "", workingDiagnosis: "", plan: "", authoredBy };
}

interface ClinicalAssessmentDrawerProps {
  open: boolean;
  visitId: string | null;
  visitLabel?: string;
  existing: EmergencyClinicalAssessment | null;
  onClose: () => void;
  onSubmit: (values: SaveClinicalAssessmentInput) => void;
  authorId: string;
}

/** Module-local — Emergency Clinical Assessment (spec §8): History, Examination, Assessment, Plan. */
export function ClinicalAssessmentDrawer({ open, visitId, visitLabel, existing, onClose, onSubmit, authorId }: ClinicalAssessmentDrawerProps) {
  const [values, setValues] = useState<SaveClinicalAssessmentInput>(emptyValues(visitId ?? "", authorId));

  useEffect(() => {
    if (open && visitId) {
      setValues(
        existing
          ? { visitId, historyOfPresentIllness: existing.historyOfPresentIllness, pastMedicalHistory: existing.pastMedicalHistory, surgicalHistory: existing.surgicalHistory, medicationHistory: existing.medicationHistory, allergyHistory: existing.allergyHistory, familySocialHistory: existing.familySocialHistory, examinationFindings: existing.examinationFindings, workingDiagnosis: existing.workingDiagnosis, differentialDiagnosis: existing.differentialDiagnosis, clinicalImpression: existing.clinicalImpression, plan: existing.plan, authoredBy: authorId }
          : emptyValues(visitId, authorId)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitId, existing]);

  function set<K extends keyof SaveClinicalAssessmentInput>(key: K, value: SaveClinicalAssessmentInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.historyOfPresentIllness.trim() && values.examinationFindings.trim() && values.workingDiagnosis.trim() && values.plan.trim();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Clinical Assessment"
      subtitle={visitLabel}
      widthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Save Assessment</Button>
        </div>
      }
    >
      <FormSection title="History">
        <div className="mb-4">
          <FormField label="History of Present Illness">
            <textarea className={formInputClass} rows={3} value={values.historyOfPresentIllness} onChange={(e) => set("historyOfPresentIllness", e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Past Medical History">
            <input className={formInputClass} value={values.pastMedicalHistory ?? ""} onChange={(e) => set("pastMedicalHistory", e.target.value || undefined)} />
          </FormField>
          <FormField label="Surgical History">
            <input className={formInputClass} value={values.surgicalHistory ?? ""} onChange={(e) => set("surgicalHistory", e.target.value || undefined)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Medication History">
            <input className={formInputClass} value={values.medicationHistory ?? ""} onChange={(e) => set("medicationHistory", e.target.value || undefined)} />
          </FormField>
          <FormField label="Allergy History">
            <input className={formInputClass} value={values.allergyHistory ?? ""} onChange={(e) => set("allergyHistory", e.target.value || undefined)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Examination">
        <FormField label="Examination Findings">
          <textarea className={formInputClass} rows={3} value={values.examinationFindings} onChange={(e) => set("examinationFindings", e.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title="Assessment">
        <div className="mb-4">
          <FormField label="Working Diagnosis">
            <input className={formInputClass} value={values.workingDiagnosis} onChange={(e) => set("workingDiagnosis", e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Differential Diagnosis (optional)">
            <input className={formInputClass} value={values.differentialDiagnosis ?? ""} onChange={(e) => set("differentialDiagnosis", e.target.value || undefined)} />
          </FormField>
          <FormField label="Clinical Impression (optional)">
            <input className={formInputClass} value={values.clinicalImpression ?? ""} onChange={(e) => set("clinicalImpression", e.target.value || undefined)} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Plan">
        <FormField label="Plan">
          <textarea className={formInputClass} rows={3} value={values.plan} onChange={(e) => set("plan", e.target.value)} placeholder="Medication, lab/imaging orders, procedures, consultation, observation, admission, discharge, transfer" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
