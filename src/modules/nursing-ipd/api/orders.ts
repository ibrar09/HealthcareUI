import { mockRequest } from "@shared/lib/api/client";

// Clinical orders visible to nursing — a ServiceRequest-style order
// (Laboratory/Imaging), never one generic "order" form. Specimen Collection
// is the nurse-facing action on this same list (collecting a pending
// Laboratory order), not a separate data model.

export type OrderCategory = "Laboratory" | "Imaging";
export type OrderStatus = "Ordered" | "Collected" | "Final";

export interface ClinicalOrder {
  id: string;
  patientId: string;
  category: OrderCategory;
  name: string;
  orderedAt: string;
  status: OrderStatus;
  result?: string;
  collectedAt?: string;
}

let orders: ClinicalOrder[] = [
  { id: "ord-1", patientId: "np-1", category: "Laboratory", name: "Blood Culture", orderedAt: "07:30", status: "Ordered" },
  { id: "ord-2", patientId: "np-1", category: "Imaging", name: "Chest X-Ray", orderedAt: "07:35", status: "Final", result: "Bilateral lower lobe infiltrates, consistent with pneumonia." },
  { id: "ord-3", patientId: "np-3", category: "Laboratory", name: "Arterial Blood Gas", orderedAt: "08:00", status: "Ordered" },
  { id: "ord-4", patientId: "np-4", category: "Laboratory", name: "Basic Metabolic Panel", orderedAt: "07:00", status: "Final", result: "Glucose 118 mg/dL, within target range." },
  { id: "ord-5", patientId: "np-6", category: "Laboratory", name: "Wound Culture", orderedAt: "08:15", status: "Ordered" },
];

export const getOrders = () => mockRequest([...orders]);

export function collectSpecimen(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o && o.category === "Laboratory" && o.status === "Ordered") {
    o.status = "Collected";
    o.collectedAt = "just now";
  }
  orders = [...orders];
  return mockRequest([...orders]);
}
