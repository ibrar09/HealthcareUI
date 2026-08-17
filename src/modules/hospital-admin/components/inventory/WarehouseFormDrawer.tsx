import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewWarehouseInput, WarehouseType } from "@modules/hospital-admin/api";

const types: WarehouseType[] = ["central", "pharmacy-store", "emergency-store", "icu-store", "ot-store", "laboratory-store", "ward-store"];

function emptyValues(): NewWarehouseInput {
  return { name: "", type: "central" };
}

interface WarehouseFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewWarehouseInput) => void;
}

/** Module-local — add a Warehouse/Store (spec §10). */
export function WarehouseFormDrawer({ open, onClose, onSubmit }: WarehouseFormDrawerProps) {
  const [values, setValues] = useState<NewWarehouseInput>(emptyValues());

  useEffect(() => {
    if (open) setValues(emptyValues());
  }, [open]);

  function set<K extends keyof NewWarehouseInput>(key: K, value: NewWarehouseInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Warehouse"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!values.name.trim()}>Add Warehouse</Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="mb-4">
          <FormField label="Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ICU Store" />
          </FormField>
        </div>
        <FormField label="Type">
          <select className={formInputClass} value={values.type} onChange={(e) => set("type", e.target.value as WarehouseType)}>
            {types.map((t) => (
              <option key={t} value={t}>{t.replace(/-/g, " ")}</option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Location">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Building">
            <input className={formInputClass} value={values.building ?? ""} onChange={(e) => set("building", e.target.value || undefined)} />
          </FormField>
          <FormField label="Floor">
            <input className={formInputClass} value={values.floor ?? ""} onChange={(e) => set("floor", e.target.value || undefined)} />
          </FormField>
          <FormField label="Room">
            <input className={formInputClass} value={values.room ?? ""} onChange={(e) => set("room", e.target.value || undefined)} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
