import { mockRequest } from "@shared/lib/api/client";
import { setEncounterStatus, getEncounterSync } from "./encounters";
import { releaseBed } from "./beds";
import type { EncounterStatus } from "./encounters";

export type DispositionType = "Discharge Home" | "Admit" | "Transfer" | "Observation" | "Referred" | "Left Before Treatment" | "Against Medical Advice" | "Deceased";

const DISPOSITION_TO_STATUS: Record<DispositionType, EncounterStatus> = {
  "Discharge Home": "Discharged", Admit: "Admitted", Transfer: "Transferred", Observation: "Observation",
  Referred: "Discharged", "Left Before Treatment": "LWBS", "Against Medical Advice": "AMA", Deceased: "Deceased",
};

export interface Disposition {
  id: string;
  encounterId: string;
  patientId: string;
  type: DispositionType;
  decidedBy: string;
  decidedAt: string;
  notes: string;
  destinationWard?: string;
  instructions?: string;
}

let dispositions: Disposition[] = [];

export const getDispositions = () => mockRequest([...dispositions]);
export const getDispositionForEncounter = (encounterId: string) => mockRequest(dispositions.find((d) => d.encounterId === encounterId) ?? null);

export function recordDisposition(encounterId: string, patientId: string, type: DispositionType, decidedBy: string, notes: string, destinationWard?: string, instructions?: string) {
  const rec: Disposition = { id: `disp-${Date.now()}`, encounterId, patientId, type, decidedBy, decidedAt: "just now", notes, destinationWard, instructions };
  dispositions = [rec, ...dispositions];
  setEncounterStatus(encounterId, DISPOSITION_TO_STATUS[type]);
  const encounter = getEncounterSync(encounterId);
  if (encounter?.bedId) releaseBed(encounter.bedId);
  return mockRequest(rec);
}
