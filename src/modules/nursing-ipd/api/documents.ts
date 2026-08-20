import { mockRequest } from "@shared/lib/api/client";

// Metadata only — this mock world doesn't implement real file storage,
// so no upload/download is offered here, only the authenticated record
// list a nurse would see. Not a stand-in for real document handling.

export type DocumentType = "Consent Form" | "Discharge Summary" | "Imaging Report" | "Lab Report";

export interface PatientDocument {
  id: string;
  patientId: string;
  title: string;
  type: DocumentType;
  date: string;
}

const documents: PatientDocument[] = [
  { id: "doc-1", patientId: "np-1", title: "Admission Consent", type: "Consent Form", date: "2026-08-15" },
  { id: "doc-2", patientId: "np-1", title: "Chest X-Ray Report", type: "Imaging Report", date: "2026-08-17" },
  { id: "doc-3", patientId: "np-2", title: "Surgical Consent — Appendectomy", type: "Consent Form", date: "2026-08-16" },
  { id: "doc-4", patientId: "np-4", title: "Basic Metabolic Panel Report", type: "Lab Report", date: "2026-08-17" },
  { id: "doc-5", patientId: "np-6", title: "Wound Culture Report", type: "Lab Report", date: "2026-08-17" },
];

export const getDocuments = () => mockRequest([...documents]);
