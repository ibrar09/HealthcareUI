import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { ChipSelect, FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewRoomInput, RoomType, GenderRestriction } from "@modules/hospital-admin/api";

const roomTypeOptions: { value: RoomType; label: string }[] = [
  { value: "general", label: "General" },
  { value: "semi-private", label: "Semi-Private" },
  { value: "private", label: "Private" },
  { value: "isolation", label: "Isolation" },
];

const genderOptions: { value: GenderRestriction; label: string }[] = [
  { value: "any", label: "Mixed" },
  { value: "male", label: "Male only" },
  { value: "female", label: "Female only" },
];

interface RoomFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewRoomInput) => void;
  initialValues?: NewRoomInput;
  wardOptions: { id: string; name: string }[];
  fixedWardId?: string;
}

function emptyValues(fixedWardId?: string): NewRoomInput {
  return { wardId: fixedWardId ?? "", name: "", type: "general", capacity: 1, genderRestriction: "any", isolationCapable: false, status: "active" };
}

/** Module-local — Bed Management Phase 4 config screen (spec §6, §27): add/edit a Room. */
export function RoomFormDrawer({ open, onClose, onSubmit, initialValues, wardOptions, fixedWardId }: RoomFormDrawerProps) {
  const [values, setValues] = useState<NewRoomInput>(initialValues ?? emptyValues(fixedWardId));
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues(fixedWardId));
  }, [open, initialValues, fixedWardId]);

  function set<K extends keyof NewRoomInput>(key: K, value: NewRoomInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Room" : "Add Room"}
      subtitle="Room configuration — capacity, restrictions, and isolation capability."
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
            disabled={!values.name.trim() || !values.wardId || values.capacity < 1}
          >
            {isEdit ? "Save Changes" : "Add Room"}
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Room Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Room 305" />
          </FormField>
          <FormField label="Capacity">
            <input
              type="number"
              min={1}
              className={formInputClass}
              value={values.capacity}
              onChange={(e) => set("capacity", Math.max(1, Number(e.target.value) || 1))}
            />
          </FormField>
        </div>
        {!fixedWardId && (
          <FormField label="Ward">
            <select className={formInputClass} value={values.wardId} onChange={(e) => set("wardId", e.target.value)}>
              <option value="" disabled>
                Select a ward
              </option>
              {wardOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </FormSection>

      <FormSection title="Room Type">
        <ChipSelect value={values.type} onChange={(v) => set("type", v)} options={roomTypeOptions} columns={4} />
      </FormSection>

      <FormSection title="Gender Restriction">
        <ChipSelect value={values.genderRestriction} onChange={(v) => set("genderRestriction", v)} options={genderOptions} columns={3} />
      </FormSection>

      <FormSection title="Isolation Capable">
        <div className="flex gap-2">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((o) => (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => set("isolationCapable", o.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                values.isolationCapable === o.value ? "border-sunset-coral bg-sunset-coral/10 text-sunset-coral" : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Status">
        <div className="flex gap-2">
          {(["active", "closed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                values.status === s
                  ? s === "active"
                    ? "border-vital-green bg-vital-green/10 text-vital-green"
                    : "border-outline bg-surface-container-low text-on-surface-variant"
                  : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "active" ? "Active" : "Closed"}
            </button>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
