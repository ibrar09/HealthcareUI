import { mockRequest } from "@shared/lib/api/client";

export interface RadiologyPatient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: "Male" | "Female";
  mrn: string;
  allergies: { substance: string; reaction: string }[];
  pregnant?: boolean;
  hasImplants?: boolean;
}

const patients: RadiologyPatient[] = [
  { id: "rp-1", name: "Ahmed Ali", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80", age: 45, gender: "Male", mrn: "MRN-2026-013301", allergies: [{ substance: "Iodine contrast", reaction: "Mild hives (2023)" }] },
  { id: "rp-2", name: "Sara Khan", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80", age: 34, gender: "Female", mrn: "MRN-2026-013302", allergies: [], hasImplants: true },
  { id: "rp-3", name: "Omar Ahmed", avatar: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=150&auto=format&fit=crop&q=80", age: 58, gender: "Male", mrn: "MRN-2026-013303", allergies: [] },
  { id: "rp-4", name: "Mehwish Tariq", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=150&auto=format&fit=crop&q=80", age: 29, gender: "Female", mrn: "MRN-2026-013304", allergies: [], pregnant: true },
  { id: "rp-5", name: "Bilal Nasir", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&auto=format&fit=crop&q=80", age: 62, gender: "Male", mrn: "MRN-2026-013305", allergies: [{ substance: "Gadolinium", reaction: "Nausea (2022)" }] },
];

export const getRadiologyPatients = () => mockRequest([...patients]);
export const getRadiologyPatientById = (id: string) => mockRequest(patients.find((p) => p.id === id) ?? null);
