import type { ImagingOrderStatus, ImagingOrderPriority, ModalityStatus, RadiologyReportStatus, CriticalFindingNotificationStatus } from "@modules/hospital-admin/api";

export const imagingOrderStatusMeta: Record<ImagingOrderStatus, { label: string; color: string }> = {
  ordered: { label: "Ordered", color: "var(--outline)" },
  "pending-authorization": { label: "Pending Authorization", color: "var(--caution-amber)" },
  authorized: { label: "Authorized", color: "var(--signal-indigo-light)" },
  scheduled: { label: "Scheduled", color: "var(--signal-indigo)" },
  "checked-in": { label: "Checked-In", color: "var(--module-radiology)" },
  "in-progress": { label: "In Progress", color: "var(--caution-amber)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
  "no-show": { label: "No-Show", color: "var(--pulse-coral)" },
  "on-hold": { label: "On Hold", color: "var(--outline)" },
};

export const imagingPriorityMeta: Record<ImagingOrderPriority, { label: string; color: string }> = {
  stat: { label: "STAT", color: "var(--pulse-coral)" },
  urgent: { label: "Urgent", color: "var(--caution-amber)" },
  asap: { label: "ASAP", color: "var(--caution-amber)" },
  routine: { label: "Routine", color: "var(--outline)" },
};

export const modalityStatusMeta: Record<ModalityStatus, { label: string; color: string; dot: string }> = {
  operational: { label: "Operational", color: "var(--vital-green)", dot: "🟢" },
  limited: { label: "Limited", color: "var(--caution-amber)", dot: "🟡" },
  offline: { label: "Offline", color: "var(--pulse-coral)", dot: "🔴" },
  maintenance: { label: "Maintenance", color: "var(--signal-indigo)", dot: "🔵" },
  retired: { label: "Retired", color: "var(--outline)", dot: "⚫" },
};

export const radiologyReportStatusMeta: Record<RadiologyReportStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--outline)" },
  preliminary: { label: "Preliminary", color: "var(--caution-amber)" },
  final: { label: "Final", color: "var(--vital-green)" },
  amended: { label: "Amended", color: "var(--signal-indigo)" },
};

export const criticalNotificationStatusMeta: Record<CriticalFindingNotificationStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "var(--outline)" },
  sent: { label: "Sent — Not Acknowledged", color: "var(--pulse-coral)" },
  acknowledged: { label: "Acknowledged", color: "var(--vital-green)" },
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
