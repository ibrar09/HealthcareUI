import { mockRequest } from "@shared/lib/api/client";

export interface LabPatient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: "Male" | "Female";
  mrn: string;
  ward?: string;
  setting: "Outpatient" | "Inpatient" | "Emergency";
}

const patients: LabPatient[] = [
  { id: "lp-1", name: "Rashid Latif", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80", age: 52, gender: "Male", mrn: "MRN-2026-014401", setting: "Outpatient" },
  { id: "lp-2", name: "Sadia Chaudhry", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", age: 38, gender: "Female", mrn: "MRN-2026-014402", setting: "Inpatient", ward: "Ward 2A" },
  { id: "lp-3", name: "Imran Baig", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", age: 29, gender: "Male", mrn: "MRN-2026-014403", setting: "Outpatient" },
  { id: "lp-4", name: "Nadia Aslam", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&auto=format&fit=crop&q=80", age: 45, gender: "Female", mrn: "MRN-2026-014404", setting: "Emergency" },
  { id: "lp-5", name: "Farhan Sheikh", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop&q=80", age: 61, gender: "Male", mrn: "MRN-2026-014405", setting: "Inpatient", ward: "ICU" },
  { id: "lp-6", name: "Zainab Malik", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80", age: 33, gender: "Female", mrn: "MRN-2026-014406", setting: "Outpatient" },
  { id: "lp-7", name: "Adeel Rana", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80", age: 47, gender: "Male", mrn: "MRN-2026-014407", setting: "Outpatient" },
  { id: "lp-8", name: "Hira Yousuf", avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&auto=format&fit=crop&q=80", age: 24, gender: "Female", mrn: "MRN-2026-014408", setting: "Emergency" },
];

export const getLabPatients = () => mockRequest([...patients]);
export const getLabPatientById = (id: string) => mockRequest(patients.find((p) => p.id === id) ?? null);
