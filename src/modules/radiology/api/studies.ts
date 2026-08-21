import { mockRequest } from "@shared/lib/api/client";
import { completeAcquisition } from "./orders";

// RadiologyStudy — references only. No pixel data lives here; accession
// number and study instance UID are the real DICOM/PACS identifiers a
// production system would use to retrieve images from the actual PACS,
// never duplicated into this transactional store.

export interface RadiologyStudy {
  id: string;
  orderId: string;
  patientId: string;
  accessionNumber: string;
  studyInstanceUID: string;
  modality: string;
  bodyPart: string;
  imageCount: number;
  technician: string;
  acquiredAt: string;
  quality: "Acceptable" | "Repeat Required" | "Technical Issue" | "Patient Movement";
  qualityNote?: string;
}

let studies: RadiologyStudy[] = [
  { id: "study-1", orderId: "rord-6", patientId: "rp-1", accessionNumber: "ACC-100061", studyInstanceUID: "1.2.826.0.1.100061", modality: "CT", bodyPart: "Abdomen", imageCount: 340, technician: "Tech. Hamza Iqbal", acquiredAt: "07:20", quality: "Acceptable" },
  { id: "study-2", orderId: "rord-7", patientId: "rp-3", accessionNumber: "ACC-100057", studyInstanceUID: "1.2.826.0.1.100057", modality: "CT", bodyPart: "Chest", imageCount: 280, technician: "Tech. Hamza Iqbal", acquiredAt: "2026-08-19 09:20", quality: "Acceptable" },
];

export const getStudies = () => mockRequest([...studies]);
export const getStudyByOrderId = (orderId: string) => mockRequest(studies.find((s) => s.orderId === orderId) ?? null);

export function completeStudy(orderId: string, patientId: string, modality: string, bodyPart: string, technician: string, quality: RadiologyStudy["quality"], qualityNote?: string) {
  if (studies.some((s) => s.orderId === orderId)) return mockRequest([...studies]);
  const study: RadiologyStudy = {
    id: `study-${Date.now()}`, orderId, patientId, accessionNumber: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
    studyInstanceUID: `1.2.826.0.1.${Date.now()}`, modality, bodyPart, imageCount: Math.floor(50 + Math.random() * 300),
    technician, acquiredAt: "just now", quality, qualityNote,
  };
  studies = [study, ...studies];
  completeAcquisition(orderId);
  return mockRequest(study);
}
