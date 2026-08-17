import { useEffect, useMemo, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import * as api from "@modules/hospital-admin/api";
import type { AppointmentPriority, AppointmentSource, AppointmentTypeConfig, DaySchedule } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface ScheduleOption {
  id: string;
  practitionerId: string;
  practitionerName: string;
  facilityId: string;
  departmentId?: string;
  departmentName?: string;
}

interface CreateAppointmentDrawerProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  facilityOptions: { id: string; name: string }[];
  departmentOptions: { id: string; name: string }[];
  schedules: ScheduleOption[];
  appointmentTypes: AppointmentTypeConfig[];
  prefill?: { practitionerId: string; date: string; time: string } | null;
}

const priorityOptions: { value: AppointmentPriority; label: string; color: string }[] = [
  { value: "routine", label: "Routine", color: "var(--signal-indigo)" },
  { value: "urgent", label: "Urgent", color: "var(--caution-amber)" },
  { value: "high", label: "High", color: "var(--sunset-coral)" },
  { value: "emergency", label: "Emergency", color: "var(--pulse-coral)" },
];

const sourceOptions: { value: AppointmentSource; label: string }[] = [
  { value: "reception", label: "Reception" },
  { value: "call-center", label: "Call Center" },
  { value: "patient-web-portal", label: "Patient Web Portal" },
  { value: "patient-mobile-app", label: "Patient Mobile App" },
  { value: "doctor", label: "Doctor" },
  { value: "referral", label: "Referral" },
];

/** Module-local — Create Appointment wizard (spec §4-5): patient → location → provider → date → slot → confirm. */
export function CreateAppointmentDrawer({ open, onClose, onComplete, facilityOptions, departmentOptions, schedules, appointmentTypes, prefill }: CreateAppointmentDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [facilityId, setFacilityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [practitionerId, setPractitionerId] = useState("");
  const [appointmentTypeId, setAppointmentTypeId] = useState("");
  const [date, setDate] = useState("2026-08-14");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<AppointmentPriority>("routine");
  const [source, setSource] = useState<AppointmentSource>("reception");
  const [reason, setReason] = useState("");
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPatient(undefined);
    setError("");
    if (prefill) {
      const schedule = schedules.find((s) => s.practitionerId === prefill.practitionerId);
      setFacilityId(schedule?.facilityId ?? "");
      setDepartmentId(schedule?.departmentId ?? "");
      setPractitionerId(prefill.practitionerId);
      setDate(prefill.date);
      setTime(prefill.time);
    } else {
      setFacilityId("");
      setDepartmentId("");
      setPractitionerId("");
      setDate("2026-08-14");
      setTime("");
    }
    setAppointmentTypeId("");
    setPriority("routine");
    setSource("reception");
    setReason("");
  }, [open, prefill, schedules]);

  const doctorsInDepartment = useMemo(
    () => schedules.filter((s) => !departmentId || s.departmentId === departmentId),
    [schedules, departmentId]
  );

  useEffect(() => {
    if (!practitionerId || !date) {
      setDaySchedule(null);
      return;
    }
    api.getDaySchedule(practitionerId, date).then(setDaySchedule);
  }, [practitionerId, date]);

  async function handleSubmit() {
    if (!patient || !facilityId || !practitionerId || !appointmentTypeId || !date || !time) return;
    setError("");
    try {
      await api.createAppointment({
        patientId: patient.id,
        facilityId,
        departmentId: departmentId || undefined,
        practitionerId,
        appointmentTypeId,
        date,
        time,
        priority,
        source,
        reason: reason || undefined,
      });
      onComplete();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't book this appointment.");
    }
  }

  const canSubmit = Boolean(patient && facilityId && practitionerId && appointmentTypeId && date && time);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create Appointment"
      subtitle="Book a new appointment for a patient."
      footer={
        <div className="flex flex-col gap-2">
          {error && <p className="text-xs font-semibold text-pulse-coral">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Confirm Appointment
            </Button>
          </div>
        </div>
      }
    >
      <FormSection title="Patient">
        <PatientPicker value={patient} onChange={setPatient} />
        <p className="mt-2 text-xs text-on-surface-variant">
          Patient not found? Register them in Patient Administration first — don't create a duplicate record here.
        </p>
      </FormSection>

      <FormSection title="Location">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Facility">
            <select className={formInputClass} value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
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
            <select
              className={formInputClass}
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setPractitionerId("");
              }}
            >
              <option value="">Any department</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Provider & Service">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Doctor">
            <select className={formInputClass} value={practitionerId} onChange={(e) => setPractitionerId(e.target.value)}>
              <option value="" disabled>
                Select a doctor
              </option>
              {doctorsInDepartment.map((s) => (
                <option key={s.practitionerId} value={s.practitionerId}>
                  {s.practitionerName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Appointment Type">
            <select className={formInputClass} value={appointmentTypeId} onChange={(e) => setAppointmentTypeId(e.target.value)}>
              <option value="" disabled>
                Select a type
              </option>
              {appointmentTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.defaultDurationMinutes}m)
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Date & Slot">
        <div className="mb-4">
          <FormField label="Date">
            <input
              type="date"
              className={formInputClass}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
            />
          </FormField>
        </div>

        {!practitionerId ? (
          <p className="text-sm text-on-surface-variant">Select a doctor to see their availability.</p>
        ) : !daySchedule ? (
          <p className="text-sm text-on-surface-variant">Loading availability…</p>
        ) : !daySchedule.working ? (
          <p className="text-sm text-on-surface-variant">{daySchedule.practitionerName} isn't scheduled this day. Pick another date.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {daySchedule.slots.map((slot) => (
              <button
                key={slot.start}
                type="button"
                disabled={slot.status !== "available"}
                title={slot.status === "blocked" ? slot.blockedReason : undefined}
                onClick={() => setTime(slot.start)}
                className={`rounded-input border px-2 py-2 text-xs font-semibold transition-all ${
                  slot.status !== "available"
                    ? "border-line bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed line-through"
                    : time === slot.start
                    ? "border-signal-indigo bg-signal-indigo text-white"
                    : "border-line text-on-surface hover:border-signal-indigo hover:bg-signal-indigo-tint"
                }`}
              >
                {slot.start}
              </button>
            ))}
          </div>
        )}
      </FormSection>

      <FormSection title="Details">
        <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Priority</span>
        <div className="mb-4 flex gap-2">
          {priorityOptions.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full border px-2 py-1.5 text-xs font-semibold transition-all"
              style={
                priority === p.value
                  ? { borderColor: p.color, backgroundColor: `color-mix(in srgb, ${p.color} 12%, transparent)`, color: p.color }
                  : { borderColor: "var(--line)", color: "var(--on-surface-variant)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <FormField label="Source">
            <select className={formInputClass} value={source} onChange={(e) => setSource(e.target.value as AppointmentSource)}>
              {sourceOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Reason (optional)">
          <input className={formInputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Chest pain follow-up" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
