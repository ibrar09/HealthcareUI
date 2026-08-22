import { mockRequest } from "@shared/lib/api/client";
import { createCriticalAlert } from "./criticalResults";
import { getEncounterSync } from "./encounters";

// Lab + Radiology + Medication orders combined — all three flow through
// the same ED order lifecycle (Ordered→In Progress→Completed, with a
// Critical outcome), so one tracked list serves all of them rather than
// three near-identical screens. In a real system each type would still
// route to the owning Lab/Radiology/Pharmacy service, never a separate
// ED-local database — this mock keeps that distinction conceptually,
// just without a live cross-module link (see module isolation note).

export type OrderType = "Lab" | "Radiology" | "Medication";
export type OrderPriority = "STAT" | "Urgent" | "Routine";
export type OrderStatus = "Ordered" | "In Progress" | "Completed" | "Critical";

export interface EDOrder {
  id: string;
  encounterId: string;
  patientId: string;
  type: OrderType;
  description: string;
  priority: OrderPriority;
  status: OrderStatus;
  orderedBy: string;
  orderedAt: string;
  resultSummary?: string;
}

let orders: EDOrder[] = [
  { id: "eord-1", encounterId: "enc-1", patientId: "ep-1", type: "Lab", description: "Troponin, CK-MB", priority: "STAT", status: "Completed", orderedBy: "Dr. Ahsan Malik", orderedAt: "07:45", resultSummary: "Troponin 0.02 ng/mL (Normal)" },
  { id: "eord-2", encounterId: "enc-1", patientId: "ep-1", type: "Radiology", description: "ECG + Chest X-Ray", priority: "STAT", status: "Completed", orderedBy: "Dr. Ahsan Malik", orderedAt: "07:44", resultSummary: "ECG: Sinus tachycardia, no ST changes" },
  { id: "eord-3", encounterId: "enc-2", patientId: "ep-2", type: "Radiology", description: "CT Trauma Series", priority: "STAT", status: "In Progress", orderedBy: "Dr. Sana Riaz", orderedAt: "08:00" },
  { id: "eord-4", encounterId: "enc-2", patientId: "ep-2", type: "Medication", description: "Morphine 4mg IV", priority: "STAT", status: "Completed", orderedBy: "Dr. Sana Riaz", orderedAt: "08:02" },
  { id: "eord-5", encounterId: "enc-3", patientId: "ep-3", type: "Lab", description: "Arterial Blood Gas", priority: "Urgent", status: "Critical", orderedBy: "Dr. Ahsan Malik", orderedAt: "08:12", resultSummary: "pCO2 62 mmHg (Critical High)" },
  { id: "eord-6", encounterId: "enc-3", patientId: "ep-3", type: "Medication", description: "Nebulized Salbutamol", priority: "Urgent", status: "Completed", orderedBy: "Dr. Ahsan Malik", orderedAt: "08:14" },
  { id: "eord-7", encounterId: "enc-5", patientId: "ep-5", type: "Radiology", description: "X-Ray Ankle", priority: "Routine", status: "In Progress", orderedBy: "Dr. Bilal Chaudhry", orderedAt: "08:22" },
  { id: "eord-8", encounterId: "enc-7", patientId: "ep-7", type: "Lab", description: "CBC, Glucose, Toxicology Screen", priority: "STAT", status: "In Progress", orderedBy: "Dr. Sana Riaz", orderedAt: "08:28" },
  { id: "eord-9", encounterId: "enc-7", patientId: "ep-7", type: "Medication", description: "Naloxone 0.4mg IV", priority: "STAT", status: "Completed", orderedBy: "Dr. Sana Riaz", orderedAt: "08:29" },
];

export const getOrders = () => mockRequest([...orders]);
export const getOrdersForEncounter = (encounterId: string) => mockRequest(orders.filter((o) => o.encounterId === encounterId));

export function createOrder(encounterId: string, patientId: string, type: OrderType, description: string, priority: OrderPriority, orderedBy: string) {
  const order: EDOrder = { id: `eord-${Date.now()}`, encounterId, patientId, type, description, priority, status: "Ordered", orderedBy, orderedAt: "just now" };
  orders = [order, ...orders];
  return mockRequest(order);
}

export function advanceOrder(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o && o.status === "Ordered") o.status = "In Progress";
  orders = [...orders];
  return mockRequest([...orders]);
}

export function completeOrder(id: string, resultSummary: string, critical: boolean) {
  const o = orders.find((x) => x.id === id);
  if (o) {
    o.status = critical ? "Critical" : "Completed";
    o.resultSummary = resultSummary;
    if (critical) {
      const encounter = getEncounterSync(o.encounterId);
      if (encounter) {
        createCriticalAlert({ encounterId: o.encounterId, patientId: o.patientId, source: o.type === "Radiology" ? "Radiology" : "Lab", description: `${o.description}: ${resultSummary}`, recipientDoctor: encounter.assignedDoctor ?? "Unassigned" });
      }
    }
  }
  orders = [...orders];
  return mockRequest([...orders]);
}
