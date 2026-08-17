import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

export interface ScheduleFormValues {
  practitionerId: string;
  facilityId: string;
  departmentId?: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean;
}

const emptyValues: ScheduleFormValues = {
  practitionerId: "",
  facilityId: "",
  departmentId: undefined,
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
  active: true,
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ScheduleFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => void;
  initialValues?: ScheduleFormValues;
  practitionerOptions: { id: string; name: string }[];
  facilityOptions: { id: string; name: string }[];
  departmentOptions: { id: string; name: string }[];
}

/** Module-local — Add/Edit Doctor Schedule (spec §10). */
export function ScheduleFormDrawer({ open, onClose, onSubmit, initialValues, practitionerOptions, facilityOptions, departmentOptions }: ScheduleFormDrawerProps) {
  const [values, setValues] = useState<ScheduleFormValues>(initialValues ?? emptyValues);
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues);
  }, [open, initialValues]);

  function set<K extends keyof ScheduleFormValues>(key: K, value: ScheduleFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleDay(day: string) {
    setValues((v) => ({
      ...v,
      workingDays: v.workingDays.includes(day) ? v.workingDays.filter((d) => d !== day) : [...v.workingDays, day],
    }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Doctor Schedule" : "Add Doctor Schedule"}
      subtitle="The working pattern a doctor's Calendar and bookable slots are computed from."
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
            disabled={!values.practitionerId || !values.facilityId || values.workingDays.length === 0}
          >
            {isEdit ? "Save Changes" : "Add Schedule"}
          </Button>
        </div>
      }
    >
      <FormSection title="Doctor">
        <FormField label="Practitioner">
          <select className={formInputClass} value={values.practitionerId} onChange={(e) => set("practitionerId", e.target.value)} disabled={isEdit}>
            <option value="" disabled>
              Select a doctor
            </option>
            {practitionerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Location">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Facility">
            <select className={formInputClass} value={values.facilityId} onChange={(e) => set("facilityId", e.target.value)}>
              <option value="" disabled>
                Select a facility
              </option>
              {facilityOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Department">
            <select className={formInputClass} value={values.departmentId ?? ""} onChange={(e) => set("departmentId", e.target.value || undefined)}>
              <option value="">No department</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Working Pattern">
        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Working Days</span>
        <div className="mb-4 flex flex-wrap gap-2">
          {weekDays.map((day) => {
            const active = values.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active ? "border-vital-green bg-vital-green/10 text-vital-green" : "border-line text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {active && <Check size={11} />}
                {day}
              </button>
            );
          })}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Start Time">
            <input type="time" className={formInputClass} value={values.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </FormField>
          <FormField label="End Time">
            <input type="time" className={formInputClass} value={values.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </FormField>
        </div>

        <FormField label="Slot Duration (minutes)">
          <input
            type="number"
            min={5}
            step={5}
            className={formInputClass}
            value={values.slotDurationMinutes}
            onChange={(e) => set("slotDurationMinutes", Number(e.target.value))}
          />
        </FormField>
      </FormSection>

      <FormSection title="Status">
        <div className="flex gap-2">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => set("active", v)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                values.active === v
                  ? v
                    ? "border-vital-green bg-vital-green/10 text-vital-green"
                    : "border-outline bg-surface-container-low text-on-surface-variant"
                  : "border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {v ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
