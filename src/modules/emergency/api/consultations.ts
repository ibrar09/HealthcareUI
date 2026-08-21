import { mockRequest } from "@shared/lib/api/client";

export type ConsultStatus = "Requested" | "Accepted" | "In Progress" | "Completed" | "Declined";

export interface Consultation {
  id: string;
  encounterId: string;
  patientId: string;
  specialty: string;
  consultant: string;
  status: ConsultStatus;
  requestedAt: string;
  recommendation?: string;
}

let consultations: Consultation[] = [
  { id: "econs-1", encounterId: "enc-2", patientId: "ep-2", specialty: "Orthopedics", consultant: "Dr. Kamran Shah", status: "Accepted", requestedAt: "08:10" },
  { id: "econs-2", encounterId: "enc-7", patientId: "ep-7", specialty: "Toxicology / ICU", consultant: "Dr. Nadia Farooq", status: "Requested", requestedAt: "08:32" },
];

export const getConsultations = () => mockRequest([...consultations]);
export const getConsultationsForEncounter = (encounterId: string) => mockRequest(consultations.filter((c) => c.encounterId === encounterId));

export function requestConsultation(encounterId: string, patientId: string, specialty: string, consultant: string) {
  const rec: Consultation = { id: `econs-${Date.now()}`, encounterId, patientId, specialty, consultant, status: "Requested", requestedAt: "just now" };
  consultations = [rec, ...consultations];
  return mockRequest(rec);
}

export function advanceConsultation(id: string) {
  const c = consultations.find((x) => x.id === id);
  if (!c) return mockRequest([...consultations]);
  const next: Record<ConsultStatus, ConsultStatus> = { Requested: "Accepted", Accepted: "In Progress", "In Progress": "Completed", Completed: "Completed", Declined: "Declined" };
  c.status = next[c.status];
  consultations = [...consultations];
  return mockRequest([...consultations]);
}

export function completeConsultation(id: string, recommendation: string) {
  const c = consultations.find((x) => x.id === id);
  if (c) { c.status = "Completed"; c.recommendation = recommendation; }
  consultations = [...consultations];
  return mockRequest([...consultations]);
}
