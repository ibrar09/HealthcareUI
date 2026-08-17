import type { EmergencyVisitStatus, EmergencyOrderStatus, EmergencyObservationStatus, EmergencyDispositionType, EmergencyArrivalMode, EmergencyBayStatus } from "@modules/hospital-admin/api";

export const visitStatusMeta: Record<EmergencyVisitStatus, { label: string; color: string }> = {
  "waiting-triage": { label: "Waiting for Triage", color: "var(--caution-amber)" },
  "waiting-doctor": { label: "Waiting for Doctor", color: "var(--signal-indigo)" },
  "in-treatment": { label: "In Treatment", color: "var(--signal-indigo)" },
  "in-observation": { label: "In Observation", color: "var(--module-radiology)" },
  "disposition-pending": { label: "Disposition Pending", color: "var(--caution-amber)" },
  discharged: { label: "Discharged", color: "var(--vital-green)" },
  admitted: { label: "Admitted", color: "var(--vital-green)" },
  transferred: { label: "Transferred", color: "var(--vital-green)" },
  "left-without-treatment": { label: "Left Without Treatment", color: "var(--pulse-coral)" },
};

export const orderStatusMeta: Record<EmergencyOrderStatus, { label: string; color: string }> = {
  ordered: { label: "Ordered", color: "var(--outline)" },
  accepted: { label: "Accepted", color: "var(--signal-indigo-light)" },
  "in-progress": { label: "In Progress", color: "var(--caution-amber)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  "result-available": { label: "Result Available", color: "var(--module-radiology)" },
  reviewed: { label: "Reviewed", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
};

export const observationStatusMeta: Record<EmergencyObservationStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "var(--signal-indigo)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  "converted-to-admission": { label: "Converted to Admission", color: "var(--module-radiology)" },
  discharged: { label: "Discharged", color: "var(--vital-green)" },
  transferred: { label: "Transferred", color: "var(--vital-green)" },
};

export const dispositionTypeMeta: Record<EmergencyDispositionType, { label: string; color: string }> = {
  discharge: { label: "Discharge", color: "var(--vital-green)" },
  admission: { label: "Admission", color: "var(--signal-indigo)" },
  transfer: { label: "Transfer", color: "var(--module-radiology)" },
  referral: { label: "Referral", color: "var(--caution-amber)" },
  death: { label: "Death", color: "var(--outline)" },
  other: { label: "Other", color: "var(--outline)" },
};

export const arrivalModeLabels: Record<EmergencyArrivalMode, string> = {
  "walk-in": "Walk-in",
  ambulance: "Ambulance",
  transfer: "Transfer",
  police: "Police / Other Authorized",
  referral: "Referral",
};

export const bayStatusMeta: Record<EmergencyBayStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "var(--vital-green)" },
  occupied: { label: "Occupied", color: "var(--signal-indigo)" },
  cleaning: { label: "Cleaning", color: "var(--caution-amber)" },
  isolation: { label: "Isolation", color: "var(--pulse-coral)" },
  reserved: { label: "Reserved", color: "var(--module-radiology)" },
  "out-of-service": { label: "Out of Service", color: "var(--outline)" },
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function statusPillStyle(color: string) {
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}
