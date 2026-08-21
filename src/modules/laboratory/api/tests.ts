import { mockRequest } from "@shared/lib/api/client";

// Test catalog — never hard-code tests in page code. Reference ranges are
// numeric where applicable; text-only tests (culture, urinalysis) use
// refRangeText instead. Critical thresholds drive the critical-result
// workflow, not the flag itself (flag is descriptive, not a decision).

export type LabSection = "Hematology" | "Chemistry" | "Coagulation" | "Microbiology" | "Urinalysis" | "Immunology";

export interface LabTest {
  id: string;
  code: string;
  name: string;
  section: LabSection;
  sampleType: string;
  container: string;
  unit?: string;
  refLow?: number;
  refHigh?: number;
  refRangeText?: string;
  criticalLow?: number;
  criticalHigh?: number;
  method: string;
  tatHours: number;
}

const tests: LabTest[] = [
  { id: "t-hgb", code: "HGB", name: "Hemoglobin", section: "Hematology", sampleType: "Whole Blood", container: "EDTA (Lavender)", unit: "g/dL", refLow: 13, refHigh: 17, criticalLow: 6.5, criticalHigh: 20, method: "Automated Hematology Analyzer", tatHours: 2 },
  { id: "t-wbc", code: "WBC", name: "White Blood Cell Count", section: "Hematology", sampleType: "Whole Blood", container: "EDTA (Lavender)", unit: "x10^9/L", refLow: 4, refHigh: 11, criticalLow: 1, criticalHigh: 30, method: "Automated Hematology Analyzer", tatHours: 2 },
  { id: "t-plt", code: "PLT", name: "Platelet Count", section: "Hematology", sampleType: "Whole Blood", container: "EDTA (Lavender)", unit: "x10^9/L", refLow: 150, refHigh: 450, criticalLow: 20, criticalHigh: 1000, method: "Automated Hematology Analyzer", tatHours: 2 },
  { id: "t-hct", code: "HCT", name: "Hematocrit", section: "Hematology", sampleType: "Whole Blood", container: "EDTA (Lavender)", unit: "%", refLow: 38, refHigh: 50, method: "Automated Hematology Analyzer", tatHours: 2 },
  { id: "t-esr", code: "ESR", name: "Erythrocyte Sedimentation Rate", section: "Hematology", sampleType: "Whole Blood", container: "EDTA (Lavender)", unit: "mm/hr", refLow: 0, refHigh: 20, method: "Westergren", tatHours: 3 },
  { id: "t-glu", code: "GLU", name: "Glucose, Fasting", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 70, refHigh: 100, criticalLow: 40, criticalHigh: 450, method: "Hexokinase", tatHours: 2 },
  { id: "t-crea", code: "CREA", name: "Creatinine", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 0.6, refHigh: 1.3, criticalHigh: 7, method: "Jaffe", tatHours: 2 },
  { id: "t-urea", code: "UREA", name: "Urea", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 15, refHigh: 45, method: "Enzymatic UV", tatHours: 2 },
  { id: "t-alt", code: "ALT", name: "Alanine Aminotransferase", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "U/L", refLow: 7, refHigh: 56, method: "IFCC", tatHours: 3 },
  { id: "t-ast", code: "AST", name: "Aspartate Aminotransferase", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "U/L", refLow: 10, refHigh: 40, method: "IFCC", tatHours: 3 },
  { id: "t-na", code: "NA", name: "Sodium", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mmol/L", refLow: 135, refHigh: 145, criticalLow: 120, criticalHigh: 160, method: "ISE", tatHours: 2 },
  { id: "t-k", code: "K", name: "Potassium", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mmol/L", refLow: 3.5, refHigh: 5.1, criticalLow: 2.5, criticalHigh: 6.5, method: "ISE", tatHours: 2 },
  { id: "t-chol", code: "CHOL", name: "Total Cholesterol", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 0, refHigh: 200, method: "Enzymatic", tatHours: 4 },
  { id: "t-ldl", code: "LDL", name: "LDL Cholesterol", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 0, refHigh: 130, method: "Calculated", tatHours: 4 },
  { id: "t-hdl", code: "HDL", name: "HDL Cholesterol", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 40, refHigh: 999, method: "Enzymatic", tatHours: 4 },
  { id: "t-tg", code: "TG", name: "Triglycerides", section: "Chemistry", sampleType: "Serum", container: "SST (Gold)", unit: "mg/dL", refLow: 0, refHigh: 150, method: "Enzymatic", tatHours: 4 },
  { id: "t-hba1c", code: "HBA1C", name: "Hemoglobin A1c", section: "Immunology", sampleType: "Whole Blood", container: "EDTA (Lavender)", unit: "%", refLow: 4, refHigh: 5.6, method: "HPLC", tatHours: 4 },
  { id: "t-tsh", code: "TSH", name: "Thyroid Stimulating Hormone", section: "Immunology", sampleType: "Serum", container: "SST (Gold)", unit: "mIU/L", refLow: 0.4, refHigh: 4, method: "Chemiluminescence", tatHours: 6 },
  { id: "t-ptinr", code: "PTINR", name: "Prothrombin Time / INR", section: "Coagulation", sampleType: "Plasma", container: "Sodium Citrate (Blue)", unit: "INR", refLow: 0.8, refHigh: 1.2, criticalHigh: 5, method: "Clot-based", tatHours: 2 },
  { id: "t-aptt", code: "APTT", name: "Activated Partial Thromboplastin Time", section: "Coagulation", sampleType: "Plasma", container: "Sodium Citrate (Blue)", unit: "sec", refLow: 25, refHigh: 35, method: "Clot-based", tatHours: 2 },
  { id: "t-ua", code: "UA", name: "Urinalysis, Complete", section: "Urinalysis", sampleType: "Urine", container: "Sterile Urine Cup", refRangeText: "No abnormal findings", method: "Dipstick + Microscopy", tatHours: 3 },
  { id: "t-ucult", code: "UCULT", name: "Urine Culture", section: "Microbiology", sampleType: "Urine", container: "Sterile Urine Cup", refRangeText: "No growth", method: "Culture", tatHours: 48 },
  { id: "t-bcult", code: "BCULT", name: "Blood Culture", section: "Microbiology", sampleType: "Whole Blood", container: "Blood Culture Bottle", refRangeText: "No growth", method: "Culture", tatHours: 72 },
];

export interface LabPanel {
  id: string;
  name: string;
  testIds: string[];
}

const panels: LabPanel[] = [
  { id: "panel-cbc", name: "Complete Blood Count (CBC)", testIds: ["t-hgb", "t-wbc", "t-plt", "t-hct"] },
  { id: "panel-renal", name: "Renal Function Panel", testIds: ["t-crea", "t-urea", "t-na", "t-k"] },
  { id: "panel-liver", name: "Liver Function Panel", testIds: ["t-alt", "t-ast"] },
  { id: "panel-lipid", name: "Lipid Panel", testIds: ["t-chol", "t-ldl", "t-hdl", "t-tg"] },
  { id: "panel-coag", name: "Coagulation Panel", testIds: ["t-ptinr", "t-aptt"] },
];

export const getTests = () => mockRequest([...tests]);
export const getTestById = (id: string) => tests.find((t) => t.id === id);
export const getPanels = () => mockRequest([...panels]);
