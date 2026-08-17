import { Building2, CalendarClock, CalendarDays, CheckCircle2, ClipboardList, LogIn, PlayCircle, Stethoscope, User, UserX, XCircle } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { appointmentStatusMeta } from "@modules/hospital-admin/components/appointmentStatusMeta";
import type { AppointmentListRow } from "@modules/hospital-admin/api";

export type AppointmentQuickAction = "check-in" | "start-consultation" | "complete-consultation" | "no-show";

const sourceLabel: Record<AppointmentListRow["source"], string> = {
  reception: "Reception",
  "call-center": "Call Center",
  "patient-mobile-app": "Patient Mobile App",
  "patient-web-portal": "Patient Web Portal",
  doctor: "Doctor",
  referral: "Referral",
  "external-system": "External System",
  partner: "Partner",
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value || "—"}</p>
    </div>
  );
}

interface AppointmentDetailsDrawerProps {
  appointment: AppointmentListRow | null;
  onClose: () => void;
  onViewPatient?: (patientId: string) => void;
  onQuickAction: (action: AppointmentQuickAction) => void;
  onReschedule: () => void;
  onCancel: () => void;
}

/** Appointment detail panel (spec §16), with the Step 3 patient-operations actions wired in (Check-In/Reschedule/Cancel/No-Show/Start & Complete Consultation). */
export function AppointmentDetailsDrawer({ appointment, onClose, onViewPatient, onQuickAction, onReschedule, onCancel }: AppointmentDetailsDrawerProps) {
  const meta = appointment ? appointmentStatusMeta[appointment.status] : null;
  const [date, time] = appointment ? appointment.start.split("T") : ["", ""];
  const [, endTime] = appointment ? appointment.end.split("T") : ["", ""];
  const isUpcoming = appointment ? ["requested", "pending-confirmation", "confirmed"].includes(appointment.status) : false;
  const isWaiting = appointment ? ["checked-in", "waiting"].includes(appointment.status) : false;

  return (
    <Drawer
      open={Boolean(appointment)}
      onClose={onClose}
      title={appointment ? `Appointment · ${appointment.id.toUpperCase()}` : "Appointment"}
      subtitle={appointment ? `${date} · ${time}–${endTime}` : undefined}
      footer={
        appointment && (
          <div className="flex flex-col gap-2">
            {appointment.patientId && onViewPatient && (
              <Button variant="outline" onClick={() => onViewPatient(appointment.patientId)} icon={<User size={14} />} fullWidth>
                View Patient Profile
              </Button>
            )}
            {isUpcoming && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => onQuickAction("check-in")} icon={<LogIn size={14} />}>
                    Check In
                  </Button>
                  <Button variant="outline" onClick={onReschedule} icon={<CalendarClock size={14} />}>
                    Reschedule
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onQuickAction("no-show")} icon={<UserX size={14} />}>
                    Mark No-Show
                  </Button>
                  <Button variant="danger" onClick={onCancel} icon={<XCircle size={14} />}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
            {isWaiting && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onQuickAction("start-consultation")} icon={<PlayCircle size={14} />}>
                  Start Consultation
                </Button>
                <Button variant="danger" onClick={onCancel} icon={<XCircle size={14} />}>
                  Cancel
                </Button>
              </div>
            )}
            {appointment.status === "in-progress" && (
              <Button onClick={() => onQuickAction("complete-consultation")} icon={<CheckCircle2 size={14} />} fullWidth>
                Complete Consultation
              </Button>
            )}
          </div>
        )
      }
    >
      {appointment && meta && (
        <div className="flex flex-col gap-6">
          <div
            className="flex items-center gap-4 rounded-2xl border border-line p-4"
            style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}
          >
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm"
              style={{ color: meta.color }}
            >
              <CalendarDays size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-on-surface">{appointment.appointmentTypeName}</p>
              <p className="truncate text-sm text-on-surface-variant">{appointment.patientName}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
              <User size={12} /> Patient
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Patient" value={appointment.patientName} />
              <Field label="MRN" value={appointment.patientMrn} />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
              <Stethoscope size={12} /> Provider & Service
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Doctor" value={appointment.practitionerName} />
              <Field label="Department" value={appointment.departmentName} />
              <Field label="Type" value={appointment.appointmentTypeName} />
              <Field label="Priority" value={appointment.priority} />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
              <Building2 size={12} /> Location
            </h3>
            <Field label="Facility" value={appointment.facilityName} />
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
              <ClipboardList size={12} /> Booking
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Source" value={sourceLabel[appointment.source]} />
              <Field label="Reason" value={appointment.reason} />
            </div>
            {appointment.status === "cancelled" && appointment.cancellationReason && (
              <div className="mt-4">
                <Field label="Cancellation Reason" value={appointment.cancellationReason} />
              </div>
            )}
          </div>

          {appointment.status === "rescheduled" && appointment.rescheduledToStart && (
            <div className="rounded-xl border-2 border-dashed border-module-nursing/50 bg-module-nursing/[0.06] px-4 py-3">
              <p className="text-xs font-bold" style={{ color: "var(--module-nursing)" }}>
                Rescheduled
              </p>
              <p className="text-xs text-on-surface-variant">
                New time: {appointment.rescheduledToStart.replace("T", " ")}
              </p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
