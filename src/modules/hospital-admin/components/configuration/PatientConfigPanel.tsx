import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { PatientConfiguration } from "@modules/hospital-admin/api";

interface PatientConfigPanelProps {
  config: PatientConfiguration | null;
  preview: string;
  onSave: (values: Partial<PatientConfiguration>) => void;
}

/** Module-local — Patient Configuration (spec §6): MRN format, identification, registration requirements. */
export function PatientConfigPanel({ config, preview, onSave }: PatientConfigPanelProps) {
  const [values, setValues] = useState<Partial<PatientConfiguration>>({});
  if (!config) return null;
  const current = { ...config, ...values };

  function set<K extends keyof PatientConfiguration>(key: K, value: PatientConfiguration[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <FormSection title="Patient Identification">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField label="MRN Prefix">
              <input className={formInputClass} value={current.mrnPrefix} onChange={(e) => set("mrnPrefix", e.target.value)} />
            </FormField>
            <FormField label="MRN Starting Number">
              <input type="number" className={formInputClass} value={current.mrnStartingNumber} onChange={(e) => set("mrnStartingNumber", Number(e.target.value))} />
            </FormField>
            <FormField label="MRN Format">
              <input className={formInputClass} value={current.mrnFormat} onChange={(e) => set("mrnFormat", e.target.value)} placeholder="MRN-{YYYY}-{######}" />
            </FormField>
          </div>
          <p className="text-xs text-on-surface-variant">Preview: <span className="font-mono font-bold text-on-surface">{preview}</span></p>
        </FormSection>

        <FormSection title="Registration Rules">
          <ConfigToggleRow label="National ID Required" checked={current.nationalIdRequired} onChange={(v) => set("nationalIdRequired", v)} />
          <ConfigToggleRow label="Passport Support" checked={current.passportSupported} onChange={(v) => set("passportSupported", v)} />
          <ConfigToggleRow label="Temporary Patient ID" description="Allow registration before full identification is available" checked={current.temporaryPatientIdEnabled} onChange={(v) => set("temporaryPatientIdEnabled", v)} />
          <ConfigToggleRow label="Duplicate Detection" checked={current.duplicateDetectionEnabled} onChange={(v) => set("duplicateDetectionEnabled", v)} />
          <ConfigToggleRow label="Guardian Required for Minors" checked={current.minorGuardianRequired} onChange={(v) => set("minorGuardianRequired", v)} />
          <ConfigToggleRow label="Emergency Registration Allowed" description="Register with minimal information during an emergency" checked={current.emergencyRegistrationAllowed} onChange={(v) => set("emergencyRegistrationAllowed", v)} />
        </FormSection>

        <FormSection title="Required Fields">
          <p className="text-sm text-on-surface">{current.requiredFields.join(", ")}</p>
        </FormSection>

        <Button size="sm" onClick={() => onSave(values)} disabled={Object.keys(values).length === 0}>Save Changes</Button>
      </Card>
    </div>
  );
}
