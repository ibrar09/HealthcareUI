import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewOTRoomInput } from "@modules/hospital-admin/api";

function emptyValues(): NewOTRoomInput {
  return { number: "", type: "General Surgery", location: "", equipment: [] };
}

interface OTRoomFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewOTRoomInput) => void;
  initialValues?: NewOTRoomInput;
}

/** Module-local — add/edit an OT Room (spec §28). */
export function OTRoomFormDrawer({ open, onClose, onSubmit, initialValues }: OTRoomFormDrawerProps) {
  const [values, setValues] = useState<NewOTRoomInput>(initialValues ?? emptyValues());
  const [equipmentText, setEquipmentText] = useState((initialValues?.equipment ?? []).join(", "));
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyValues());
      setEquipmentText((initialValues?.equipment ?? []).join(", "));
    }
  }, [open, initialValues]);

  function set<K extends keyof NewOTRoomInput>(key: K, value: NewOTRoomInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit OT Room" : "Add OT Room"}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit({
                ...values,
                equipment: equipmentText
                  .split(",")
                  .map((e) => e.trim())
                  .filter(Boolean),
              });
              onClose();
            }}
            disabled={!values.number.trim() || !values.type.trim()}
          >
            {isEdit ? "Save Changes" : "Add Room"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Room Number">
            <input className={formInputClass} value={values.number} onChange={(e) => set("number", e.target.value)} placeholder="e.g. OT-06" disabled={isEdit} />
          </FormField>
          <FormField label="Room Type">
            <input className={formInputClass} value={values.type} onChange={(e) => set("type", e.target.value)} placeholder="e.g. General Surgery" />
          </FormField>
        </div>
        <FormField label="Location">
          <input className={formInputClass} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. 3rd Floor, East Wing" />
        </FormField>
      </FormSection>

      <FormSection title="Equipment & Maintenance">
        <div className="mb-4">
          <FormField label="Equipment (comma-separated)">
            <input className={formInputClass} value={equipmentText} onChange={(e) => setEquipmentText(e.target.value)} placeholder="e.g. Anesthesia Workstation, Electrocautery" />
          </FormField>
        </div>
        <FormField label="Next Maintenance">
          <input type="date" className={formInputClass} value={values.maintenanceSchedule ?? ""} onChange={(e) => set("maintenanceSchedule", e.target.value || undefined)} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
