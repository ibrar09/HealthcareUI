import { mockRequest } from "@shared/lib/api/client";

export type InterventionType = "Dose Adjustment" | "Drug Interaction" | "Allergy" | "Duplicate Therapy" | "Contraindication" | "Formulary" | "Availability" | "Other";

export interface Intervention {
  id: string;
  orderId: string;
  patientId: string;
  medicationName: string;
  issueType: InterventionType;
  severity: "critical" | "high" | "medium";
  description: string;
  recommendation: string;
  status: "Open" | "Resolved";
  prescriberResponse?: string;
  createdAt: string;
}

let interventions: Intervention[] = [
  { id: "int-1", orderId: "ord-1", patientId: "pp-1", medicationName: "Amoxicillin", issueType: "Allergy", severity: "critical", description: "Patient has documented Penicillin allergy (Hives).", recommendation: "Suggest switching to a non-penicillin alternative (e.g., Azithromycin).", status: "Open", createdAt: "07:42" },
  { id: "int-2", orderId: "ord-5", patientId: "pp-3", medicationName: "Co-trimoxazole", issueType: "Allergy", severity: "critical", description: "Patient has documented Sulfa drug allergy (Rash).", recommendation: "Suggest Nitrofurantoin as an alternative for uncomplicated UTI.", status: "Open", createdAt: "08:27" },
];

export const getInterventions = () => mockRequest([...interventions]);

export function createIntervention(input: Omit<Intervention, "id" | "status" | "createdAt">) {
  const rec: Intervention = { ...input, id: `int-${Date.now()}`, status: "Open", createdAt: "just now" };
  interventions = [rec, ...interventions];
  return mockRequest(rec);
}

export function resolveIntervention(id: string, prescriberResponse: string) {
  const i = interventions.find((x) => x.id === id);
  if (i) { i.status = "Resolved"; i.prescriberResponse = prescriberResponse; }
  interventions = [...interventions];
  return mockRequest([...interventions]);
}
