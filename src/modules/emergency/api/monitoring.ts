import { mockRequest } from "@shared/lib/api/client";

// Continuous observations — append-only, never overwrites a previous
// reading, so the trend is always the real recorded history.

export interface VitalReading {
  id: string;
  encounterId: string;
  at: string;
  bp?: string;
  hr?: number;
  rr?: number;
  temp?: number;
  spo2?: number;
  painScore?: number;
  recordedBy: string;
}

let readings: VitalReading[] = [
  { id: "vr-1", encounterId: "enc-1", at: "07:43", bp: "148/92", hr: 102, spo2: 96, recordedBy: "Nurse Amina Riaz" },
  { id: "vr-2", encounterId: "enc-1", at: "08:15", bp: "138/88", hr: 94, spo2: 97, recordedBy: "Nurse Amina Riaz" },
  { id: "vr-3", encounterId: "enc-3", at: "08:08", bp: "138/85", hr: 96, spo2: 89, recordedBy: "Nurse Amina Riaz" },
  { id: "vr-4", encounterId: "enc-3", at: "08:40", hr: 90, spo2: 92, recordedBy: "Nurse Amina Riaz" },
  { id: "vr-5", encounterId: "enc-2", at: "07:57", bp: "100/68", hr: 118, spo2: 94, recordedBy: "Nurse Hamza Iqbal" },
  { id: "vr-6", encounterId: "enc-2", at: "08:20", bp: "108/70", hr: 110, spo2: 96, recordedBy: "Nurse Hamza Iqbal" },
  { id: "vr-7", encounterId: "enc-7", at: "08:27", bp: "88/54", hr: 128, spo2: 85, recordedBy: "Nurse Hamza Iqbal" },
  { id: "vr-8", encounterId: "enc-7", at: "08:35", bp: "96/60", hr: 118, spo2: 90, recordedBy: "Nurse Hamza Iqbal" },
];

export const getVitalsForEncounter = (encounterId: string) => mockRequest(readings.filter((r) => r.encounterId === encounterId).sort((a, b) => a.at.localeCompare(b.at)));
export const getLatestVitalsByEncounter = () => mockRequest([...readings]);

export function recordVitals(encounterId: string, vitals: Omit<VitalReading, "id" | "encounterId" | "at" | "recordedBy">, recordedBy: string) {
  const rec: VitalReading = { ...vitals, id: `vr-${Date.now()}`, encounterId, at: "just now", recordedBy };
  readings = [...readings, rec];
  return mockRequest(rec);
}
