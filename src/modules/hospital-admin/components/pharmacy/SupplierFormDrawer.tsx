import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewSupplierInput } from "@modules/hospital-admin/api";

function emptyValues(): NewSupplierInput {
  return { name: "", licenseNumber: "", contactName: "", phone: "", email: "", address: "", paymentTerms: "Net 30" };
}

interface SupplierFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewSupplierInput) => void;
}

/** Module-local — add a Supplier (spec §15). */
export function SupplierFormDrawer({ open, onClose, onSubmit }: SupplierFormDrawerProps) {
  const [values, setValues] = useState<NewSupplierInput>(emptyValues());

  useEffect(() => {
    if (open) setValues(emptyValues());
  }, [open]);

  function set<K extends keyof NewSupplierInput>(key: K, value: NewSupplierInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Supplier"
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
            disabled={!values.name.trim() || !values.contactName.trim()}
          >
            Add Supplier
          </Button>
        </div>
      }
    >
      <FormSection title="Supplier">
        <div className="mb-4">
          <FormField label="Company Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. MedSource Distributors" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="License Number (optional)">
            <input className={formInputClass} value={values.licenseNumber ?? ""} onChange={(e) => set("licenseNumber", e.target.value || undefined)} placeholder="e.g. SUP-LIC-2204" />
          </FormField>
          <FormField label="Contact Name">
            <input className={formInputClass} value={values.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="e.g. Farhan Iqbal" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Phone">
            <input className={formInputClass} value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. +1 (555) 300-1004" />
          </FormField>
          <FormField label="Email">
            <input className={formInputClass} value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="e.g. orders@supplier.example" />
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Address">
            <input className={formInputClass} value={values.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 10 Main St, Lahore" />
          </FormField>
        </div>
        <FormField label="Payment Terms">
          <input className={formInputClass} value={values.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="e.g. Net 30" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
