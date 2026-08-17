import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { payerTypeLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import type { NewPayerInput, PayerType } from "@modules/hospital-admin/api";

const typeOptions = Object.keys(payerTypeLabel) as PayerType[];
const emptyValues: NewPayerInput = { name: "", type: "insurance-company", contactPhone: "", contactEmail: "" };

interface PayerFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewPayerInput) => void;
  initialValues?: NewPayerInput;
}

/** Module-local — Payer registry (spec §10): add/edit an insurance company, government payer, employer/corporate plan, or TPA. */
export function PayerFormDrawer({ open, onClose, onSubmit, initialValues }: PayerFormDrawerProps) {
  const [values, setValues] = useState<NewPayerInput>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof NewPayerInput>(key: K, value: NewPayerInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Payer" : "Add Payer"}
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
            disabled={!values.name.trim()}
          >
            {isEdit ? "Save Changes" : "Add Payer"}
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Payer Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. National Health Insurance Co." />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Payer Type">
            <select className={formInputClass} value={values.type} onChange={(e) => set("type", e.target.value as PayerType)}>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {payerTypeLabel[t]}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Contact Phone (optional)">
            <input className={formInputClass} value={values.contactPhone ?? ""} onChange={(e) => set("contactPhone", e.target.value)} />
          </FormField>
          <FormField label="Contact Email (optional)">
            <input className={formInputClass} value={values.contactEmail ?? ""} onChange={(e) => set("contactEmail", e.target.value)} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
