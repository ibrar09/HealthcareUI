import { mockRequest } from "@shared/lib/api/client";

// Includes one unidentified patient under a temporary emergency identity
// (§5, §87) — never deleted or merged silently; identity reconciliation
// would happen later through MPI matching in a real system.

export interface EDPatient {
  id: string;
  name: string;
  avatar: string;
  age: number | null;
  gender: "Male" | "Female" | "Unknown";
  mrn: string;
  allergies: { substance: string; reaction: string }[];
  isTemporaryIdentity?: boolean;
}

const patients: EDPatient[] = [
  { id: "ep-1", name: "Junaid Aslam", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80", age: 45, gender: "Male", mrn: "MRN-2026-015501", allergies: [{ substance: "Penicillin", reaction: "Hives" }] },
  { id: "ep-2", name: "Saima Riaz", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", age: 29, gender: "Female", mrn: "MRN-2026-015502", allergies: [] },
  { id: "ep-3", name: "Waseem Anjum", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", age: 62, gender: "Male", mrn: "MRN-2026-015503", allergies: [{ substance: "Aspirin", reaction: "GI bleed history" }] },
  { id: "ep-4", name: "Mahnoor Fatima", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&auto=format&fit=crop&q=80", age: 7, gender: "Female", mrn: "MRN-2026-015504", allergies: [] },
  { id: "ep-5", name: "Shahzad Iqbal", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop&q=80", age: 55, gender: "Male", mrn: "MRN-2026-015505", allergies: [] },
  { id: "ep-6", name: "Rabia Saleem", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80", age: 34, gender: "Female", mrn: "MRN-2026-015506", allergies: [{ substance: "Latex", reaction: "Contact dermatitis" }] },
  { id: "ep-7", name: "Unidentified Patient", avatar: "https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?w=150&auto=format&fit=crop&q=80", age: null, gender: "Unknown", mrn: "UNKNOWN-ED-2026-00021", allergies: [], isTemporaryIdentity: true },
  { id: "ep-8", name: "Kamran Butt", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80", age: 41, gender: "Male", mrn: "MRN-2026-015508", allergies: [] },
];

export const getEDPatients = () => mockRequest([...patients]);
export const getEDPatientById = (id: string) => mockRequest(patients.find((p) => p.id === id) ?? null);
