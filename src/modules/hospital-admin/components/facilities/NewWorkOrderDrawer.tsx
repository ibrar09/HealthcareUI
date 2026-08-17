import { useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewFacilityWorkOrderInput, FacilityMaintenanceCategory, FacilityMaintenancePriority } from "@modules/hospital-admin/api";

interface NewWorkOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewFacilityWorkOrderInput) => void;
  facilityOptions: { id: string; name: string }[];
  departmentOptions: { id: string; name: string }[];
}

const categories: FacilityMaintenanceCategory[] = ["electrical", "plumbing", "hvac", "civil", "structural", "medical-gas", "fire-safety", "elevator", "generator", "it-infrastructure", "biomedical-equipment", "security-systems", "other"];
const priorities: FacilityMaintenancePriority[] = ["critical", "high", "medium", "low"];

const empty: NewFacilityWorkOrderInput = { facilityId: "", location: "", category: "other", priority: "medium", problem: "" };

/** Module-local — Maintenance Request (spec §20): staff report a facility problem, which becomes a real Work Order on submit (one ticket, not two systems). */
export function NewWorkOrderDrawer({ open, onClose, onSubmit, facilityOptions, departmentOptions }: NewWorkOrderDrawerProps) {
  const [values, setValues] = useState<NewFacilityWorkOrderInput>(empty);

  function set<K extends keyof NewFacilityWorkOrderInput>(key: K, value: NewFacilityWorkOrderInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Report a Facility Problem"
      subtitle="Submitted requests are tracked as a Work Order through resolution."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => { onSubmit(values); setValues(empty); onClose(); }}
            disabled={!values.facilityId || !values.location.trim() || !values.problem.trim()}
          >
            Submit
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
        <div className="mb-4">
          <FormField label="Department (optional)">
            <select className={formInputClass} value={values.departmentId ?? ""} onChange={(e) => set("departmentId", e.target.value || undefined)}>
              <option value="">None</option>
              {departmentOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Specific Location">
          <input className={formInputClass} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Building A, Floor 2, Room 204" />
        </FormField>
      </FormSection>

      <FormSection title="Problem">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Category">
            <select className={formInputClass} value={values.category} onChange={(e) => set("category", e.target.value as FacilityMaintenanceCategory)}>
              {categories.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className={formInputClass} value={values.priority} onChange={(e) => set("priority", e.target.value as FacilityMaintenancePriority)}>
              {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Problem Summary">
            <input className={formInputClass} value={values.problem} onChange={(e) => set("problem", e.target.value)} placeholder="e.g. Room temperature too high" />
          </FormField>
        </div>
        <FormField label="Description (optional)">
          <textarea rows={3} className={`${formInputClass} resize-none`} value={values.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Additional detail..." />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
