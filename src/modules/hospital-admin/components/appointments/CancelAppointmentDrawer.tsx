import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { AppointmentListRow } from "@modules/hospital-admin/api";

interface CancelAppointmentDrawerProps {
  appointment: AppointmentListRow | null;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — Cancellation flow (spec §23): always requires a reason. */
export function CancelAppointmentDrawer({ appointment, onClose, onComplete }: CancelAppointmentDrawerProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (appointment) setReason("");
  }, [appointment]);

  async function handleSubmit() {
    if (!appointment || !reason.trim()) return;
    await api.cancelAppointment(appointment.id, reason.trim());
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(appointment)}
      onClose={onClose}
      title="Cancel Appointment"
      subtitle={appointment ? `${appointment.patientName} · ${appointment.start.replace("T", " ")}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Keep Appointment
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={!reason.trim()}>
            Cancel Appointment
          </Button>
        </div>
      }
    >
      <FormSection title="Reason">
        <FormField label="Why is this appointment being cancelled?">
          <textarea
            className={formInputClass}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Patient request"
          />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
