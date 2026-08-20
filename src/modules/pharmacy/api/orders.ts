import { mockRequest } from "@shared/lib/api/client";

// MedicationOrder — the FHIR MedicationRequest-equivalent concept in this
// mock. Status lifecycle matches the spec's clinical workflow (Received →
// Under Review → Verified/Clarification/Hold → Ready → Dispensed), never a
// generic free-text "order" field.

export type OrderPriority = "Routine" | "Urgent" | "STAT";
export type OrderSetting = "Outpatient" | "Inpatient" | "Emergency";
export type OrderStatus = "Received" | "Under Review" | "Verified" | "Clarification Required" | "On Hold" | "Ready" | "Partially Dispensed" | "Dispensed" | "Cancelled";

export interface SafetyAlert {
  type: "Allergy" | "Interaction" | "Duplicate Therapy" | "Contraindication" | "Dose";
  severity: "critical" | "high" | "medium";
  message: string;
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  prescriber: string;
  medicationName: string;
  genericName: string;
  strength: string;
  form: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  indication: string;
  priority: OrderPriority;
  setting: OrderSetting;
  status: OrderStatus;
  controlled: boolean;
  orderedAt: string;
  alerts: SafetyAlert[];
  verifiedBy?: string;
  holdReason?: string;
}

let orders: MedicationOrder[] = [
  { id: "ord-1", patientId: "pp-1", prescriber: "Dr. Ahsan Malik", medicationName: "Amoxicillin", genericName: "Amoxicillin", strength: "500mg", form: "Capsule", dose: "500mg", route: "Oral", frequency: "TID", duration: "7 days", quantity: 21, indication: "Sinusitis", priority: "Routine", setting: "Outpatient", status: "Received", controlled: false, orderedAt: "07:40", alerts: [{ type: "Allergy", severity: "critical", message: "Patient has documented Penicillin allergy (Hives) — Amoxicillin is a penicillin-class antibiotic." }] },
  { id: "ord-2", patientId: "pp-2", prescriber: "Dr. Sana Riaz", medicationName: "Metformin", genericName: "Metformin", strength: "500mg", form: "Tablet", dose: "500mg", route: "Oral", frequency: "BID", duration: "30 days", quantity: 60, indication: "Type 2 Diabetes", priority: "Routine", setting: "Inpatient", status: "Received", controlled: false, orderedAt: "07:45", alerts: [{ type: "Dose", severity: "medium", message: "Patient has CKD Stage 3 — consider renal dose adjustment." }] },
  { id: "ord-3", patientId: "pp-4", prescriber: "Dr. Bilal Chaudhry", medicationName: "Morphine Sulfate", genericName: "Morphine", strength: "10mg/mL", form: "Injection", dose: "4mg", route: "IV", frequency: "Q4H PRN", duration: "48 hours", quantity: 12, indication: "Post-MI chest pain", priority: "STAT", setting: "Inpatient", status: "Under Review", controlled: true, orderedAt: "08:10", alerts: [] },
  { id: "ord-4", patientId: "pp-5", prescriber: "Dr. Ahsan Malik", medicationName: "Ibuprofen", genericName: "Ibuprofen", strength: "400mg", form: "Tablet", dose: "400mg", route: "Oral", frequency: "TID", duration: "3 days", quantity: 9, indication: "Pain", priority: "Urgent", setting: "Emergency", status: "Received", controlled: false, orderedAt: "08:20", alerts: [{ type: "Contraindication", severity: "high", message: "NSAIDs are generally avoided in pregnancy — patient is in 2nd trimester." }] },
  { id: "ord-5", patientId: "pp-3", prescriber: "Dr. Sana Riaz", medicationName: "Sulfamethoxazole/Trimethoprim", genericName: "Co-trimoxazole", strength: "800/160mg", form: "Tablet", dose: "1 tab", route: "Oral", frequency: "BID", duration: "5 days", quantity: 10, indication: "UTI", priority: "Routine", setting: "Outpatient", status: "Received", controlled: false, orderedAt: "08:25", alerts: [{ type: "Allergy", severity: "critical", message: "Patient has documented Sulfa drug allergy (Rash)." }] },
  { id: "ord-6", patientId: "pp-2", prescriber: "Dr. Sana Riaz", medicationName: "Furosemide", genericName: "Furosemide", strength: "40mg", form: "Tablet", dose: "40mg", route: "Oral", frequency: "OD", duration: "30 days", quantity: 30, indication: "Fluid overload", priority: "Routine", setting: "Inpatient", status: "Verified", controlled: false, orderedAt: "07:00", verifiedBy: "Pharm. Zainab Hussain", alerts: [] },
  { id: "ord-7", patientId: "pp-1", prescriber: "Dr. Ahsan Malik", medicationName: "Lisinopril", genericName: "Lisinopril", strength: "10mg", form: "Tablet", dose: "10mg", route: "Oral", frequency: "OD", duration: "30 days", quantity: 30, indication: "Hypertension", priority: "Routine", setting: "Outpatient", status: "Ready", controlled: false, orderedAt: "06:50", verifiedBy: "Pharm. Zainab Hussain", alerts: [] },
  { id: "ord-8", patientId: "pp-4", prescriber: "Dr. Bilal Chaudhry", medicationName: "Aspirin", genericName: "Aspirin", strength: "75mg", form: "Tablet", dose: "75mg", route: "Oral", frequency: "OD", duration: "Ongoing", quantity: 30, indication: "Secondary MI prevention", priority: "Routine", setting: "Inpatient", status: "Dispensed", controlled: false, orderedAt: "06:30", verifiedBy: "Pharm. Zainab Hussain", alerts: [] },
];

export const getOrders = () => mockRequest([...orders]);
export const getOrderById = (id: string) => mockRequest(orders.find((o) => o.id === id) ?? null);

export function verifyOrder(id: string, pharmacist: string) {
  const o = orders.find((x) => x.id === id);
  if (o) { o.status = "Verified"; o.verifiedBy = pharmacist; }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function holdOrder(id: string, reason: string) {
  const o = orders.find((x) => x.id === id);
  if (o) { o.status = "On Hold"; o.holdReason = reason; }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function requestClarification(id: string, note: string) {
  const o = orders.find((x) => x.id === id);
  if (o) { o.status = "Clarification Required"; o.holdReason = note; }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function markReady(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o && o.status === "Verified") o.status = "Ready";
  orders = [...orders];
  return mockRequest([...orders]);
}

export function markDispensed(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "Dispensed";
  orders = [...orders];
  return mockRequest([...orders]);
}

export function cancelOrder(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "Cancelled";
  orders = [...orders];
  return mockRequest([...orders]);
}
