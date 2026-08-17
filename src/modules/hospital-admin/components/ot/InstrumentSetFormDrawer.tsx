import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewInstrumentSetInput, SterilizationStatus } from "@modules/hospital-admin/api";

const sterilizationStatuses: SterilizationStatus[] = ["sterile", "non-sterile", "in-process"];

function emptyValues(): NewInstrumentSetInput {
  return { setId: "", name: "", sterilizationStatus: "sterile", sterilizationExpiry: "", location: "" };
}

interface InstrumentSetFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewInstrumentSetInput) => void;
  initialValues?: NewInstrumentSetInput;
}

/** Module-local — add/edit an Instrument Set (spec §22). */
export function InstrumentSetFormDrawer({ open, onClose, onSubmit, initialValues }: InstrumentSetFormDrawerProps) {
  const [values, setValues] = useState<NewInstrumentSetInput>(initialValues ?? emptyValues());
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues());
  }, [open, initialValues]);

  function set<K extends keyof NewInstrumentSetInput>(key: K, value: NewInstrumentSetInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Instrument Set" : "Add Instrument Set"}
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
            disabled={!values.setId.trim() || !values.name.trim()}
          >
            {isEdit ? "Save Changes" : "Add Set"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Set ID">
            <input className={formInputClass} value={values.setId} onChange={(e) => set("setId", e.target.value)} placeholder="e.g. SET-007" disabled={isEdit} />
          </FormField>
          <FormField label="Set Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Neuro Set" />
          </FormField>
        </div>
        <FormField label="Location">
          <input className={formInputClass} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. CSSD" />
        </FormField>
      </FormSection>

      <FormSection title="Sterilization">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sterilization Status">
            <select className={formInputClass} value={values.sterilizationStatus} onChange={(e) => set("sterilizationStatus", e.target.value as SterilizationStatus)}>
              {sterilizationStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace("-", " ")}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Valid Until">
            <input type="date" className={formInputClass} value={values.sterilizationExpiry} onChange={(e) => set("sterilizationExpiry", e.target.value)} />
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
