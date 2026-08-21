import { mockRequest } from "@shared/lib/api/client";

export interface EDProcedure {
  id: string;
  encounterId: string;
  patientId: string;
  name: string;
  performer: string;
  at: string;
  indication: string;
  findings: string;
  outcome: "Successful" | "Complicated" | "Aborted";
}

let procedures: EDProcedure[] = [
  { id: "eproc-1", encounterId: "enc-2", patientId: "ep-2", name: "IV Access — Large Bore x2", performer: "Nurse Hamza Iqbal", at: "07:58", indication: "Trauma resuscitation access", findings: "Bilateral 16G IV established", outcome: "Successful" },
  { id: "eproc-2", encounterId: "enc-7", patientId: "ep-7", name: "Airway Assessment & Oxygen Support", performer: "Dr. Sana Riaz", at: "08:26", indication: "Altered consciousness, SpO2 85%", findings: "Airway patent, non-rebreather mask applied", outcome: "Successful" },
  { id: "eproc-3", encounterId: "enc-5", patientId: "ep-5", name: "Splinting — Right Ankle", performer: "Dr. Bilal Chaudhry", at: "08:24", indication: "Suspected ankle fracture", findings: "Splint applied, neurovascular status intact", outcome: "Successful" },
];

export const getProcedures = () => mockRequest([...procedures]);
export const getProceduresForEncounter = (encounterId: string) => mockRequest(procedures.filter((p) => p.encounterId === encounterId));

export function addProcedure(encounterId: string, patientId: string, name: string, performer: string, indication: string, findings: string, outcome: EDProcedure["outcome"]) {
  const rec: EDProcedure = { id: `eproc-${Date.now()}`, encounterId, patientId, name, performer, at: "just now", indication, findings, outcome };
  procedures = [rec, ...procedures];
  return mockRequest(rec);
}
