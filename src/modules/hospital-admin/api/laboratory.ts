import { mockRequest } from "@shared/lib/api/client";
import { TODAY, DEFAULT_ACTOR } from "./core";
import { departmentConfigs } from "./facilities";
import { resolveHeadName } from "./staff";
import { patientSeeds } from "./patients";

// ============================================================================
// Laboratory (Hospital Admin's [oversight] section — HOSPITAL_ADMIN_MODULE_MAP.md)
// ============================================================================
//
// FHIR alignment (HMS_DOMAIN_STANDARDS.md §22-26):
//   Lab Order        → ServiceRequest   (LabOrder below)
//   Specimen         → Specimen         (LabSpecimen below)
//   Lab Result value → Observation      (LabObservation below)
//   Lab Report       → DiagnosticReport (LabDiagnosticReport below)
//
// This is oversight/management only, per the module map's scope rule: admin
// sees volume, turnaround, specimen/order status, and critical-result
// escalation — never result entry. Every order, specimen, and observation
// below is seeded as if the (not-yet-built) `laboratory` portal produced it;
// the only mutations this file exposes are genuinely administrative —
// capturing a one-off order (mirrors Billing's manual Capture Charge),
// cancelling an order, and acknowledging a critical result — nothing that
// would be a lab technician entering or amending a result value.
//
// Result status lifecycle (HMS_DOMAIN_STANDARDS.md §24, FHIR Observation/
// DiagnosticReport.status): registered → preliminary → final → amended →
// corrected → cancelled. `LabOrder.status` is the coarser day-to-day
// operational stage that actually drives the Work Queue (a lab has to track
// "has the specimen even been drawn yet", which FHIR's own ServiceRequest
// status doesn't grain down to) — "resulted" maps to Observation "preliminary"
// (an instrument/tech result, not yet verified), "verified" maps to "final".

export type LabTestCategory = "hematology" | "chemistry" | "microbiology" | "immunology" | "pathology" | "molecular" | "urinalysis";
export type LabSpecimenType = "blood" | "urine" | "stool" | "swab" | "tissue" | "sputum" | "csf" | "other";

// Lab Test Catalog — configurable lookup, never hardcoded (same pattern as
// Bed Types/Department Types). `code` is a LOINC-style identifier, not a
// free-text name, so results/orders reference a stable coded value per
// HMS_DOMAIN_STANDARDS.md §1's "back it with coded/structured values" rule.
export interface LabTestCatalogEntry {
  id: string;
  code: string;
  name: string;
  category: LabTestCategory;
  specimenType: LabSpecimenType;
  /** Set only for a grouped panel (e.g. CBC) — the individual analyte codes it produces as separate Observations. */
  panelComponents?: string[];
  unit?: string;
  referenceRangeText: string;
  refLow?: number;
  refHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  /** Target turnaround time, order → final result — the international lab-quality benchmark (CLSI/ISO 15189 style) Analytics measures actual TAT against. */
  turnaroundTimeHours: number;
  /** Cross-references Billing's existing BillableService catalog where one already exists (e.g. CBC-PANEL → LAB-001) — never a second, disconnected price. */
  billingCode?: string;
  active: boolean;
}

const labTestCatalog: LabTestCatalogEntry[] = [
  { id: "lt-cbc", code: "CBC-PANEL", name: "Complete Blood Count (CBC)", category: "hematology", specimenType: "blood", panelComponents: ["HGB", "WBC", "PLT"], referenceRangeText: "Panel — see components", turnaroundTimeHours: 4, billingCode: "LAB-001", active: true },
  { id: "lt-hgb", code: "HGB", name: "Hemoglobin", category: "hematology", specimenType: "blood", unit: "g/dL", referenceRangeText: "13.5–17.5 g/dL", refLow: 13.5, refHigh: 17.5, criticalLow: 7, criticalHigh: 20, turnaroundTimeHours: 4, active: true },
  { id: "lt-wbc", code: "WBC", name: "White Blood Cell Count", category: "hematology", specimenType: "blood", unit: "×10⁹/L", referenceRangeText: "4.5–11.0 ×10⁹/L", refLow: 4.5, refHigh: 11.0, criticalLow: 2, criticalHigh: 30, turnaroundTimeHours: 4, active: true },
  { id: "lt-plt", code: "PLT", name: "Platelet Count", category: "hematology", specimenType: "blood", unit: "×10⁹/L", referenceRangeText: "150–450 ×10⁹/L", refLow: 150, refHigh: 450, criticalLow: 20, criticalHigh: 1000, turnaroundTimeHours: 4, active: true },
  { id: "lt-glu", code: "GLU-F", name: "Fasting Glucose", category: "chemistry", specimenType: "blood", unit: "mg/dL", referenceRangeText: "70–99 mg/dL", refLow: 70, refHigh: 99, criticalLow: 40, criticalHigh: 500, turnaroundTimeHours: 3, active: true },
  { id: "lt-hba1c", code: "HBA1C", name: "Hemoglobin A1c", category: "chemistry", specimenType: "blood", unit: "%", referenceRangeText: "4.0–5.6 %", refLow: 4.0, refHigh: 5.6, turnaroundTimeHours: 24, active: true },
  { id: "lt-creat", code: "CREAT", name: "Creatinine", category: "chemistry", specimenType: "blood", unit: "mg/dL", referenceRangeText: "0.6–1.3 mg/dL", refLow: 0.6, refHigh: 1.3, criticalHigh: 10, turnaroundTimeHours: 3, active: true },
  { id: "lt-na", code: "NA", name: "Sodium", category: "chemistry", specimenType: "blood", unit: "mmol/L", referenceRangeText: "135–145 mmol/L", refLow: 135, refHigh: 145, criticalLow: 120, criticalHigh: 160, turnaroundTimeHours: 3, active: true },
  { id: "lt-k", code: "K", name: "Potassium", category: "chemistry", specimenType: "blood", unit: "mmol/L", referenceRangeText: "3.5–5.1 mmol/L", refLow: 3.5, refHigh: 5.1, criticalLow: 2.5, criticalHigh: 6.5, turnaroundTimeHours: 3, active: true },
  { id: "lt-lipid", code: "LIPID-PANEL", name: "Lipid Panel", category: "chemistry", specimenType: "blood", panelComponents: ["TC", "LDL", "HDL", "TG"], referenceRangeText: "Panel — see components", turnaroundTimeHours: 6, active: true },
  { id: "lt-tc", code: "TC", name: "Total Cholesterol", category: "chemistry", specimenType: "blood", unit: "mg/dL", referenceRangeText: "< 200 mg/dL", refHigh: 200, turnaroundTimeHours: 6, active: true },
  { id: "lt-ldl", code: "LDL", name: "LDL Cholesterol", category: "chemistry", specimenType: "blood", unit: "mg/dL", referenceRangeText: "< 130 mg/dL", refHigh: 130, turnaroundTimeHours: 6, active: true },
  { id: "lt-hdl", code: "HDL", name: "HDL Cholesterol", category: "chemistry", specimenType: "blood", unit: "mg/dL", referenceRangeText: "> 40 mg/dL", refLow: 40, turnaroundTimeHours: 6, active: true },
  { id: "lt-tg", code: "TG", name: "Triglycerides", category: "chemistry", specimenType: "blood", unit: "mg/dL", referenceRangeText: "< 150 mg/dL", refHigh: 150, turnaroundTimeHours: 6, active: true },
  { id: "lt-tsh", code: "TSH", name: "Thyroid Stimulating Hormone", category: "immunology", specimenType: "blood", unit: "mIU/L", referenceRangeText: "0.4–4.0 mIU/L", refLow: 0.4, refHigh: 4.0, turnaroundTimeHours: 24, active: true },
  { id: "lt-crp", code: "CRP", name: "C-Reactive Protein", category: "immunology", specimenType: "blood", unit: "mg/L", referenceRangeText: "< 5 mg/L", refHigh: 5, criticalHigh: 100, turnaroundTimeHours: 6, active: true },
  { id: "lt-urine-rt", code: "URINE-RT", name: "Urine Routine & Microscopy", category: "urinalysis", specimenType: "urine", referenceRangeText: "No abnormal findings", turnaroundTimeHours: 4, active: true },
  { id: "lt-urine-culture", code: "CULTURE-URINE", name: "Urine Culture & Sensitivity", category: "microbiology", specimenType: "urine", referenceRangeText: "No growth", turnaroundTimeHours: 72, active: true },
  { id: "lt-bx-histo", code: "BX-HISTO", name: "Histopathology — Biopsy", category: "pathology", specimenType: "tissue", referenceRangeText: "Pathologist narrative report", turnaroundTimeHours: 120, active: true },
];

export function getLabTestCatalog(filters: { includeInactive?: boolean; category?: LabTestCategory } = {}) {
  const rows = labTestCatalog
    .filter((t) => filters.includeInactive || t.active)
    .filter((t) => !filters.category || t.category === filters.category);
  return mockRequest(rows);
}

export interface NewLabTestCatalogInput {
  code: string;
  name: string;
  category: LabTestCategory;
  specimenType: LabSpecimenType;
  unit?: string;
  referenceRangeText: string;
  refLow?: number;
  refHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  turnaroundTimeHours: number;
}

export function createLabTestCatalogEntry(input: NewLabTestCatalogInput) {
  const entry: LabTestCatalogEntry = { id: `lt-${input.code.toLowerCase()}`, ...input, active: true };
  labTestCatalog.push(entry);
  return mockRequest(entry);
}

export function updateLabTestCatalogEntry(id: string, updates: Partial<NewLabTestCatalogInput>) {
  const entry = labTestCatalog.find((t) => t.id === id);
  if (entry) Object.assign(entry, updates);
  return mockRequest(entry ?? null);
}

export function setLabTestCatalogActive(id: string, active: boolean) {
  const entry = labTestCatalog.find((t) => t.id === id);
  if (entry) entry.active = active;
  return mockRequest(entry ?? null);
}

function resolveTestName(code: string): string {
  return labTestCatalog.find((t) => t.code === code)?.name ?? code;
}

// --- Lab Orders — FHIR ServiceRequest ---------------------------------------

export type LabOrderPriority = "routine" | "urgent" | "stat";
export type LabOrderStatus = "ordered" | "specimen-collected" | "received-in-lab" | "in-process" | "resulted" | "verified" | "cancelled";

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  orderingPractitionerId: string;
  departmentId: string;
  testCodes: string[];
  priority: LabOrderPriority;
  reasonForTest: string;
  clinicalInformation?: string;
  orderedDateTime: string;
  status: LabOrderStatus;
  cancelledReason?: string;
}

// --- Specimens — FHIR Specimen -----------------------------------------------

export type SpecimenCondition = "acceptable" | "hemolyzed" | "clotted" | "insufficient" | "contaminated";
export type SpecimenProcessingStatus = "pending-collection" | "collected" | "in-transit" | "received" | "rejected" | "processed";

export interface LabSpecimen {
  id: string;
  orderId: string;
  type: LabSpecimenType;
  collectionDateTime?: string;
  collectedBy?: string;
  bodySite?: string;
  condition?: SpecimenCondition;
  receivedDateTime?: string;
  processingStatus: SpecimenProcessingStatus;
  rejectionReason?: string;
}

// --- Results — FHIR Observation ----------------------------------------------

export type ObservationInterpretation = "normal" | "low" | "high" | "critical-low" | "critical-high";
export type ResultStatus = "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled";

export interface LabObservation {
  id: string;
  orderId: string;
  testCode: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRangeText: string;
  interpretation: ObservationInterpretation;
  status: ResultStatus;
  effectiveDateTime: string;
  performerId: string;
}

// --- Report — FHIR DiagnosticReport ------------------------------------------

export interface LabDiagnosticReport {
  id: string;
  orderId: string;
  category: LabTestCategory;
  name: string;
  status: ResultStatus;
  effectiveDateTime: string;
  issuedDateTime?: string;
  performerId: string;
  conclusion?: string;
  observationIds: string[];
}

const labOrders: LabOrder[] = [
  { id: "lab-order-1001", orderNumber: "LAB-2026-0001", patientId: "p-ibrar-ahmad", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", testCodes: ["CBC-PANEL", "LIPID-PANEL"], priority: "routine", reasonForTest: "Pre-procedure cardiac workup", orderedDateTime: "2026-08-12T08:00:00", status: "verified" },
  { id: "lab-order-1002", orderNumber: "LAB-2026-0002", patientId: "p-fatima-sheikh", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", testCodes: ["GLU-F", "HBA1C"], priority: "routine", reasonForTest: "Diabetes screening", orderedDateTime: "2026-08-13T09:00:00", status: "resulted" },
  { id: "lab-order-1003", orderNumber: "LAB-2026-0003", patientId: "p-bilal-hussain", orderingPractitionerId: "robert-vance", departmentId: "dept-icu", testCodes: ["CULTURE-URINE"], priority: "urgent", reasonForTest: "Suspected UTI, ICU patient under isolation", orderedDateTime: "2026-08-14T07:30:00", status: "in-process" },
  { id: "lab-order-1004", orderNumber: "LAB-2026-0004", patientId: "p-ahsan-tariq", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", testCodes: ["CREAT", "NA", "K"], priority: "stat", reasonForTest: "Renal function check", orderedDateTime: "2026-08-14T09:00:00", status: "received-in-lab" },
  { id: "lab-order-1005", orderNumber: "LAB-2026-0005", patientId: "p-zara-malik", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", testCodes: ["TSH"], priority: "routine", reasonForTest: "Fatigue workup", orderedDateTime: "2026-08-14T10:15:00", status: "specimen-collected" },
  { id: "lab-order-1006", orderNumber: "LAB-2026-0006", patientId: "p-ayesha-raza", orderingPractitionerId: "robert-vance", departmentId: "dept-neurology", testCodes: ["CRP"], priority: "urgent", reasonForTest: "Rule out inflammatory process", orderedDateTime: "2026-08-14T11:00:00", status: "ordered" },
  { id: "lab-order-1007", orderNumber: "LAB-2026-0007", patientId: "p-kamal-siddiqui", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", testCodes: ["URINE-RT"], priority: "routine", reasonForTest: "Routine annual checkup", orderedDateTime: "2026-08-11T08:00:00", status: "verified" },
  { id: "lab-order-1008", orderNumber: "LAB-2026-0008", patientId: "p-usman-khan", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", testCodes: ["CBC-PANEL"], priority: "stat", reasonForTest: "Acute chest pain, pre-transfusion workup", orderedDateTime: "2026-08-14T06:45:00", status: "resulted" },
  { id: "lab-order-1009", orderNumber: "LAB-2026-0009", patientId: "p-noor-fatima", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", testCodes: ["BX-HISTO"], priority: "routine", reasonForTest: "Skin lesion biopsy", orderedDateTime: "2026-08-12T11:00:00", status: "in-process" },
  { id: "lab-order-1010", orderNumber: "LAB-2026-0010", patientId: "p-elena-rodriguez", orderingPractitionerId: "robert-vance", departmentId: "dept-emergency", testCodes: ["K"], priority: "stat", reasonForTest: "ER chest pain workup", orderedDateTime: "2026-08-14T08:00:00", status: "cancelled", cancelledReason: "Duplicate order — already drawn under LAB-2026-0004" },
  { id: "lab-order-1011", orderNumber: "LAB-2026-0011", patientId: "p-layla-awan", orderingPractitionerId: "sarah-jenkins", departmentId: "dept-cardiology", testCodes: ["GLU-F"], priority: "routine", reasonForTest: "Routine follow-up", orderedDateTime: "2026-08-14T08:30:00", status: "specimen-collected" },
  { id: "lab-order-1012", orderNumber: "LAB-2026-0012", patientId: "p-hamza-butt", orderingPractitionerId: "michael-chen", departmentId: "dept-opd", testCodes: ["K"], priority: "stat", reasonForTest: "Routine electrolyte panel", orderedDateTime: "2026-08-12T14:30:00", status: "verified" },
];

const labSpecimens: LabSpecimen[] = [
  { id: "spec-1001", orderId: "lab-order-1001", type: "blood", collectionDateTime: "2026-08-12T08:15:00", collectedBy: "Lab Tech — Faisal Rana", condition: "acceptable", receivedDateTime: "2026-08-12T08:45:00", processingStatus: "processed" },
  { id: "spec-1002", orderId: "lab-order-1002", type: "blood", collectionDateTime: "2026-08-13T09:15:00", collectedBy: "Lab Tech — Faisal Rana", condition: "acceptable", receivedDateTime: "2026-08-13T09:50:00", processingStatus: "processed" },
  { id: "spec-1003", orderId: "lab-order-1003", type: "urine", collectionDateTime: "2026-08-14T07:35:00", collectedBy: "Nurse — Marcus Chen", condition: "acceptable", receivedDateTime: "2026-08-14T08:10:00", processingStatus: "received" },
  { id: "spec-1004", orderId: "lab-order-1004", type: "blood", collectionDateTime: "2026-08-14T09:05:00", collectedBy: "Lab Tech — Faisal Rana", condition: "acceptable", receivedDateTime: "2026-08-14T09:20:00", processingStatus: "received" },
  { id: "spec-1005", orderId: "lab-order-1005", type: "blood", collectionDateTime: "2026-08-14T10:20:00", collectedBy: "Lab Tech — Hina Older", condition: "acceptable", processingStatus: "in-transit" },
  { id: "spec-1007", orderId: "lab-order-1007", type: "urine", collectionDateTime: "2026-08-11T08:10:00", collectedBy: "Lab Tech — Faisal Rana", condition: "acceptable", receivedDateTime: "2026-08-11T08:30:00", processingStatus: "processed" },
  { id: "spec-1008", orderId: "lab-order-1008", type: "blood", collectionDateTime: "2026-08-14T06:50:00", collectedBy: "Lab Tech — Hina Older", condition: "acceptable", receivedDateTime: "2026-08-14T07:00:00", processingStatus: "processed" },
  { id: "spec-1009", orderId: "lab-order-1009", type: "tissue", collectionDateTime: "2026-08-12T11:15:00", collectedBy: "Dr. Michael Chen", bodySite: "Left forearm", condition: "acceptable", receivedDateTime: "2026-08-12T13:00:00", processingStatus: "received" },
  { id: "spec-1011", orderId: "lab-order-1011", type: "blood", collectionDateTime: "2026-08-14T08:40:00", collectedBy: "Lab Tech — Hina Older", condition: "hemolyzed", receivedDateTime: "2026-08-14T09:05:00", processingStatus: "rejected", rejectionReason: "Hemolyzed sample — recollection required" },
  { id: "spec-1012", orderId: "lab-order-1012", type: "blood", collectionDateTime: "2026-08-12T14:45:00", collectedBy: "Lab Tech — Faisal Rana", condition: "acceptable", receivedDateTime: "2026-08-12T15:00:00", processingStatus: "processed" },
];

const labObservations: LabObservation[] = [
  { id: "obs-1001-hgb", orderId: "lab-order-1001", testCode: "HGB", testName: "Hemoglobin", value: "14.2", unit: "g/dL", referenceRangeText: "13.5–17.5 g/dL", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:30:00", performerId: "amina-farooqi" },
  { id: "obs-1001-wbc", orderId: "lab-order-1001", testCode: "WBC", testName: "White Blood Cell Count", value: "7.1", unit: "×10⁹/L", referenceRangeText: "4.5–11.0 ×10⁹/L", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:30:00", performerId: "amina-farooqi" },
  { id: "obs-1001-plt", orderId: "lab-order-1001", testCode: "PLT", testName: "Platelet Count", value: "260", unit: "×10⁹/L", referenceRangeText: "150–450 ×10⁹/L", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:30:00", performerId: "amina-farooqi" },
  { id: "obs-1001-tc", orderId: "lab-order-1001", testCode: "TC", testName: "Total Cholesterol", value: "185", unit: "mg/dL", referenceRangeText: "< 200 mg/dL", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:45:00", performerId: "amina-farooqi" },
  { id: "obs-1001-ldl", orderId: "lab-order-1001", testCode: "LDL", testName: "LDL Cholesterol", value: "110", unit: "mg/dL", referenceRangeText: "< 130 mg/dL", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:45:00", performerId: "amina-farooqi" },
  { id: "obs-1001-hdl", orderId: "lab-order-1001", testCode: "HDL", testName: "HDL Cholesterol", value: "52", unit: "mg/dL", referenceRangeText: "> 40 mg/dL", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:45:00", performerId: "amina-farooqi" },
  { id: "obs-1001-tg", orderId: "lab-order-1001", testCode: "TG", testName: "Triglycerides", value: "130", unit: "mg/dL", referenceRangeText: "< 150 mg/dL", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-12T10:45:00", performerId: "amina-farooqi" },
  { id: "obs-1002-glu", orderId: "lab-order-1002", testCode: "GLU-F", testName: "Fasting Glucose", value: "142", unit: "mg/dL", referenceRangeText: "70–99 mg/dL", interpretation: "high", status: "preliminary", effectiveDateTime: "2026-08-13T11:30:00", performerId: "amina-farooqi" },
  { id: "obs-1002-hba1c", orderId: "lab-order-1002", testCode: "HBA1C", testName: "Hemoglobin A1c", value: "7.8", unit: "%", referenceRangeText: "4.0–5.6 %", interpretation: "high", status: "preliminary", effectiveDateTime: "2026-08-13T14:00:00", performerId: "amina-farooqi" },
  { id: "obs-1007-urine", orderId: "lab-order-1007", testCode: "URINE-RT", testName: "Urine Routine & Microscopy", value: "No WBC/RBC seen, trace protein", referenceRangeText: "No abnormal findings", interpretation: "normal", status: "final", effectiveDateTime: "2026-08-11T10:30:00", performerId: "amina-farooqi" },
  { id: "obs-1008-hgb", orderId: "lab-order-1008", testCode: "HGB", testName: "Hemoglobin", value: "6.2", unit: "g/dL", referenceRangeText: "13.5–17.5 g/dL", interpretation: "critical-low", status: "preliminary", effectiveDateTime: "2026-08-14T07:30:00", performerId: "amina-farooqi" },
  { id: "obs-1008-wbc", orderId: "lab-order-1008", testCode: "WBC", testName: "White Blood Cell Count", value: "8.9", unit: "×10⁹/L", referenceRangeText: "4.5–11.0 ×10⁹/L", interpretation: "normal", status: "preliminary", effectiveDateTime: "2026-08-14T07:30:00", performerId: "amina-farooqi" },
  { id: "obs-1008-plt", orderId: "lab-order-1008", testCode: "PLT", testName: "Platelet Count", value: "140", unit: "×10⁹/L", referenceRangeText: "150–450 ×10⁹/L", interpretation: "low", status: "preliminary", effectiveDateTime: "2026-08-14T07:30:00", performerId: "amina-farooqi" },
  { id: "obs-1012-k", orderId: "lab-order-1012", testCode: "K", testName: "Potassium", value: "6.8", unit: "mmol/L", referenceRangeText: "3.5–5.1 mmol/L", interpretation: "critical-high", status: "final", effectiveDateTime: "2026-08-12T15:20:00", performerId: "amina-farooqi" },
];

const labDiagnosticReports: LabDiagnosticReport[] = [
  { id: "report-1001", orderId: "lab-order-1001", category: "hematology", name: "CBC & Lipid Panel", status: "final", effectiveDateTime: "2026-08-12T10:45:00", issuedDateTime: "2026-08-12T11:15:00", performerId: "amina-farooqi", conclusion: "Within normal limits.", observationIds: ["obs-1001-hgb", "obs-1001-wbc", "obs-1001-plt", "obs-1001-tc", "obs-1001-ldl", "obs-1001-hdl", "obs-1001-tg"] },
  { id: "report-1002", orderId: "lab-order-1002", category: "chemistry", name: "Fasting Glucose & HbA1c", status: "preliminary", effectiveDateTime: "2026-08-13T14:00:00", performerId: "amina-farooqi", observationIds: ["obs-1002-glu", "obs-1002-hba1c"] },
  { id: "report-1007", orderId: "lab-order-1007", category: "urinalysis", name: "Urine Routine & Microscopy", status: "final", effectiveDateTime: "2026-08-11T10:30:00", issuedDateTime: "2026-08-11T11:00:00", performerId: "amina-farooqi", conclusion: "No significant abnormality.", observationIds: ["obs-1007-urine"] },
  { id: "report-1008", orderId: "lab-order-1008", category: "hematology", name: "Complete Blood Count", status: "preliminary", effectiveDateTime: "2026-08-14T07:30:00", performerId: "amina-farooqi", observationIds: ["obs-1008-hgb", "obs-1008-wbc", "obs-1008-plt"] },
  { id: "report-1012", orderId: "lab-order-1012", category: "chemistry", name: "Potassium", status: "final", effectiveDateTime: "2026-08-12T15:20:00", issuedDateTime: "2026-08-12T15:35:00", performerId: "amina-farooqi", conclusion: "Critical result — physician notified by phone, repeat draw on recheck was normal.", observationIds: ["obs-1012-k"] },
];

// --- Critical Results — escalation/acknowledgment is genuinely administrative
// oversight (not result entry), so it's the one workflow action this section
// owns end to end.

export interface LabCriticalAlert {
  id: string;
  observationId: string;
  orderId: string;
  testName: string;
  value: string;
  patientId: string;
  flaggedAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalationNote?: string;
}

const labCriticalAlerts: LabCriticalAlert[] = [
  { id: "crit-1", observationId: "obs-1008-hgb", orderId: "lab-order-1008", testName: "Hemoglobin", value: "6.2 g/dL", patientId: "p-usman-khan", flaggedAt: "2026-08-14T07:30:00", acknowledged: false },
  { id: "crit-hist-1", observationId: "obs-1012-k", orderId: "lab-order-1012", testName: "Potassium", value: "6.8 mmol/L", patientId: "p-hamza-butt", flaggedAt: "2026-08-12T15:20:00", acknowledged: true, acknowledgedBy: "Dr. Amina Farooqi", acknowledgedAt: "2026-08-12T15:35:00", escalationNote: "Notified Dr. Sarah Jenkins by phone — repeat draw ordered, resolved on recheck." },
];

// --- Audit — mirrors Bed Management's audit pattern (recordBedAudit), same
// DEFAULT_ACTOR, same shape, own log — every administrative action here
// (order capture/cancel, critical acknowledgment) is traceable.

export interface LabAuditEvent {
  id: string;
  orderId: string;
  orderNumber: string;
  timestamp: string;
  action: string;
  actor: string;
  detail?: string;
}

const labAuditLog: LabAuditEvent[] = [];

function recordLabAudit(order: LabOrder, action: string, actor: string | undefined, detail?: string) {
  labAuditLog.unshift({
    id: `lab-audit-${labAuditLog.length + 1}-${Date.now()}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    timestamp: TODAY,
    action,
    actor: actor ?? DEFAULT_ACTOR,
    detail,
  });
}

export function getLabAuditLog(filters: { orderId?: string; action?: string } = {}) {
  const rows = labAuditLog
    .filter((e) => !filters.orderId || e.orderId === filters.orderId)
    .filter((e) => !filters.action || e.action === filters.action);
  return mockRequest(rows);
}

// --- Read views --------------------------------------------------------------

export interface LabOrderRow {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  orderingPractitionerName: string;
  departmentId: string;
  departmentName: string;
  testNames: string[];
  priority: LabOrderPriority;
  status: LabOrderStatus;
  orderedDateTime: string;
  hasCriticalFlag: boolean;
  specimenStatus?: SpecimenProcessingStatus;
}

function resolvePatientName(patientId: string): string {
  const seed = patientSeeds.find((p) => p.id === patientId);
  return seed?.fullName ?? "Unknown Patient";
}

function toLabOrderRow(order: LabOrder): LabOrderRow {
  const department = departmentConfigs.find((d) => d.id === order.departmentId);
  const specimen = labSpecimens.find((s) => s.orderId === order.id);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    patientId: order.patientId,
    patientName: resolvePatientName(order.patientId),
    orderingPractitionerName: resolveHeadName(order.orderingPractitionerId),
    departmentId: order.departmentId,
    departmentName: department?.name ?? "Unknown",
    testNames: order.testCodes.map(resolveTestName),
    priority: order.priority,
    status: order.status,
    orderedDateTime: order.orderedDateTime,
    hasCriticalFlag: labCriticalAlerts.some((a) => a.orderId === order.id && !a.acknowledged),
    specimenStatus: specimen?.processingStatus,
  };
}

export function getLabOrders(filters: { status?: LabOrderStatus; priority?: LabOrderPriority; departmentId?: string; search?: string } = {}) {
  const search = filters.search?.trim().toLowerCase();
  const rows = labOrders
    .filter((o) => !filters.status || o.status === filters.status)
    .filter((o) => !filters.priority || o.priority === filters.priority)
    .filter((o) => !filters.departmentId || o.departmentId === filters.departmentId)
    .map(toLabOrderRow)
    .filter((r) => !search || r.patientName.toLowerCase().includes(search) || r.orderNumber.toLowerCase().includes(search))
    .sort((a, b) => (a.orderedDateTime < b.orderedDateTime ? 1 : -1));
  return mockRequest(rows);
}

export interface LabOrderDetail extends LabOrderRow {
  reasonForTest: string;
  clinicalInformation?: string;
  cancelledReason?: string;
  specimens: LabSpecimen[];
  observations: LabObservation[];
  report: LabDiagnosticReport | null;
  auditTrail: LabAuditEvent[];
}

export function getLabOrder(id: string) {
  const order = labOrders.find((o) => o.id === id);
  if (!order) return mockRequest(null as LabOrderDetail | null);
  const row = toLabOrderRow(order);
  const specimens = labSpecimens.filter((s) => s.orderId === id);
  const observations = labObservations.filter((o) => o.orderId === id);
  const report = labDiagnosticReports.find((r) => r.orderId === id) ?? null;
  const auditTrail = labAuditLog.filter((e) => e.orderId === id);
  return mockRequest({ ...row, reasonForTest: order.reasonForTest, clinicalInformation: order.clinicalInformation, cancelledReason: order.cancelledReason, specimens, observations, report, auditTrail } satisfies LabOrderDetail);
}

// --- Administrative actions ---------------------------------------------------
// Capturing a one-off order administratively mirrors Billing's manual Capture
// Charge (Phase 1) — a real path exists here even though no ordering-doctor
// workspace is built yet.

export interface NewLabOrderInput {
  patientId: string;
  orderingPractitionerId: string;
  departmentId: string;
  testCodes: string[];
  priority: LabOrderPriority;
  reasonForTest: string;
  clinicalInformation?: string;
}

export function createLabOrder(input: NewLabOrderInput) {
  const order: LabOrder = {
    ...input,
    id: `lab-order-${1000 + labOrders.length + 1}`,
    orderNumber: `LAB-2026-${String(labOrders.length + 1).padStart(4, "0")}`,
    orderedDateTime: `${TODAY}T${new Date().toTimeString().slice(0, 8)}`,
    status: "ordered",
  };
  labOrders.push(order);
  recordLabAudit(order, "Order Captured", DEFAULT_ACTOR, `${order.testCodes.join(", ")} for ${resolvePatientName(order.patientId)}`);
  return mockRequest(toLabOrderRow(order));
}

export function cancelLabOrder(id: string, reason: string, actor?: string) {
  const order = labOrders.find((o) => o.id === id);
  if (!order) throw new Error("Lab order not found");
  if (order.status === "verified") throw new Error("A verified/finalized order cannot be cancelled");
  order.status = "cancelled";
  order.cancelledReason = reason;
  recordLabAudit(order, "Order Cancelled", actor, reason);
  return mockRequest(toLabOrderRow(order));
}

export interface LabCriticalAlertRow extends LabCriticalAlert {
  patientName: string;
  orderNumber: string;
  referenceRangeText: string;
}

export function getLabCriticalAlerts(filters: { openOnly?: boolean } = {}) {
  const rows: LabCriticalAlertRow[] = labCriticalAlerts
    .filter((a) => !filters.openOnly || !a.acknowledged)
    .map((a) => {
      const obs = labObservations.find((o) => o.id === a.observationId);
      const order = labOrders.find((o) => o.id === a.orderId);
      return { ...a, patientName: resolvePatientName(a.patientId), orderNumber: order?.orderNumber ?? "—", referenceRangeText: obs?.referenceRangeText ?? "—" };
    })
    .sort((a, b) => (a.flaggedAt < b.flaggedAt ? 1 : -1));
  return mockRequest(rows);
}

export function acknowledgeCriticalAlert(id: string, actor: string | undefined, note?: string) {
  const alert = labCriticalAlerts.find((a) => a.id === id);
  if (!alert) throw new Error("Critical alert not found");
  alert.acknowledged = true;
  alert.acknowledgedBy = actor ?? DEFAULT_ACTOR;
  alert.acknowledgedAt = `${TODAY}T${new Date().toTimeString().slice(0, 8)}`;
  alert.escalationNote = note;
  const order = labOrders.find((o) => o.id === alert.orderId);
  if (order) recordLabAudit(order, "Critical Result Acknowledged", actor, `${alert.testName} ${alert.value} — ${note ?? "acknowledged"}`);
  return mockRequest(alert);
}

// --- Dashboard & Analytics -----------------------------------------------------

function hoursBetween(startIso: string, endIso: string): number {
  return (new Date(endIso).getTime() - new Date(startIso).getTime()) / (1000 * 60 * 60);
}

export interface LabDashboardData {
  ordersToday: number;
  pendingCollection: number;
  awaitingReceipt: number;
  inProcess: number;
  resultedPendingVerification: number;
  verifiedToday: number;
  criticalOpen: number;
  rejectedSpecimens: number;
  avgTATHours: number;
  byPriority: { priority: LabOrderPriority; count: number }[];
  byDepartment: { name: string; count: number }[];
}

export function getLabDashboard() {
  const today = labOrders.filter((o) => o.orderedDateTime.startsWith(TODAY));
  const verifiedWithTAT = labOrders
    .filter((o) => o.status === "verified")
    .map((o) => {
      const report = labDiagnosticReports.find((r) => r.orderId === o.id);
      return report?.issuedDateTime ? hoursBetween(o.orderedDateTime, report.issuedDateTime) : null;
    })
    .filter((h): h is number => h !== null);
  const avgTATHours = verifiedWithTAT.length > 0 ? verifiedWithTAT.reduce((sum, h) => sum + h, 0) / verifiedWithTAT.length : 0;

  const byPriority = (["stat", "urgent", "routine"] as LabOrderPriority[]).map((priority) => ({
    priority,
    count: labOrders.filter((o) => o.priority === priority && o.status !== "cancelled").length,
  }));

  const byDepartmentMap = new Map<string, number>();
  labOrders.forEach((o) => {
    if (o.status === "cancelled") return;
    const name = departmentConfigs.find((d) => d.id === o.departmentId)?.name ?? "Unknown";
    byDepartmentMap.set(name, (byDepartmentMap.get(name) ?? 0) + 1);
  });

  const data: LabDashboardData = {
    ordersToday: today.length,
    pendingCollection: labOrders.filter((o) => o.status === "ordered").length,
    awaitingReceipt: labOrders.filter((o) => o.status === "specimen-collected").length,
    inProcess: labOrders.filter((o) => o.status === "received-in-lab" || o.status === "in-process").length,
    resultedPendingVerification: labOrders.filter((o) => o.status === "resulted").length,
    verifiedToday: labOrders.filter((o) => o.status === "verified" && o.orderedDateTime.startsWith(TODAY)).length,
    criticalOpen: labCriticalAlerts.filter((a) => !a.acknowledged).length,
    rejectedSpecimens: labSpecimens.filter((s) => s.processingStatus === "rejected").length,
    avgTATHours: Math.round(avgTATHours * 10) / 10,
    byPriority,
    byDepartment: Array.from(byDepartmentMap.entries()).map(([name, count]) => ({ name, count })),
  };
  return mockRequest(data);
}

export interface LabAnalyticsData {
  byCategory: { category: LabTestCategory; orders: number }[];
  rejectionRate: number;
  criticalRate: number;
  tatByPriority: { priority: LabOrderPriority; avgHours: number; targetHours: number }[];
}

export function getLabAnalytics() {
  const activeOrders = labOrders.filter((o) => o.status !== "cancelled");

  const byCategoryMap = new Map<LabTestCategory, number>();
  activeOrders.forEach((o) => {
    o.testCodes.forEach((code) => {
      const test = labTestCatalog.find((t) => t.code === code);
      if (test) byCategoryMap.set(test.category, (byCategoryMap.get(test.category) ?? 0) + 1);
    });
  });

  const totalSpecimens = labSpecimens.length;
  const rejectedSpecimens = labSpecimens.filter((s) => s.processingStatus === "rejected").length;
  const totalResulted = labObservations.length > 0 ? new Set(labObservations.map((o) => o.orderId)).size : 0;
  const criticalCount = labCriticalAlerts.length;

  const tatByPriority: LabAnalyticsData["tatByPriority"] = (["stat", "urgent", "routine"] as LabOrderPriority[]).map((priority) => {
    const orders = labOrders.filter((o) => o.priority === priority && o.status === "verified");
    const hours = orders
      .map((o) => {
        const report = labDiagnosticReports.find((r) => r.orderId === o.id);
        return report?.issuedDateTime ? hoursBetween(o.orderedDateTime, report.issuedDateTime) : null;
      })
      .filter((h): h is number => h !== null);
    const avgHours = hours.length > 0 ? Math.round((hours.reduce((s, h) => s + h, 0) / hours.length) * 10) / 10 : 0;
    const targetHours = priority === "stat" ? 3 : priority === "urgent" ? 6 : 24;
    return { priority, avgHours, targetHours };
  });

  const data: LabAnalyticsData = {
    byCategory: Array.from(byCategoryMap.entries()).map(([category, orders]) => ({ category, orders })),
    rejectionRate: totalSpecimens > 0 ? Math.round((rejectedSpecimens / totalSpecimens) * 1000) / 10 : 0,
    criticalRate: totalResulted > 0 ? Math.round((criticalCount / totalResulted) * 1000) / 10 : 0,
    tatByPriority,
  };
  return mockRequest(data);
}
