import type { PrescriptionStatus, PrescriptionPriority, BatchStatus, RefillStatus, StockTransferStatus, PurchaseOrderStatus, RecallStatus, CoverageStatus, InpatientOrderStatus } from "@modules/hospital-admin/api";

export const prescriptionStatusMeta: Record<PrescriptionStatus, { label: string; color: string }> = {
  new: { label: "New", color: "var(--outline)" },
  received: { label: "Received", color: "var(--signal-indigo-light)" },
  "under-review": { label: "Under Review", color: "var(--caution-amber)" },
  verified: { label: "Verified", color: "var(--signal-indigo)" },
  preparing: { label: "Preparing", color: "var(--caution-amber)" },
  ready: { label: "Ready", color: "var(--vital-green)" },
  dispensing: { label: "Dispensing", color: "var(--caution-amber)" },
  dispensed: { label: "Dispensed", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  "partially-dispensed": { label: "Partially Dispensed", color: "var(--module-radiology)" },
  returned: { label: "Returned", color: "var(--outline)" },
  expired: { label: "Expired", color: "var(--pulse-coral)" },
};

export const prescriptionPriorityMeta: Record<PrescriptionPriority, { label: string; color: string }> = {
  routine: { label: "Routine", color: "var(--outline)" },
  urgent: { label: "Urgent", color: "var(--caution-amber)" },
  stat: { label: "STAT", color: "var(--pulse-coral)" },
};

export const batchStatusMeta: Record<BatchStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "var(--vital-green)" },
  low: { label: "Low Stock", color: "var(--caution-amber)" },
  expired: { label: "Expired", color: "var(--pulse-coral)" },
  quarantined: { label: "Quarantined", color: "var(--signal-indigo)" },
  damaged: { label: "Damaged", color: "var(--pulse-coral)" },
  reserved: { label: "Reserved", color: "var(--module-radiology)" },
};

export const refillStatusMeta: Record<RefillStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  ready: { label: "Ready", color: "var(--signal-indigo)" },
  dispensed: { label: "Dispensed", color: "var(--vital-green)" },
};

export const transferStatusMeta: Record<StockTransferStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline)" },
  approved: { label: "Approved", color: "var(--signal-indigo)" },
  "in-transit": { label: "In Transit", color: "var(--caution-amber)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const purchaseOrderStatusMeta: Record<PurchaseOrderStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline)" },
  approved: { label: "Approved", color: "var(--signal-indigo)" },
  ordered: { label: "Ordered", color: "var(--caution-amber)" },
  "partially-received": { label: "Partially Received", color: "var(--module-radiology)" },
  received: { label: "Received", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
};

export const recallStatusMeta: Record<RecallStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "var(--pulse-coral)" },
  "in-progress": { label: "In Progress", color: "var(--caution-amber)" },
  closed: { label: "Closed", color: "var(--vital-green)" },
};

export const coverageStatusMeta: Record<CoverageStatus, { label: string; color: string }> = {
  "not-applicable": { label: "Not Applicable", color: "var(--outline)" },
  "pending-authorization": { label: "Pending Authorization", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const inpatientOrderStatusMeta: Record<InpatientOrderStatus, { label: string; color: string }> = {
  ordered: { label: "Ordered", color: "var(--outline)" },
  "pharmacy-verified": { label: "Pharmacy Verified", color: "var(--signal-indigo)" },
  preparing: { label: "Preparing", color: "var(--caution-amber)" },
  "supplied-to-ward": { label: "Supplied to Ward", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
