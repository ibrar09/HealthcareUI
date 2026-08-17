import type { ChargeStatus, InvoiceStatus, PaymentMethod, AuthorizationStatus, PayerType, ClaimStatus, DenialStage, RefundStatus, WriteOffStatus } from "@modules/hospital-admin/api";

export const chargeStatusMeta: Record<ChargeStatus, { label: string; color: string }> = {
  "pending-review": { label: "Pending Review", color: "var(--caution-amber)" },
  validated: { label: "Validated", color: "var(--signal-indigo)" },
  billed: { label: "Billed", color: "var(--vital-green)" },
  reversed: { label: "Reversed", color: "var(--outline)" },
};

export const invoiceStatusMeta: Record<InvoiceStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--outline)" },
  "pending-review": { label: "Pending Review", color: "var(--caution-amber)" },
  issued: { label: "Issued", color: "var(--signal-indigo)" },
  "partially-paid": { label: "Partially Paid", color: "var(--caution-amber)" },
  paid: { label: "Paid", color: "var(--vital-green)" },
  overdue: { label: "Overdue", color: "var(--pulse-coral)" },
  cancelled: { label: "Cancelled", color: "var(--outline)" },
  void: { label: "Void", color: "var(--outline)" },
  refunded: { label: "Refunded", color: "var(--module-radiology)" },
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  "bank-transfer": "Bank Transfer",
  online: "Online Payment",
  insurance: "Insurance",
  corporate: "Corporate",
};

export const authorizationStatusMeta: Record<AuthorizationStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  expired: { label: "Expired", color: "var(--outline)" },
};

export const payerTypeLabel: Record<PayerType, string> = {
  "insurance-company": "Insurance Company",
  government: "Government Payer",
  "employer-corporate": "Employer / Corporate",
  "third-party-administrator": "Third-Party Administrator",
};

export const claimStatusMeta: Record<ClaimStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "var(--outline)" },
  ready: { label: "Ready", color: "var(--signal-indigo)" },
  submitted: { label: "Submitted", color: "var(--caution-amber)" },
  accepted: { label: "Accepted", color: "var(--module-radiology)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
  denied: { label: "Denied", color: "var(--sunset-coral)" },
  paid: { label: "Paid", color: "var(--vital-green)" },
};

export const refundStatusMeta: Record<RefundStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--signal-indigo)" },
  completed: { label: "Completed", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const writeOffStatusMeta: Record<WriteOffStatus, { label: string; color: string }> = {
  requested: { label: "Requested", color: "var(--caution-amber)" },
  approved: { label: "Approved", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--pulse-coral)" },
};

export const arCategoryLabel: Record<string, string> = {
  insurance: "Insurance AR",
  patient: "Patient AR",
  corporate: "Corporate AR",
  government: "Government AR",
};

export const denialStageLabel: Record<DenialStage, string> = {
  new: "New",
  assigned: "Assigned",
  investigating: "Investigating",
  corrected: "Corrected",
  resubmitted: "Resubmitted",
  appealed: "Appealed",
  approved: "Approved",
  "denied-again": "Denied Again",
  closed: "Closed",
};
