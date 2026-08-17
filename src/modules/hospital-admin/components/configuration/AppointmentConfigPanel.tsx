import { useState } from "react";
import { Card, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import type { AppointmentConfiguration } from "@modules/hospital-admin/api";

interface AppointmentConfigPanelProps {
  config: AppointmentConfiguration | null;
  onSave: (values: Partial<AppointmentConfiguration>) => void;
}

/** Module-local — Appointment Configuration (spec §7): scheduling rules. Appointment Types themselves stay owned by the Appointments module's own Schedules tab. */
export function AppointmentConfigPanel({ config, onSave }: AppointmentConfigPanelProps) {
  const [values, setValues] = useState<Partial<AppointmentConfiguration>>({});
  if (!config) return null;
  const current = { ...config, ...values };

  function set<K extends keyof AppointmentConfiguration>(key: K, value: AppointmentConfiguration[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <FormSection title="Scheduling">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Default Consultation (min)">
              <input type="number" className={formInputClass} value={current.defaultConsultationMinutes} onChange={(e) => set("defaultConsultationMinutes", Number(e.target.value))} />
            </FormField>
            <FormField label="Slot Interval (min)">
              <input type="number" className={formInputClass} value={current.slotIntervalMinutes} onChange={(e) => set("slotIntervalMinutes", Number(e.target.value))} />
            </FormField>
            <FormField label="Max Appointments / Doctor / Day">
              <input type="number" className={formInputClass} value={current.maxAppointmentsPerDoctorPerDay} onChange={(e) => set("maxAppointmentsPerDoctorPerDay", Number(e.target.value))} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Cancellation & No-Show">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cancellation Window (hours)">
              <input type="number" className={formInputClass} value={current.cancellationWindowHours} onChange={(e) => set("cancellationWindowHours", Number(e.target.value))} />
            </FormField>
            <FormField label="No-Show Grace Period (min)">
              <input type="number" className={formInputClass} value={current.noShowGraceMinutes} onChange={(e) => set("noShowGraceMinutes", Number(e.target.value))} />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Booking">
          <ConfigToggleRow label="Rescheduling Allowed" checked={current.reschedulingAllowed} onChange={(v) => set("reschedulingAllowed", v)} />
          <ConfigToggleRow label="Online Booking" checked={current.onlineBookingEnabled} onChange={(v) => set("onlineBookingEnabled", v)} />
          <ConfigToggleRow label="Walk-In Appointments" checked={current.walkInAllowed} onChange={(v) => set("walkInAllowed", v)} />
        </FormSection>

        <Button size="sm" onClick={() => onSave(values)} disabled={Object.keys(values).length === 0}>Save Changes</Button>
      </Card>
    </div>
  );
}
