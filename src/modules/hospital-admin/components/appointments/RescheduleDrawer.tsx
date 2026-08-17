import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { AppointmentListRow, DaySchedule } from "@modules/hospital-admin/api";

interface RescheduleDrawerProps {
  appointment: AppointmentListRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Reschedule flow (spec §24): pick a new slot for the same doctor, keep the original record for auditability. */
export function RescheduleDrawer({ appointment, onClose, onComplete }: RescheduleDrawerProps) {
  const [date, setDate] = useState("2026-08-14");
  const [time, setTime] = useState("");
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointment) return;
    const [currentDate] = appointment.start.split("T");
    setDate(currentDate);
    setTime("");
    setError("");
  }, [appointment]);

  useEffect(() => {
    if (!appointment || !date) {
      setDaySchedule(null);
      return;
    }
    api.getDaySchedule(appointment.practitionerId, date).then(setDaySchedule);
  }, [appointment, date]);

  async function handleSubmit() {
    if (!appointment || !time) return;
    setError("");
    try {
      await api.rescheduleAppointment({ appointmentId: appointment.id, date, time });
      onComplete();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reschedule this appointment.");
    }
  }

  return (
    <Drawer
      open={Boolean(appointment)}
      onClose={onClose}
      title="Reschedule Appointment"
      subtitle={appointment ? `${appointment.patientName} · ${appointment.practitionerName}` : undefined}
      footer={
        <div className="flex flex-col gap-2">
          {error && <p className="text-xs font-semibold text-pulse-coral">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!time}>
              Confirm New Time
            </Button>
          </div>
        </div>
      }
    >
      {appointment && (
        <>
          <FormSection title="Current">
            <p className="text-sm text-on-surface-variant">{appointment.start.replace("T", " ")}</p>
          </FormSection>

          <FormSection title="New Date & Slot">
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

            {!daySchedule ? (
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
        </>
      )}
    </Drawer>
  );
}
