import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewBedTypeInput } from "@modules/hospital-admin/api";

const colorOptions = [
  { value: "var(--signal-indigo)", label: "Indigo" },
  { value: "var(--pulse-coral)", label: "Coral" },
  { value: "var(--sunset-coral)", label: "Sunset" },
  { value: "var(--caution-amber)", label: "Amber" },
  { value: "var(--vital-green)", label: "Green" },
  { value: "var(--module-radiology)", label: "Violet" },
  { value: "var(--outline)", label: "Neutral" },
];

const emptyValues: NewBedTypeInput = { name: "", description: "", accentColor: colorOptions[0].value };

interface BedTypeFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewBedTypeInput) => void;
  initialValues?: NewBedTypeInput;
}

/** Module-local — Bed Management Phase 4 config screen (spec §5, §26): add/edit a Bed Type lookup entry. */
export function BedTypeFormDrawer({ open, onClose, onSubmit, initialValues }: BedTypeFormDrawerProps) {
  const [values, setValues] = useState<NewBedTypeInput>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof NewBedTypeInput>(key: K, value: NewBedTypeInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Bed Type" : "Add Bed Type"}
      subtitle="Bed types are a configurable lookup, not fixed in the app."
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
            {isEdit ? "Save Changes" : "Add Bed Type"}
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Pediatric ICU" />
          </FormField>
        </div>
        <FormField label="Description (optional)">
          <input
            className={formInputClass}
            value={values.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="e.g. Continuous monitoring for pediatric patients"
          />
        </FormField>
      </FormSection>

      <FormSection title="Accent Color">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => set("accentColor", c.value)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                values.accentColor === c.value ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.value }} />
              {c.label}
            </button>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
