import { mockRequest } from "@shared/lib/api/client";

export type AmbulanceStatus = "Dispatched" | "En Route" | "Arrived" | "Handed Over";

export interface AmbulanceRecord {
  id: string;
  ambulanceId: string;
  crew: string;
  dispatchedAt: string;
  arrivedAt?: string;
  encounterId?: string;
  prehospitalNotes: string;
  status: AmbulanceStatus;
}

let records: AmbulanceRecord[] = [
  { id: "amb-1", ambulanceId: "AMB-07", crew: "Paramedic Usman Tariq", dispatchedAt: "07:50", arrivedAt: "07:55", encounterId: "enc-2", prehospitalNotes: "MVC, restrained driver, GCS 14, BP 100/68 en route. Splinted left leg.", status: "Handed Over" },
  { id: "amb-2", ambulanceId: "AMB-03", crew: "Paramedic Bilal Yousaf", dispatchedAt: "08:05", arrivedAt: "08:25", encounterId: "enc-7", prehospitalNotes: "Found unresponsive by police, no ID. Naloxone 0.4mg given en route, partial response.", status: "Handed Over" },
  { id: "amb-3", ambulanceId: "AMB-11", crew: "Paramedic Zeeshan Ali", dispatchedAt: "08:38", prehospitalNotes: "Elderly fall, hip pain, stable vitals.", status: "En Route" },
];

export const getAmbulanceRecords = () => mockRequest([...records]);

export function advanceAmbulanceStatus(id: string) {
  const r = records.find((x) => x.id === id);
  if (!r) return mockRequest([...records]);
  const next: Record<AmbulanceStatus, AmbulanceStatus> = { Dispatched: "En Route", "En Route": "Arrived", Arrived: "Handed Over", "Handed Over": "Handed Over" };
  r.status = next[r.status];
  if (r.status === "Arrived") r.arrivedAt = "just now";
  records = [...records];
  return mockRequest([...records]);
}
