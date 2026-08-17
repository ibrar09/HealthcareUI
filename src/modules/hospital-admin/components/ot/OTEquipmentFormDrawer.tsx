import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewOTEquipmentInput, OTRoom } from "@modules/hospital-admin/api";

function emptyValues(): NewOTEquipmentInput {
  return { name: "", roomId: undefined, nextServiceDate: "" };
}

interface OTEquipmentFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewOTEquipmentInput) => void;
  rooms: OTRoom[];
}

/** Module-local — add OT Equipment (spec §28). */
export function OTEquipmentFormDrawer({ open, onClose, onSubmit, rooms }: OTEquipmentFormDrawerProps) {
  const [values, setValues] = useState<NewOTEquipmentInput>(emptyValues());

  useEffect(() => {
    if (open) setValues(emptyValues());
  }, [open]);

  function set<K extends keyof NewOTEquipmentInput>(key: K, value: NewOTEquipmentInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Equipment"
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
            Add Equipment
          </Button>
        </div>
      }
    >
      <FormSection title="Equipment">
        <div className="mb-4">
          <FormField label="Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ultrasound Machine" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Room (optional)">
            <select className={formInputClass} value={values.roomId ?? ""} onChange={(e) => set("roomId", e.target.value || undefined)}>
              <option value="">Unassigned</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Next Service Date">
            <input type="date" className={formInputClass} value={values.nextServiceDate ?? ""} onChange={(e) => set("nextServiceDate", e.target.value || undefined)} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
