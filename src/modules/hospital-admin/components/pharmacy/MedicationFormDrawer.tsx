import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewMedicationInput, MedicationForm, MedicationRoute } from "@modules/hospital-admin/api";

const forms: MedicationForm[] = ["tablet", "capsule", "syrup", "solution", "suspension", "injection", "cream", "ointment", "gel", "drops", "inhaler", "suppository", "patch", "powder"];
const routes: MedicationRoute[] = ["oral", "iv", "im", "subcutaneous", "topical", "inhalation", "ophthalmic", "otic", "rectal", "vaginal", "sublingual"];

function emptyValues(): NewMedicationInput {
  return { genericName: "", brandName: "", strength: "", form: "tablet", route: "oral", manufacturer: "", packageSize: "", unit: "", prescriptionRequired: true, controlledSubstance: false, unitPrice: 0 };
}

interface MedicationFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewMedicationInput) => void;
  initialValues?: NewMedicationInput;
}

/** Module-local — add/edit a Medication (spec §6-8): standardized Forms/Routes dropdowns, never free text. */
export function MedicationFormDrawer({ open, onClose, onSubmit, initialValues }: MedicationFormDrawerProps) {
  const [values, setValues] = useState<NewMedicationInput>(initialValues ?? emptyValues());
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues());
  }, [open, initialValues]);

  function set<K extends keyof NewMedicationInput>(key: K, value: NewMedicationInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Medication" : "Add Medication"}
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
            disabled={!values.genericName.trim() || !values.strength.trim() || !values.manufacturer.trim()}
          >
            {isEdit ? "Save Changes" : "Add Medication"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Generic Name">
            <input className={formInputClass} value={values.genericName} onChange={(e) => set("genericName", e.target.value)} placeholder="e.g. Paracetamol" />
          </FormField>
          <FormField label="Brand Name (optional)">
            <input className={formInputClass} value={values.brandName ?? ""} onChange={(e) => set("brandName", e.target.value || undefined)} placeholder="e.g. Panadol" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Strength">
            <input className={formInputClass} value={values.strength} onChange={(e) => set("strength", e.target.value)} placeholder="e.g. 500 mg" />
          </FormField>
          <FormField label="Manufacturer">
            <input className={formInputClass} value={values.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} placeholder="e.g. GSK" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Form & Route">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Dose Form">
            <select className={formInputClass} value={values.form} onChange={(e) => set("form", e.target.value as MedicationForm)}>
              {forms.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Route of Administration">
            <select className={formInputClass} value={values.route} onChange={(e) => set("route", e.target.value as MedicationRoute)}>
              {routes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Packaging & Pricing">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Package Size">
            <input className={formInputClass} value={values.packageSize} onChange={(e) => set("packageSize", e.target.value)} placeholder="e.g. 10 tablets/strip" />
          </FormField>
          <FormField label="Unit">
            <input className={formInputClass} value={values.unit} onChange={(e) => set("unit", e.target.value)} placeholder="e.g. tablet" />
          </FormField>
        </div>
        <FormField label="Unit Price ($)">
          <input type="number" min={0} step={0.01} className={formInputClass} value={values.unitPrice} onChange={(e) => set("unitPrice", Number(e.target.value))} />
        </FormField>
      </FormSection>

      <FormSection title="Requirements">
        <div className="mb-4">
          <FormField label="Storage Requirements (optional)">
            <input className={formInputClass} value={values.storageRequirements ?? ""} onChange={(e) => set("storageRequirements", e.target.value || undefined)} placeholder="e.g. Refrigerate 2-8°C" />
          </FormField>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.prescriptionRequired} onChange={(e) => set("prescriptionRequired", e.target.checked)} />
            Prescription Required
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input type="checkbox" className="accent-signal-indigo" checked={values.controlledSubstance} onChange={(e) => set("controlledSubstance", e.target.checked)} />
            Controlled Substance
          </label>
        </div>
      </FormSection>
    </Drawer>
  );
}
