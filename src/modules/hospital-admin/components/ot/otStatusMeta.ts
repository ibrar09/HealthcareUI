import type { SurgicalCaseStatus, SurgeryPriority, OTRoomStatus, PacuStatus, ConsentStatus, InstrumentStatus, OTEquipmentStatus } from "@modules/hospital-admin/api";

export const surgicalCaseStatusMeta: Record<SurgicalCaseStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline)" },
  approved: { label: "Approved", color: "var(--signal-indigo-light)" },
  scheduled: { label: "Scheduled", color: "var(--signal-indigo)" },
  "pre-op-pending": { label: "Pre-Op Pending", color: "var(--caution-amber)" },
  "pre-op-cleared": { label: "Pre-Op Cleared", color: "var(--vital-green)" },
  "ready-for-ot": { label: "Ready for OT", color: "var(--vital-green)" },
  "patient-transferred": { label: "Patient Transferred", color: "var(--module-radiology)" },
  "anesthesia-started": { label: "Anesthesia Started", color: "var(--caution-amber)" },
  "surgery-started": { label: "Surgery in Progress", color: "var(--pulse-coral)" },
  "surgery-completed": { label: "Surgery Completed", color: "var(--vital-green)" },
  recovery: { label: "Recovery", color: "var(--module-radiology)" },
  transferred: { label: "Transferred", color: "var(--vital-green)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
  postponed: { label: "Postponed", color: "var(--outline)" },
  "no-show": { label: "No-Show", color: "var(--pulse-coral)" },
  aborted: { label: "Aborted", color: "var(--pulse-coral)" },
};

export const surgeryPriorityMeta: Record<SurgeryPriority, { label: string; color: string }> = {
  emergency: { label: "Emergency", color: "var(--pulse-coral)" },
  urgent: { label: "Urgent", color: "var(--caution-amber)" },
  "semi-urgent": { label: "Semi-Urgent", color: "var(--caution-amber)" },
  elective: { label: "Elective", color: "var(--outline)" },
};

export const otRoomStatusMeta: Record<OTRoomStatus, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "var(--vital-green)", dot: "🟢" },
  reserved: { label: "Reserved", color: "var(--signal-indigo)", dot: "🔵" },
  preparation: { label: "Preparation", color: "var(--caution-amber)", dot: "🟡" },
  "patient-inside": { label: "Patient Inside", color: "var(--caution-amber)", dot: "🟡" },
  "in-surgery": { label: "In Surgery", color: "var(--pulse-coral)", dot: "🔴" },
  recovery: { label: "Recovery", color: "var(--module-radiology)", dot: "🔵" },
  cleaning: { label: "Cleaning", color: "var(--caution-amber)", dot: "🟡" },
  maintenance: { label: "Maintenance", color: "var(--outline)", dot: "⚫" },
  blocked: { label: "Blocked", color: "var(--outline)", dot: "⚫" },
  "emergency-reserved": { label: "Emergency Reserved", color: "var(--pulse-coral)", dot: "🔴" },
};

export const pacuStatusMeta: Record<PacuStatus, { label: string; color: string }> = {
  waiting: { label: "Waiting", color: "var(--outline)" },
  arrived: { label: "Arrived", color: "var(--caution-amber)" },
  recovery: { label: "Recovery", color: "var(--signal-indigo)" },
  "ready-for-transfer": { label: "Ready for Transfer", color: "var(--vital-green)" },
  transferred: { label: "Transferred", color: "var(--vital-green)" },
};

export const consentStatusMeta: Record<ConsentStatus, { label: string; color: string }> = {
  required: { label: "Required", color: "var(--outline)" },
  obtained: { label: "Obtained", color: "var(--caution-amber)" },
  verified: { label: "Verified", color: "var(--vital-green)" },
  withdrawn: { label: "Withdrawn", color: "var(--pulse-coral)" },
};

export const instrumentStatusMeta: Record<InstrumentStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "var(--vital-green)" },
  "in-use": { label: "In Use", color: "var(--caution-amber)" },
  sterilization: { label: "Sterilization", color: "var(--signal-indigo)" },
  contaminated: { label: "Contaminated", color: "var(--pulse-coral)" },
  damaged: { label: "Damaged", color: "var(--pulse-coral)" },
  maintenance: { label: "Maintenance", color: "var(--outline)" },
};

export const otEquipmentStatusMeta: Record<OTEquipmentStatus, { label: string; color: string }> = {
  operational: { label: "Operational", color: "var(--vital-green)" },
  "in-use": { label: "In Use", color: "var(--caution-amber)" },
  maintenance: { label: "Maintenance", color: "var(--signal-indigo)" },
  "out-of-service": { label: "Out of Service", color: "var(--pulse-coral)" },
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
