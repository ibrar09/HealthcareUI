import type {
  InventoryBatchStatus,
  AssetStatus,
  StockStatus,
  RequisitionStatus,
  ReturnStatus,
  TransferStatus,
  InventoryPurchaseOrderStatus,
  PurchaseRequestStatus,
  GoodsReceiptStatus,
  CountStatus,
  AdjustmentApprovalStatus,
  InventoryRecallStatus,
  ReservationStatus,
  RequisitionPriority,
  ItemCategory,
} from "@modules/hospital-admin/api";

export const batchStatusMeta: Record<InventoryBatchStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "var(--vital-green)" },
  low: { label: "Low Stock", color: "var(--caution-amber)" },
  quarantined: { label: "Quarantined", color: "var(--signal-indigo)" },
  expired: { label: "Expired", color: "var(--pulse-coral)" },
  damaged: { label: "Damaged", color: "var(--pulse-coral)" },
  disposed: { label: "Disposed", color: "var(--outline)" },
  returned: { label: "Returned", color: "var(--outline)" },
};

export const assetStatusMeta: Record<AssetStatus, { label: string; color: string }> = {
  "in-stock": { label: "In Stock", color: "var(--vital-green)" },
  issued: { label: "Issued", color: "var(--signal-indigo)" },
  "in-use": { label: "In Use", color: "var(--signal-indigo)" },
  "under-maintenance": { label: "Under Maintenance", color: "var(--caution-amber)" },
  retired: { label: "Retired", color: "var(--outline)" },
  lost: { label: "Lost", color: "var(--pulse-coral)" },
};

export const stockStatusMeta: Record<StockStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "var(--vital-green)" },
  "low-stock": { label: "Low Stock", color: "var(--caution-amber)" },
  "out-of-stock": { label: "Out of Stock", color: "var(--pulse-coral)" },
  reserved: { label: "Reserved", color: "var(--module-radiology)" },
  quarantined: { label: "Quarantined", color: "var(--signal-indigo)" },
  damaged: { label: "Damaged", color: "var(--pulse-coral)" },
  expired: { label: "Expired", color: "var(--pulse-coral)" },
  blocked: { label: "Blocked", color: "var(--outline)" },
  "in-transit": { label: "In Transit", color: "var(--caution-amber)" },
};

export const requisitionStatusMeta: Record<RequisitionStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--outline)" },
  submitted: { label: "Submitted", color: "var(--signal-indigo-light)" },
  "under-review": { label: "Under Review", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--signal-indigo)" },
  picking: { label: "Picking", color: "var(--caution-amber)" },
  issued: { label: "Issued", color: "var(--vital-green)" },
  received: { label: "Received", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
  "partially-fulfilled": { label: "Partially Fulfilled", color: "var(--module-radiology)" },
};

export const requisitionPriorityMeta: Record<RequisitionPriority, { label: string; color: string }> = {
  routine: { label: "Routine", color: "var(--outline)" },
  urgent: { label: "Urgent", color: "var(--caution-amber)" },
  emergency: { label: "Emergency", color: "var(--pulse-coral)" },
};

export const returnStatusMeta: Record<ReturnStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline)" },
  approved: { label: "Approved", color: "var(--signal-indigo)" },
  received: { label: "Received", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const transferStatusMeta: Record<TransferStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--outline)" },
  approved: { label: "Approved", color: "var(--signal-indigo)" },
  picking: { label: "Picking", color: "var(--caution-amber)" },
  shipped: { label: "Shipped", color: "var(--caution-amber)" },
  "in-transit": { label: "In Transit", color: "var(--caution-amber)" },
  received: { label: "Received", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
};

export const purchaseOrderStatusMeta: Record<InventoryPurchaseOrderStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--outline)" },
  sent: { label: "Sent", color: "var(--signal-indigo)" },
  acknowledged: { label: "Acknowledged", color: "var(--caution-amber)" },
  "partially-received": { label: "Partially Received", color: "var(--module-radiology)" },
  received: { label: "Received", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--pulse-coral)" },
};

export const purchaseRequestStatusMeta: Record<PurchaseRequestStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--outline)" },
  submitted: { label: "Submitted", color: "var(--signal-indigo-light)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  converted: { label: "Converted to PO", color: "var(--signal-indigo)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
};

export const goodsReceiptStatusMeta: Record<GoodsReceiptStatus, { label: string; color: string }> = {
  accepted: { label: "Accepted", color: "var(--vital-green)" },
  partial: { label: "Partial", color: "var(--caution-amber)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const countStatusMeta: Record<CountStatus, { label: string; color: string }> = {
  planned: { label: "Planned", color: "var(--outline)" },
  "in-progress": { label: "In Progress", color: "var(--caution-amber)" },
  counted: { label: "Counted", color: "var(--signal-indigo)" },
  "variance-review": { label: "Variance Review", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
};

export const adjustmentStatusMeta: Record<AdjustmentApprovalStatus, { label: string; color: string }> = {
  "pending-approval": { label: "Pending Approval", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const recallStatusMeta: Record<InventoryRecallStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "var(--pulse-coral)" },
  investigating: { label: "Investigating", color: "var(--caution-amber)" },
  closed: { label: "Closed", color: "var(--vital-green)" },
};

export const reservationStatusMeta: Record<ReservationStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "var(--signal-indigo)" },
  fulfilled: { label: "Fulfilled", color: "var(--vital-green)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
  expired: { label: "Expired", color: "var(--pulse-coral)" },
};

export const categoryLabels: Record<ItemCategory, string> = {
  medicine: "Medicine",
  "medical-supply": "Medical Supply",
  surgical: "Surgical",
  laboratory: "Laboratory",
  ppe: "PPE",
  implant: "Implant",
  consumable: "Consumable",
  equipment: "Equipment",
  general: "General",
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function statusPillStyle(color: string) {
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}
