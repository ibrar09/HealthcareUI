import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewRadiologyRoomInput, RadiologyModality } from "@modules/hospital-admin/api";

export interface RoomFormValues extends NewRadiologyRoomInput {
  assignedStaffIds: string[];
}

function emptyValues(modalityId: string): RoomFormValues {
  return { number: "", location: "Radiology — Basement B1", modalityId, capacity: 1, operatingHours: "07:00–19:00", assignedStaffIds: [] };
}

interface RoomFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RoomFormValues) => void;
  initialValues?: RoomFormValues;
  modalities: RadiologyModality[];
  technologists: { id: string; name: string }[];
}

/** Module-local — add/edit a Room (spec §14), including its assigned technologist(s). */
export function RoomFormDrawer({ open, onClose, onSubmit, initialValues, modalities, technologists }: RoomFormDrawerProps) {
  const [values, setValues] = useState<RoomFormValues>(initialValues ?? emptyValues(modalities[0]?.id ?? ""));
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues(modalities[0]?.id ?? ""));
  }, [open, initialValues, modalities]);

  function set<K extends keyof RoomFormValues>(key: K, value: RoomFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleStaff(id: string) {
    setValues((v) => ({ ...v, assignedStaffIds: v.assignedStaffIds.includes(id) ? v.assignedStaffIds.filter((s) => s !== id) : [...v.assignedStaffIds, id] }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Room" : "Add Room"}
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
            disabled={!values.number.trim()}
          >
            {isEdit ? "Save Changes" : "Add Room"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Room Number">
            <input className={formInputClass} value={values.number} onChange={(e) => set("number", e.target.value)} placeholder="e.g. R-05" disabled={isEdit} />
          </FormField>
          <FormField label="Modality">
            <select className={formInputClass} value={values.modalityId} onChange={(e) => set("modalityId", e.target.value)}>
              {modalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Location">
          <input className={formInputClass} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Radiology — Basement B1" />
        </FormField>
      </FormSection>

      <FormSection title="Capacity & Hours">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Capacity">
            <input type="number" min={1} className={formInputClass} value={values.capacity} onChange={(e) => set("capacity", Math.max(1, Number(e.target.value) || 1))} />
          </FormField>
          <FormField label="Operating Hours">
            <input className={formInputClass} value={values.operatingHours} onChange={(e) => set("operatingHours", e.target.value)} placeholder="e.g. 07:00–19:00" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Assigned Staff">
        <div className="flex flex-col gap-2">
          {technologists.map((t) => (
            <label key={t.id} className="flex items-center gap-3 rounded-input border border-line px-3.5 py-2.5 cursor-pointer hover:bg-surface-container-low transition-all">
              <input type="checkbox" className="accent-signal-indigo" checked={values.assignedStaffIds.includes(t.id)} onChange={() => toggleStaff(t.id)} />
              <span className="text-sm font-medium text-on-surface">{t.name}</span>
            </label>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
