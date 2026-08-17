import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewStorageLocationInput, Warehouse } from "@modules/hospital-admin/api";

function emptyValues(warehouseId: string): NewStorageLocationInput {
  return { warehouseId };
}

interface StorageLocationFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewStorageLocationInput) => void;
  warehouses: Warehouse[];
}

/** Module-local — add a Storage Location: Warehouse -> Aisle -> Rack -> Shelf -> Bin (spec §11). */
export function StorageLocationFormDrawer({ open, onClose, onSubmit, warehouses }: StorageLocationFormDrawerProps) {
  const [values, setValues] = useState<NewStorageLocationInput>(emptyValues(warehouses[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(warehouses[0]?.id ?? ""));
  }, [open, warehouses]);

  function set<K extends keyof NewStorageLocationInput>(key: K, value: NewStorageLocationInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Storage Location"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!values.warehouseId}>Add Location</Button>
        </div>
      }
    >
      <FormSection title="Placement">
        <div className="mb-4">
          <FormField label="Warehouse">
            <select className={formInputClass} value={values.warehouseId} onChange={(e) => set("warehouseId", e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Aisle">
            <input className={formInputClass} value={values.aisle ?? ""} onChange={(e) => set("aisle", e.target.value || undefined)} placeholder="e.g. A4" />
          </FormField>
          <FormField label="Rack">
            <input className={formInputClass} value={values.rack ?? ""} onChange={(e) => set("rack", e.target.value || undefined)} placeholder="e.g. R2" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Shelf">
            <input className={formInputClass} value={values.shelf ?? ""} onChange={(e) => set("shelf", e.target.value || undefined)} placeholder="e.g. S1" />
          </FormField>
          <FormField label="Bin">
            <input className={formInputClass} value={values.bin ?? ""} onChange={(e) => set("bin", e.target.value || undefined)} placeholder="e.g. B1" />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
