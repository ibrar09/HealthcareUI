import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewInventorySupplierInput } from "@modules/hospital-admin/api";

function emptyValues(): NewInventorySupplierInput {
  return { name: "", contactName: "", email: "", phone: "", address: "", productsSupplied: [], paymentTerms: "Net 30" };
}

interface SupplierFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewInventorySupplierInput) => void;
}

/** Module-local — add a Supplier (spec §22). */
export function SupplierFormDrawer({ open, onClose, onSubmit }: SupplierFormDrawerProps) {
  const [values, setValues] = useState<NewInventorySupplierInput>(emptyValues());
  const [productsText, setProductsText] = useState("");

  useEffect(() => {
    if (open) {
      setValues(emptyValues());
      setProductsText("");
    }
  }, [open]);

  function set<K extends keyof NewInventorySupplierInput>(key: K, value: NewInventorySupplierInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Supplier"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmit({ ...values, productsSupplied: productsText.split(",").map((p) => p.trim()).filter(Boolean) });
              onClose();
            }}
            disabled={!values.name.trim() || !values.contactName.trim()}
          >
            Add Supplier
          </Button>
        </div>
      }
    >
      <FormSection title="Company">
        <div className="mb-4">
          <FormField label="Supplier Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. MedSurge Distributors" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contact Name">
            <input className={formInputClass} value={values.contactName} onChange={(e) => set("contactName", e.target.value)} />
          </FormField>
          <FormField label="Payment Terms">
            <input className={formInputClass} value={values.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="e.g. Net 30" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Contact">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Email">
            <input type="email" className={formInputClass} value={values.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <input className={formInputClass} value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Address">
          <input className={formInputClass} value={values.address} onChange={(e) => set("address", e.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title="Products Supplied">
        <FormField label="Categories (comma-separated)">
          <input className={formInputClass} value={productsText} onChange={(e) => setProductsText(e.target.value)} placeholder="e.g. Surgical, PPE, Laboratory" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
