import { mockRequest } from "@shared/lib/api/client";

// QC records + calibration combined. Rule methodology (Westgard etc.) is
// hospital-configurable per the spec — this tracks Pass/Fail outcomes,
// not a hard-coded rule engine.

export interface QcRecord {
  id: string;
  analyzerId: string;
  testName: string;
  level: "Level 1" | "Level 2" | "Level 3";
  target: string;
  result: string;
  outcome: "Pass" | "Fail";
  performedBy: string;
  at: string;
}

let qcRecords: QcRecord[] = [
  { id: "qc-1", analyzerId: "an-1", testName: "Hemoglobin", level: "Level 1", target: "12.0 ± 0.5", result: "12.1", outcome: "Pass", performedBy: "MLS Kamran Butt", at: "2026-08-21 06:00" },
  { id: "qc-2", analyzerId: "an-2", testName: "Glucose", level: "Level 2", target: "150 ± 5", result: "148", outcome: "Pass", performedBy: "MLS Sana Iqbal", at: "2026-08-21 06:00" },
  { id: "qc-3", analyzerId: "an-3", testName: "Creatinine", level: "Level 1", target: "1.0 ± 0.1", result: "1.4", outcome: "Fail", performedBy: "MLS Sana Iqbal", at: "2026-08-20 06:00" },
  { id: "qc-4", analyzerId: "an-4", testName: "PT/INR", level: "Level 2", target: "1.0 ± 0.1", result: "1.05", outcome: "Pass", performedBy: "MLS Kamran Butt", at: "2026-08-21 06:00" },
  { id: "qc-5", analyzerId: "an-5", testName: "TSH", level: "Level 1", target: "2.0 ± 0.3", result: "2.1", outcome: "Pass", performedBy: "MLS Kamran Butt", at: "2026-08-21 06:00" },
];

export const getQcRecords = () => mockRequest([...qcRecords]);

export function recordQc(analyzerId: string, testName: string, level: QcRecord["level"], target: string, result: string, outcome: QcRecord["outcome"], performedBy: string) {
  const rec: QcRecord = { id: `qc-${Date.now()}`, analyzerId, testName, level, target, result, outcome, performedBy, at: "just now" };
  qcRecords = [rec, ...qcRecords];
  return mockRequest(rec);
}

export interface Calibration {
  id: string;
  analyzerId: string;
  performedBy: string;
  at: string;
  status: "Pass" | "Fail";
  lot: string;
}

let calibrations: Calibration[] = [
  { id: "cal-1", analyzerId: "an-1", performedBy: "MLS Kamran Butt", at: "2026-08-15 06:00", status: "Pass", lot: "CAL-2601" },
  { id: "cal-2", analyzerId: "an-2", performedBy: "MLS Sana Iqbal", at: "2026-08-15 06:00", status: "Pass", lot: "CAL-2588" },
];

export const getCalibrations = () => mockRequest([...calibrations]);

export function recordCalibration(analyzerId: string, performedBy: string, status: Calibration["status"], lot: string) {
  const rec: Calibration = { id: `cal-${Date.now()}`, analyzerId, performedBy, at: "just now", status, lot };
  calibrations = [rec, ...calibrations];
  return mockRequest(rec);
}
