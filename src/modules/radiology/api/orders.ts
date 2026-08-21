import { mockRequest } from "@shared/lib/api/client";

// RadiologyOrder — the FHIR ServiceRequest-equivalent concept. Status
// lifecycle is condensed from the full 16-state spec chain (Ordered →
// Received → Reviewed → Scheduled → CheckedIn → Preparation → Ready →
// InProgress → Acquired → Processing → Completed → RadiologistReview →
// ReportDraft → ReportVerification → Finalized → ResultDelivered) into
// 7 states that still tell the real clinical story without a dozen
// screens that would only ever show "nothing changed yet" between them.
// Appointment fields (room/technician/radiologist/scheduledAt) live
// directly on the order rather than a separate Appointment entity —
// once scheduled, the order IS the appointment in this mock.

export type OrderPriority = "Routine" | "Urgent" | "STAT" | "Emergency";
export type OrderStatus = "Ordered" | "Scheduled" | "Checked-In" | "In Progress" | "Awaiting Report" | "Report Draft" | "Finalized" | "Cancelled";
export type Modality = "CT" | "MRI" | "X-Ray" | "Ultrasound" | "Mammography";

export interface RadiologyOrder {
  id: string;
  patientId: string;
  orderingDoctor: string;
  study: string;
  modality: Modality;
  bodyPart: string;
  laterality?: "Left" | "Right" | "Bilateral";
  indication: string;
  priority: OrderPriority;
  contrastRequired: boolean;
  status: OrderStatus;
  scheduledAt?: string;
  room?: string;
  technician?: string;
  radiologist?: string;
  orderedAt: string;
}

let orders: RadiologyOrder[] = [
  { id: "rord-1", patientId: "rp-1", orderingDoctor: "Dr. Ahsan Malik", study: "CT Chest with Contrast", modality: "CT", bodyPart: "Chest", indication: "Suspected pneumonia, rule out embolism", priority: "Urgent", contrastRequired: true, status: "Ordered", orderedAt: "07:30" },
  { id: "rord-2", patientId: "rp-2", orderingDoctor: "Dr. Sana Riaz", study: "MRI Brain", modality: "MRI", bodyPart: "Brain", indication: "Chronic headache, rule out mass", priority: "Routine", contrastRequired: false, status: "Ordered", orderedAt: "07:45" },
  { id: "rord-3", patientId: "rp-3", orderingDoctor: "Dr. Bilal Chaudhry", study: "X-Ray Chest", modality: "X-Ray", bodyPart: "Chest", indication: "COPD follow-up", priority: "Routine", contrastRequired: false, status: "Scheduled", scheduledAt: "09:00", room: "XR-1", technician: "Tech. Hamza Iqbal", orderedAt: "07:00" },
  { id: "rord-4", patientId: "rp-4", orderingDoctor: "Dr. Ahsan Malik", study: "Ultrasound Abdomen", modality: "Ultrasound", bodyPart: "Abdomen", indication: "Abdominal pain, pregnant patient", priority: "Urgent", contrastRequired: false, status: "Checked-In", scheduledAt: "08:30", room: "US-1", technician: "Tech. Hamza Iqbal", orderedAt: "07:15" },
  { id: "rord-5", patientId: "rp-5", orderingDoctor: "Dr. Sana Riaz", study: "MRI Spine with Contrast", modality: "MRI", bodyPart: "Spine", indication: "Chronic back pain, rule out disc herniation", priority: "STAT", contrastRequired: true, status: "In Progress", scheduledAt: "08:00", room: "MRI-1", technician: "Tech. Hamza Iqbal", orderedAt: "06:50" },
  { id: "rord-6", patientId: "rp-1", orderingDoctor: "Dr. Ahsan Malik", study: "CT Abdomen", modality: "CT", bodyPart: "Abdomen", indication: "Follow-up post-treatment", priority: "Routine", contrastRequired: true, status: "Awaiting Report", scheduledAt: "07:00", room: "CT-1", technician: "Tech. Hamza Iqbal", radiologist: "Dr. Radiologist Iqra Sheikh", orderedAt: "06:00" },
  { id: "rord-7", patientId: "rp-3", orderingDoctor: "Dr. Bilal Chaudhry", study: "CT Chest", modality: "CT", bodyPart: "Chest", indication: "Lung nodule follow-up", priority: "Routine", contrastRequired: false, status: "Finalized", scheduledAt: "2026-08-19 09:00", room: "CT-1", technician: "Tech. Hamza Iqbal", radiologist: "Dr. Radiologist Iqra Sheikh", orderedAt: "2026-08-19 08:00" },
];

export const getOrders = () => mockRequest([...orders]);
export const getOrderById = (id: string) => mockRequest(orders.find((o) => o.id === id) ?? null);

export function scheduleOrder(id: string, scheduledAt: string, room: string, technician: string) {
  const o = orders.find((x) => x.id === id);
  if (o) { o.status = "Scheduled"; o.scheduledAt = scheduledAt; o.room = room; o.technician = technician; }
  orders = [...orders];
  return mockRequest([...orders]);
}

export function checkInOrder(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "Checked-In";
  orders = [...orders];
  return mockRequest([...orders]);
}

export function startProcedure(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "In Progress";
  orders = [...orders];
  return mockRequest([...orders]);
}

export function completeAcquisition(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "Awaiting Report";
  orders = [...orders];
  return mockRequest([...orders]);
}

export function assignRadiologist(id: string, radiologist: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.radiologist = radiologist;
  orders = [...orders];
  return mockRequest([...orders]);
}

export function setOrderStatus(id: string, status: OrderStatus) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = status;
  orders = [...orders];
  return mockRequest([...orders]);
}

export function cancelOrder(id: string) {
  const o = orders.find((x) => x.id === id);
  if (o) o.status = "Cancelled";
  orders = [...orders];
  return mockRequest([...orders]);
}
