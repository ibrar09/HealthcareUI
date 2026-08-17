import { useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewFacilityIncidentInput, FacilityIncidentCategory, FacilityIncidentSeverity } from "@modules/hospital-admin/api";

interface NewIncidentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewFacilityIncidentInput) => void;
  facilityOptions: { id: string; name: string }[];
}

const categories: FacilityIncidentCategory[] = ["water-leak", "power-outage", "fire-alarm", "elevator-failure", "hvac-failure", "security", "medical-gas-failure", "structural", "flooding", "equipment-failure"];
const severities: FacilityIncidentSeverity[] = ["critical", "high", "medium", "low"];

const empty: NewFacilityIncidentInput = { facilityId: "", location: "", category: "equipment-failure", severity: "medium", description: "" };

/** Module-local — Facility Incidents (spec §42): something that actually happened, distinct from a routine maintenance request. */
export function NewIncidentDrawer({ open, onClose, onSubmit, facilityOptions }: NewIncidentDrawerProps) {
  const [values, setValues] = useState<NewFacilityIncidentInput>(empty);

  function set<K extends keyof NewFacilityIncidentInput>(key: K, value: NewFacilityIncidentInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Report an Incident"
      subtitle="For something that actually happened — not a routine maintenance request."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); setValues(empty); onClose(); }} disabled={!values.facilityId || !values.location.trim() || !values.description.trim()}>
            Report Incident
          </Button>
        </div>
      }
    >
      <FormSection title="Location">
        <div className="mb-4">
          <FormField label="Facility">
            <select className={formInputClass} value={values.facilityId} onChange={(e) => set("facilityId", e.target.value)}>
              <option value="">Select facility…</option>
              {facilityOptions.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Specific Location">
          <input className={formInputClass} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Main Building, East Wing" />
        </FormField>
      </FormSection>

      <FormSection title="Incident">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select className={formInputClass} value={values.category} onChange={(e) => set("category", e.target.value as FacilityIncidentCategory)}>
              {categories.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
            </select>
          </FormField>
          <FormField label="Severity">
            <select className={formInputClass} value={values.severity} onChange={(e) => set("severity", e.target.value as FacilityIncidentSeverity)}>
              {severities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Description">
          <textarea rows={3} className={`${formInputClass} resize-none`} value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="What happened..." />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
