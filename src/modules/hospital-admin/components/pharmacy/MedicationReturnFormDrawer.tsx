import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewMedicationReturnInput, Medication, ReturnSource, ReturnCondition } from "@modules/hospital-admin/api";

const sources: ReturnSource[] = ["patient", "ward", "pharmacy", "supplier"];
const conditions: ReturnCondition[] = ["sealed-unused", "opened-unused", "damaged", "suspected-contaminated"];

function emptyValues(medicationId: string): NewMedicationReturnInput {
  return { medicationId, quantity: 1, source: "patient", reason: "", condition: "sealed-unused" };
}

interface MedicationReturnFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewMedicationReturnInput) => void;
  medications: Medication[];
}

/** Module-local — record a Medication Return (spec §22). */
export function MedicationReturnFormDrawer({ open, onClose, onSubmit, medications }: MedicationReturnFormDrawerProps) {
  const [values, setValues] = useState<NewMedicationReturnInput>(emptyValues(medications[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(medications[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewMedicationReturnInput>(key: K, value: NewMedicationReturnInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Record Return"
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
            disabled={!values.medicationId || values.quantity <= 0 || !values.reason.trim()}
          >
            Record Return
          </Button>
        </div>
      }
    >
      <FormSection title="Return">
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Quantity">
            <input type="number" min={1} className={formInputClass} value={values.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
          </FormField>
          <FormField label="Source">
            <select className={formInputClass} value={values.source} onChange={(e) => set("source", e.target.value as ReturnSource)}>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Condition">
            <select className={formInputClass} value={values.condition} onChange={(e) => set("condition", e.target.value as ReturnCondition)}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c.replace("-", " ")}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={3} value={values.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. Patient reported adverse reaction" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
