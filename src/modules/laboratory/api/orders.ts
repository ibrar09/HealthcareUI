import { mockRequest } from "@shared/lib/api/client";

// LabOrder — FHIR ServiceRequest-equivalent. Status lifecycle condensed
// from the spec's 9-state chain (Placed→Verified→CollectionPending→
// Collected→Processing→Testing→Validation→Authorization→Released) into
// 7 states that still tell the real clinical story: Authorization is
// tracked per-result in results.ts (technical vs. clinical sign-off),
// not duplicated at the order level.

export type OrderPriority = "Routine" | "Urgent" | "STAT";
export type OrderStatus = "Ordered" | "Collection Pending" | "Collected" | "Received" | "Testing" | "Validation" | "Released" | "Cancelled";

export interface LabOrder {
  id: string;
  patientId: string;
  orderingDoctor: string;
  testIds: string[];
  panelName?: string;
  priority: OrderPriority;
  indication: string;
  status: OrderStatus;
  accessionNo?: string;
  collectedAt?: string;
  receivedAt?: string;
  orderedAt: string;
}

let orders: LabOrder[] = [
  { id: "lord-1", patientId: "lp-1", orderingDoctor: "Dr. Ahsan Malik", testIds: ["t-hgb", "t-wbc", "t-plt", "t-hct"], panelName: "Complete Blood Count (CBC)", priority: "Routine", indication: "Annual health check", status: "Ordered", orderedAt: "07:10" },
  { id: "lord-2", patientId: "lp-2", orderingDoctor: "Dr. Sana Riaz", testIds: ["t-crea", "t-urea", "t-na", "t-k"], panelName: "Renal Function Panel", priority: "Urgent", indication: "Monitor renal function post-surgery", status: "Collection Pending", orderedAt: "07:20" },
  { id: "lord-3", patientId: "lp-3", orderingDoctor: "Dr. Bilal Chaudhry", testIds: ["t-alt", "t-ast"], panelName: "Liver Function Panel", priority: "Routine", indication: "Statin therapy monitoring", status: "Collected", collectedAt: "07:45", orderedAt: "07:00" },
  { id: "lord-4", patientId: "lp-4", orderingDoctor: "Dr. Nadia Farooq", testIds: ["t-k", "t-glu"], priority: "STAT", indication: "ED — altered mental status", status: "Received", collectedAt: "08:05", receivedAt: "08:15", accessionNo: "LAB-10024", orderedAt: "08:00" },
  { id: "lord-5", patientId: "lp-5", orderingDoctor: "Dr. Sana Riaz", testIds: ["t-hgb", "t-wbc", "t-plt", "t-hct"], panelName: "Complete Blood Count (CBC)", priority: "STAT", indication: "ICU — sepsis workup", status: "Testing", collectedAt: "07:30", receivedAt: "07:40", accessionNo: "LAB-10021", orderedAt: "07:25" },
  { id: "lord-6", patientId: "lp-6", orderingDoctor: "Dr. Ahsan Malik", testIds: ["t-chol", "t-ldl", "t-hdl", "t-tg"], panelName: "Lipid Panel", priority: "Routine", indication: "Cardiovascular risk screening", status: "Testing", collectedAt: "07:15", receivedAt: "07:25", accessionNo: "LAB-10018", orderedAt: "07:00" },
  { id: "lord-7", patientId: "lp-7", orderingDoctor: "Dr. Bilal Chaudhry", testIds: ["t-tsh", "t-hba1c"], priority: "Routine", indication: "Diabetes and thyroid follow-up", status: "Validation", collectedAt: "06:50", receivedAt: "07:05", accessionNo: "LAB-10012", orderedAt: "06:40" },
  { id: "lord-8", patientId: "lp-8", orderingDoctor: "Dr. Nadia Farooq", testIds: ["t-ptinr", "t-aptt"], panelName: "Coagulation Panel", priority: "STAT", indication: "ED — pre-procedure coagulation check", status: "Validation", collectedAt: "08:10", receivedAt: "08:20", accessionNo: "LAB-10025", orderedAt: "08:05" },
  { id: "lord-9", patientId: "lp-1", orderingDoctor: "Dr. Ahsan Malik", testIds: ["t-ua"], priority: "Routine", indication: "Routine screening", status: "Released", collectedAt: "2026-08-20 07:30", receivedAt: "2026-08-20 07:45", accessionNo: "LAB-10005", orderedAt: "2026-08-20 07:15" },
  { id: "lord-10", patientId: "lp-2", orderingDoctor: "Dr. Sana Riaz", testIds: ["t-ucult"], priority: "Routine", indication: "Suspected UTI", status: "Testing", collectedAt: "2026-08-20 09:00", receivedAt: "2026-08-20 09:15", accessionNo: "LAB-10008", orderedAt: "2026-08-20 08:50" },
  { id: "lord-11", patientId: "lp-3", orderingDoctor: "Dr. Bilal Chaudhry", testIds: ["t-bcult"], priority: "STAT", indication: "Fever of unknown origin", status: "Received", collectedAt: "08:25", receivedAt: "08:35", accessionNo: "LAB-10026", orderedAt: "08:20" },
  { id: "lord-12", patientId: "lp-4", orderingDoctor: "Dr. Nadia Farooq", testIds: ["t-esr"], priority: "Routine", indication: "Duplicate of prior order", status: "Cancelled", orderedAt: "07:50" },
  { id: "lord-13", patientId: "lp-5", orderingDoctor: "Dr. Sana Riaz", testIds: ["t-na", "t-k"], priority: "STAT", indication: "ICU — electrolyte monitoring", status: "Released", collectedAt: "2026-08-20 06:00", receivedAt: "2026-08-20 06:10", accessionNo: "LAB-10001", orderedAt: "2026-08-20 05:55" },
  { id: "lord-14", patientId: "lp-6", orderingDoctor: "Dr. Ahsan Malik", testIds: ["t-crea"], priority: "Routine", indication: "Follow-up renal check", status: "Released", collectedAt: "2026-08-19 10:00", receivedAt: "2026-08-19 10:15", accessionNo: "LAB-09988", orderedAt: "2026-08-19 09:50" },
  { id: "lord-15", patientId: "lp-7", orderingDoctor: "Dr. Bilal Chaudhry", testIds: ["t-hgb", "t-wbc", "t-plt", "t-hct"], panelName: "Complete Blood Count (CBC)", priority: "Routine", indication: "Pre-operative workup", status: "Collection Pending", orderedAt: "08:00" },
  { id: "lord-16", patientId: "lp-8", orderingDoctor: "Dr. Nadia Farooq", testIds: ["t-glu"], priority: "STAT", indication: "ED — hypoglycemia suspected", status: "Ordered", orderedAt: "08:30" },
];

export const getOrders = () => mockRequest([...orders]);
export const getOrderById = (id: string) => mockRequest(orders.find((o) => o.id === id) ?? null);

// Synchronous, internal — for cross-file reads within the same tick
// (e.g. results.ts pulling the ordering doctor when raising a critical
// result), not a page-facing API call. Same pattern as Nursing's
// syncNextMedication.
export function getOrderSync(id: string) {
  return orders.find((o) => o.id === id);
}

export function setOrderStatus(id: string, status: OrderStatus) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = status;
  orders = [...orders];
  return mockRequest([...orders]);
}

export function markCollected(id: string, collectedAt: string) {
  const o = orders.find((x) => x.id === id);
  if (o) { o.status = "Collected"; o.collectedAt = collectedAt; }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function accessionAndReceive(id: string, accessionNo: string, receivedAt: string) {
  const o = orders.find((x) => x.id === id);
  if (o) { o.status = "Received"; o.accessionNo = accessionNo; o.receivedAt = receivedAt; }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function cancelOrder(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "Cancelled";
  orders = [...orders];
  return mockRequest([...orders]);
}
