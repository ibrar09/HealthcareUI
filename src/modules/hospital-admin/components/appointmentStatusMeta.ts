import type { AppointmentStatus } from "@modules/hospital-admin/api";

/** Shared appointment-status → label/color mapping, used across Dashboard/Calendar/List/Details. */
export const appointmentStatusMeta: Record<AppointmentStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline-variant)" },
  "pending-confirmation": { label: "Pending", color: "var(--caution-amber)" },
  confirmed: { label: "Confirmed", color: "var(--signal-indigo)" },
  "checked-in": { label: "Checked-In", color: "var(--module-radiology)" },
  waiting: { label: "Waiting", color: "var(--module-pharmacy)" },
  "in-progress": { label: "In Consultation", color: "var(--module-lab)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
  rescheduled: { label: "Rescheduled", color: "var(--module-nursing)" },
  "no-show": { label: "No-Show", color: "var(--pulse-coral)" },
};
