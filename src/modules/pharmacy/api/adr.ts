import { mockRequest } from "@shared/lib/api/client";

export interface AdverseReaction {
  id: string;
  patientId: string;
  medicationName: string;
  reaction: string;
  severity: "Mild" | "Moderate" | "Severe";
  onset: string;
  actionTaken: string;
  reportedBy: string;
  status: "Reported" | "Reviewed";
  reportedAt: string;
}

let reactions: AdverseReaction[] = [
  { id: "adr-1", patientId: "pp-2", medicationName: "Vancomycin", reaction: "Red man syndrome — flushing and pruritus", severity: "Moderate", onset: "During infusion", actionTaken: "Infusion slowed, antihistamine administered", reportedBy: "Nurse Amina Riaz", status: "Reported", reportedAt: "2026-08-19 14:20" },
];

export const getAdrs = () => mockRequest([...reactions]);

export function reportAdr(input: Omit<AdverseReaction, "id" | "status" | "reportedAt">) {
  const rec: AdverseReaction = { ...input, id: `adr-${Date.now()}`, status: "Reported", reportedAt: "just now" };
  reactions = [rec, ...reactions];
  return mockRequest(rec);
}

export function reviewAdr(id: string) {
  const r = reactions.find((x) => x.id === id);
  if (r) r.status = "Reviewed";
  reactions = [...reactions];
  return mockRequest([...reactions]);
}
