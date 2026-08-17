import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewImagingProcedureInput, ModalityType } from "@modules/hospital-admin/api";

const modalityTypes: ModalityType[] = ["ct", "mri", "xr", "us", "mammography", "fluoroscopy", "pet", "spect", "dexa"];

function emptyValues(): NewImagingProcedureInput {
  return { code: "", name: "", modality: "ct", bodySite: "", durationMinutes: 15, contrastRequired: false, price: 0 };
}

interface ProcedureFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewImagingProcedureInput) => void;
  initialValues?: NewImagingProcedureInput;
}

/** Module-local — add/edit an imaging Procedure (spec §26): coded catalog entry, not free text. */
export function ProcedureFormDrawer({ open, onClose, onSubmit, initialValues }: ProcedureFormDrawerProps) {
  const [values, setValues] = useState<NewImagingProcedureInput>(initialValues ?? emptyValues());
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues());
  }, [open, initialValues]);

  function set<K extends keyof NewImagingProcedureInput>(key: K, value: NewImagingProcedureInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Procedure" : "Add Procedure"}
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
            disabled={!values.code.trim() || !values.name.trim() || !values.bodySite.trim()}
          >
            {isEdit ? "Save Changes" : "Add Procedure"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Code">
            <input className={formInputClass} value={values.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. CT-PELVIS" disabled={isEdit} />
          </FormField>
          <FormField label="Modality">
            <select className={formInputClass} value={values.modality} onChange={(e) => set("modality", e.target.value as ModalityType)}>
              {modalityTypes.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. CT Pelvis" />
          </FormField>
          <FormField label="Body Site">
            <input className={formInputClass} value={values.bodySite} onChange={(e) => set("bodySite", e.target.value)} placeholder="e.g. Pelvis" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Clinical & Billing">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Duration (minutes)">
            <input type="number" min={1} className={formInputClass} value={values.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} />
          </FormField>
          <FormField label="Price ($)">
            <input type="number" min={0} className={formInputClass} value={values.price} onChange={(e) => set("price", Number(e.target.value))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Billing Code (optional)">
            <input className={formInputClass} value={values.billingCode ?? ""} onChange={(e) => set("billingCode", e.target.value || undefined)} placeholder="e.g. RAD-010" />
          </FormField>
          <FormField label="Contrast Required">
            <select className={formInputClass} value={values.contrastRequired ? "yes" : "no"} onChange={(e) => set("contrastRequired", e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </FormField>
        </div>
        <FormField label="Preparation Instructions (optional)">
          <input className={formInputClass} value={values.preparation ?? ""} onChange={(e) => set("preparation", e.target.value || undefined)} placeholder="e.g. Fasting 4 hours" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
