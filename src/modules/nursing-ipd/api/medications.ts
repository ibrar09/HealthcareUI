import { mockRequest } from "@shared/lib/api/client";
import { syncNextMedication } from "./patients";

// Medication Administration — a fuller per-patient medication schedule than
// the lightweight `nextMedication` field on NursePatient (which stays as a
// quick-glance summary for the Dashboard/My Patients/Bedside cards). This
// file is the source of truth; any status change here recomputes that
// patient's `nextMedication` so the two never disagree.

export type MedicationAdminStatus = "Scheduled" | "Due" | "Administered" | "Held" | "Refused" | "Not Available";

export interface MedicationOrder {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  route: string;
  time: string;
  status: MedicationAdminStatus;
  administeredAt?: string;
  reason?: string;
}

let orders: MedicationOrder[] = [
  { id: "med-1", patientId: "np-1", name: "Ceftriaxone", dose: "1g", route: "IV", time: "08:00", status: "Administered", administeredAt: "08:05" },
  { id: "med-2", patientId: "np-1", name: "Ceftriaxone", dose: "1g", route: "IV", time: "10:00", status: "Due" },
  { id: "med-3", patientId: "np-1", name: "Paracetamol", dose: "500mg", route: "Oral", time: "18:00", status: "Scheduled" },

  { id: "med-4", patientId: "np-2", name: "Paracetamol", dose: "1g", route: "Oral", time: "09:00", status: "Due" },
  { id: "med-5", patientId: "np-2", name: "Paracetamol", dose: "1g", route: "Oral", time: "14:00", status: "Scheduled" },

  { id: "med-6", patientId: "np-3", name: "Salbutamol", dose: "2.5mg", route: "Nebulizer", time: "08:00", status: "Administered", administeredAt: "08:10" },
  { id: "med-7", patientId: "np-3", name: "Salbutamol", dose: "2.5mg", route: "Nebulizer", time: "12:00", status: "Scheduled" },

  { id: "med-8", patientId: "np-4", name: "Insulin (Sliding Scale)", dose: "As per scale", route: "Subcutaneous", time: "08:00", status: "Administered", administeredAt: "08:00" },

  { id: "med-9", patientId: "np-5", name: "Furosemide", dose: "40mg", route: "IV", time: "08:00", status: "Administered", administeredAt: "08:15" },
  { id: "med-10", patientId: "np-5", name: "Furosemide", dose: "40mg", route: "IV", time: "11:00", status: "Due" },

  { id: "med-11", patientId: "np-6", name: "Vancomycin", dose: "1g", route: "IV", time: "08:00", status: "Administered", administeredAt: "08:20" },
  { id: "med-12", patientId: "np-6", name: "Vancomycin", dose: "1g", route: "IV", time: "16:00", status: "Scheduled" },
];

export const getMedicationOrders = () => mockRequest([...orders]);

export interface MedicationSummary {
  due: number;
  overdue: number;
  administered: number;
  scheduled: number;
}

// "Overdue" isn't its own stored status — it's a Due order whose time has
// already passed relative to the shift's current point. Since this mock
// world doesn't track a live clock, Sara Khan's 09:00 dose (the one
// scenario the dashboard's "Medication overdue" alert already references)
// is the one flagged overdue; every other "Due" order is treated as due
// now, not yet overdue.
const OVERDUE_ORDER_IDS = new Set(["med-4"]);
export const isOverdue = (order: MedicationOrder) => order.status === "Due" && OVERDUE_ORDER_IDS.has(order.id);

export function getMedicationSummary() {
  const summary: MedicationSummary = {
    due: orders.filter((o) => o.status === "Due" && !isOverdue(o)).length,
    overdue: orders.filter(isOverdue).length,
    administered: orders.filter((o) => o.status === "Administered").length,
    scheduled: orders.filter((o) => o.status === "Scheduled").length,
  };
  return mockRequest(summary);
}

function recomputeNextMedication(patientId: string) {
  const upcoming = orders
    .filter((o) => o.patientId === patientId && (o.status === "Due" || o.status === "Scheduled"))
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  syncNextMedication(
    patientId,
    upcoming ? { name: upcoming.name, dose: upcoming.dose, route: upcoming.route, time: upcoming.time, overdue: isOverdue(upcoming) } : undefined
  );
}

export function administerMedication(id: string) {
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = "Administered";
    order.administeredAt = "just now";
    recomputeNextMedication(order.patientId);
  }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function updateMedicationStatus(id: string, status: "Held" | "Refused" | "Not Available", reason: string) {
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    order.reason = reason;
    recomputeNextMedication(order.patientId);
  }
  orders = [...orders];
  return mockRequest([...orders]);
}
