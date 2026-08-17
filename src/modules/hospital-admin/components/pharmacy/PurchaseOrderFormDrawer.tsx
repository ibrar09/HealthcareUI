import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewPurchaseOrderInput, Medication, Supplier } from "@modules/hospital-admin/api";

function emptyValues(supplierId: string, medicationId: string): NewPurchaseOrderInput {
  return { supplierId, medicationId, quantity: 100, unitCost: 0 };
}

interface PurchaseOrderFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewPurchaseOrderInput) => void;
  medications: Medication[];
  suppliers: Supplier[];
}

/** Module-local — create a Purchase Order (spec §14): Low Stock → Reorder Level → Purchase Request → this. */
export function PurchaseOrderFormDrawer({ open, onClose, onSubmit, medications, suppliers }: PurchaseOrderFormDrawerProps) {
  const [values, setValues] = useState<NewPurchaseOrderInput>(emptyValues(suppliers[0]?.id ?? "", medications[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(suppliers[0]?.id ?? "", medications[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewPurchaseOrderInput>(key: K, value: NewPurchaseOrderInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Purchase Order"
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
            disabled={!values.supplierId || !values.medicationId || values.quantity <= 0}
          >
            Create Purchase Order
          </Button>
        </div>
      }
    >
      <FormSection title="Order">
        <div className="mb-4">
          <FormField label="Supplier">
            <select className={formInputClass} value={values.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Medication">
            <select className={formInputClass} value={values.medicationId} onChange={(e) => set("medicationId", e.target.value)}>
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.genericName} {m.strength}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quantity">
            <input type="number" min={1} className={formInputClass} value={values.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
          </FormField>
          <FormField label="Unit Cost ($)">
            <input type="number" min={0} step={0.01} className={formInputClass} value={values.unitCost} onChange={(e) => set("unitCost", Number(e.target.value))} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
