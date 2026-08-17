import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewProtocolInput, ImagingProcedure } from "@modules/hospital-admin/api";

function emptyValues(procedureCode: string): NewProtocolInput {
  return { procedureCode, name: "", description: "" };
}

interface ProtocolFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewProtocolInput) => void;
  procedures: ImagingProcedure[];
}

/** Module-local — add a Protocol option under a Procedure (spec §27). Protocols are simple named sub-options (e.g. "With Contrast"); clinical protocol content itself is authored by radiology staff, not here. */
export function ProtocolFormDrawer({ open, onClose, onSubmit, procedures }: ProtocolFormDrawerProps) {
  const [values, setValues] = useState<NewProtocolInput>(emptyValues(procedures[0]?.code ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(procedures[0]?.code ?? ""));
  }, [open, procedures]);

  function set<K extends keyof NewProtocolInput>(key: K, value: NewProtocolInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Protocol"
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
            disabled={!values.name.trim() || !values.procedureCode}
          >
            Add Protocol
          </Button>
        </div>
      }
    >
      <FormSection title="Protocol">
        <div className="mb-4">
          <FormField label="Procedure">
            <select className={formInputClass} value={values.procedureCode} onChange={(e) => set("procedureCode", e.target.value)}>
              {procedures.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Protocol Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. With Contrast" />
          </FormField>
        </div>
        <FormField label="Description (optional)">
          <input className={formInputClass} value={values.description ?? ""} onChange={(e) => set("description", e.target.value || undefined)} placeholder="e.g. IV contrast-enhanced acquisition" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
