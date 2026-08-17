import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewLabTestCatalogInput, LabTestCategory, LabSpecimenType } from "@modules/hospital-admin/api";

const categories: LabTestCategory[] = ["hematology", "chemistry", "microbiology", "immunology", "pathology", "molecular", "urinalysis"];
const specimenTypes: LabSpecimenType[] = ["blood", "urine", "stool", "swab", "tissue", "sputum", "csf", "other"];

const emptyValues: NewLabTestCatalogInput = {
  code: "",
  name: "",
  category: "chemistry",
  specimenType: "blood",
  referenceRangeText: "",
  turnaroundTimeHours: 4,
};

interface LabTestCatalogFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewLabTestCatalogInput) => void;
  initialValues?: NewLabTestCatalogInput;
}

/** Module-local — add/edit a Lab Test Catalog entry (LOINC-style coded lookup, not a hardcoded list). */
export function LabTestCatalogFormDrawer({ open, onClose, onSubmit, initialValues }: LabTestCatalogFormDrawerProps) {
  const [values, setValues] = useState<NewLabTestCatalogInput>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof NewLabTestCatalogInput>(key: K, value: NewLabTestCatalogInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Test" : "Add Test"}
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
            disabled={!values.code.trim() || !values.name.trim() || !values.referenceRangeText.trim()}
          >
            {isEdit ? "Save Changes" : "Add Test"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Code">
            <input className={formInputClass} value={values.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. FERRITIN" disabled={isEdit} />
          </FormField>
          <FormField label="Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ferritin" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select className={formInputClass} value={values.category} onChange={(e) => set("category", e.target.value as LabTestCategory)}>
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Specimen Type">
            <select className={formInputClass} value={values.specimenType} onChange={(e) => set("specimenType", e.target.value as LabSpecimenType)}>
              {specimenTypes.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Reference Range">
        <div className="mb-4">
          <FormField label="Reference Range (display text)">
            <input className={formInputClass} value={values.referenceRangeText} onChange={(e) => set("referenceRangeText", e.target.value)} placeholder="e.g. 20–250 ng/mL" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Unit">
            <input className={formInputClass} value={values.unit ?? ""} onChange={(e) => set("unit", e.target.value || undefined)} placeholder="e.g. ng/mL" />
          </FormField>
          <FormField label="Turnaround Time (hours)">
            <input type="number" min={1} className={formInputClass} value={values.turnaroundTimeHours} onChange={(e) => set("turnaroundTimeHours", Math.max(1, Number(e.target.value) || 1))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Normal Low (optional)">
            <input type="number" step="any" className={formInputClass} value={values.refLow ?? ""} onChange={(e) => set("refLow", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="Normal High (optional)">
            <input type="number" step="any" className={formInputClass} value={values.refHigh ?? ""} onChange={(e) => set("refHigh", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Critical Low (optional)">
            <input type="number" step="any" className={formInputClass} value={values.criticalLow ?? ""} onChange={(e) => set("criticalLow", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
          <FormField label="Critical High (optional)">
            <input type="number" step="any" className={formInputClass} value={values.criticalHigh ?? ""} onChange={(e) => set("criticalHigh", e.target.value ? Number(e.target.value) : undefined)} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
