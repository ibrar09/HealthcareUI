import { mockRequest } from "@shared/lib/api/client";

export interface ReconciliationItem {
  medicationName: string;
  home: boolean;
  hospital: boolean;
  decision: "Continue" | "Stop" | "Modify" | "New" | "Unclear";
}

const seed: Record<string, ReconciliationItem[]> = {
  "pp-2": [
    { medicationName: "Metformin 500mg BID", home: true, hospital: true, decision: "Continue" },
    { medicationName: "Atorvastatin 20mg OD", home: true, hospital: false, decision: "Unclear" },
    { medicationName: "Furosemide 40mg OD", home: false, hospital: true, decision: "New" },
  ],
  "pp-4": [
    { medicationName: "Aspirin 75mg OD", home: true, hospital: true, decision: "Continue" },
    { medicationName: "Clopidogrel 75mg OD", home: false, hospital: true, decision: "New" },
    { medicationName: "Ibuprofen PRN", home: true, hospital: false, decision: "Stop" },
  ],
};

export function getReconciliation(patientId: string) {
  return mockRequest(seed[patientId] ?? []);
}

export function saveReconciliation(patientId: string, items: ReconciliationItem[]) {
  seed[patientId] = items;
  return mockRequest([...items]);
}
