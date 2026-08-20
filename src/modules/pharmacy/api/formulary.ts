import { mockRequest } from "@shared/lib/api/client";

export type FormularyCategory = "Preferred" | "Restricted" | "Non-Formulary" | "Specialty" | "Emergency";

export interface FormularyItem {
  id: string;
  medicationName: string;
  genericName: string;
  form: string;
  route: string;
  category: FormularyCategory;
  restrictionNote?: string;
  alternative?: string;
}

const formulary: FormularyItem[] = [
  { id: "form-1", medicationName: "Amoxicillin", genericName: "Amoxicillin", form: "Capsule", route: "Oral", category: "Preferred" },
  { id: "form-2", medicationName: "Vancomycin", genericName: "Vancomycin", form: "Injection", route: "IV", category: "Restricted", restrictionNote: "Requires Infectious Disease approval for >7 days" },
  { id: "form-3", medicationName: "Morphine Sulfate", genericName: "Morphine", form: "Injection", route: "IV", category: "Restricted", restrictionNote: "Controlled substance — authorized prescribers only" },
  { id: "form-4", medicationName: "Metformin", genericName: "Metformin", form: "Tablet", route: "Oral", category: "Preferred" },
  { id: "form-5", medicationName: "Experimental Biologic X", genericName: "N/A", form: "Injection", route: "SC", category: "Non-Formulary", alternative: "Consider formulary-listed biologic per specialty guideline" },
  { id: "form-6", medicationName: "Insulin Glargine", genericName: "Insulin Glargine", form: "Injection", route: "SC", category: "Specialty" },
  { id: "form-7", medicationName: "Epinephrine", genericName: "Epinephrine", form: "Injection", route: "IM/IV", category: "Emergency" },
  { id: "form-8", medicationName: "Furosemide", genericName: "Furosemide", form: "Tablet", route: "Oral", category: "Preferred" },
];

export const getFormulary = () => mockRequest([...formulary]);
