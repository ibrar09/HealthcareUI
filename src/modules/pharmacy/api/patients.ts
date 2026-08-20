import { mockRequest } from "@shared/lib/api/client";

export interface PharmacyPatient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: "Male" | "Female";
  mrn: string;
  setting: "Outpatient" | "Inpatient" | "Emergency";
  ward?: string;
  allergies: { substance: string; reaction: string }[];
  conditions: string[];
}

const patients: PharmacyPatient[] = [
  { id: "pp-1", name: "Bushra Aslam", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", age: 41, gender: "Female", mrn: "MRN-2026-011201", setting: "Outpatient", allergies: [{ substance: "Penicillin", reaction: "Hives" }], conditions: ["Hypertension"] },
  { id: "pp-2", name: "Tariq Jameel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", age: 66, gender: "Male", mrn: "MRN-2026-011202", setting: "Inpatient", ward: "Ward 4B", allergies: [], conditions: ["CKD Stage 3", "Type 2 Diabetes"] },
  { id: "pp-3", name: "Hina Yousaf", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&auto=format&fit=crop&q=80", age: 29, gender: "Female", mrn: "MRN-2026-011203", setting: "Outpatient", allergies: [{ substance: "Sulfa drugs", reaction: "Rash" }], conditions: [] },
  { id: "pp-4", name: "Kashif Rana", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop&q=80", age: 58, gender: "Male", mrn: "MRN-2026-011204", setting: "Inpatient", ward: "ICU", allergies: [], conditions: ["Post-MI"] },
  { id: "pp-5", name: "Ayesha Noor", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80", age: 34, gender: "Female", mrn: "MRN-2026-011205", setting: "Emergency", allergies: [], conditions: ["Pregnancy — 2nd trimester"] },
];

export const getPharmacyPatients = () => mockRequest([...patients]);
export const getPharmacyPatientById = (id: string) => mockRequest(patients.find((p) => p.id === id) ?? null);
