import type { LabOrderPriority, LabOrderStatus, ObservationInterpretation, SpecimenProcessingStatus } from "@modules/hospital-admin/api";

export const labOrderStatusMeta: Record<LabOrderStatus, { label: string; color: string }> = {
  ordered: { label: "Ordered", color: "var(--outline)" },
  "specimen-collected": { label: "Specimen Collected", color: "var(--caution-amber)" },
  "received-in-lab": { label: "Received in Lab", color: "var(--signal-indigo-light)" },
  "in-process": { label: "In Process", color: "var(--signal-indigo)" },
  resulted: { label: "Resulted", color: "var(--module-radiology)" },
  verified: { label: "Verified", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
};

export const labPriorityMeta: Record<LabOrderPriority, { label: string; color: string }> = {
  routine: { label: "Routine", color: "var(--outline)" },
  urgent: { label: "Urgent", color: "var(--caution-amber)" },
  stat: { label: "STAT", color: "var(--pulse-coral)" },
};

export const specimenStatusMeta: Record<SpecimenProcessingStatus, { label: string; color: string }> = {
  "pending-collection": { label: "Pending Collection", color: "var(--outline)" },
  collected: { label: "Collected", color: "var(--caution-amber)" },
  "in-transit": { label: "In Transit", color: "var(--signal-indigo-light)" },
  received: { label: "Received", color: "var(--signal-indigo)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  processed: { label: "Processed", color: "var(--vital-green)" },
};

export const interpretationMeta: Record<ObservationInterpretation, { label: string; color: string }> = {
  normal: { label: "Normal", color: "var(--vital-green)" },
  low: { label: "Low", color: "var(--caution-amber)" },
  high: { label: "High", color: "var(--caution-amber)" },
  "critical-low": { label: "Critical Low", color: "var(--pulse-coral)" },
  "critical-high": { label: "Critical High", color: "var(--pulse-coral)" },
};

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
