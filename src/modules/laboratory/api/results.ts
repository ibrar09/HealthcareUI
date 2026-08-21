import { mockRequest } from "@shared/lib/api/client";
import { getTestById } from "./tests";
import { setOrderStatus, getOrderSync } from "./orders";
import { createCriticalResult } from "./criticalResults";

export type ResultStatus = "Entered" | "Validated" | "Released" | "Amended";
export type ResultFlag = "Normal" | "Low" | "High" | "Critical Low" | "Critical High" | "Abnormal";

export interface LabResult {
  id: string;
  orderId: string;
  patientId: string;
  testId: string;
  testName: string;
  value: string;
  unit?: string;
  refRangeDisplay: string;
  flag: ResultFlag;
  status: ResultStatus;
  enteredBy?: string;
  validatedBy?: string;
  releasedAt?: string;
  amendReason?: string;
  version: number;
}

// Descriptive only — never a diagnosis. Critical thresholds drive the
// separate critical-result workflow (criticalResults.ts), not this flag.
function computeFlag(testId: string, numericValue: number): ResultFlag {
  const test = getTestById(testId);
  if (!test) return "Normal";
  if (test.criticalLow !== undefined && numericValue <= test.criticalLow) return "Critical Low";
  if (test.criticalHigh !== undefined && numericValue >= test.criticalHigh) return "Critical High";
  if (test.refLow !== undefined && numericValue < test.refLow) return "Low";
  if (test.refHigh !== undefined && numericValue > test.refHigh) return "High";
  return "Normal";
}

function refDisplay(testId: string): string {
  const test = getTestById(testId);
  if (!test) return "—";
  if (test.refRangeText) return test.refRangeText;
  if (test.refLow !== undefined && test.refHigh !== undefined) return `${test.refLow}–${test.refHigh} ${test.unit ?? ""}`.trim();
  return "—";
}

let results: LabResult[] = [
  { id: "res-1", orderId: "lord-7", patientId: "lp-7", testId: "t-tsh", testName: "Thyroid Stimulating Hormone", value: "6.8", unit: "mIU/L", refRangeDisplay: refDisplay("t-tsh"), flag: computeFlag("t-tsh", 6.8), status: "Entered", enteredBy: "MLS Kamran Butt", version: 1 },
  { id: "res-2", orderId: "lord-7", patientId: "lp-7", testId: "t-hba1c", testName: "Hemoglobin A1c", value: "5.2", unit: "%", refRangeDisplay: refDisplay("t-hba1c"), flag: computeFlag("t-hba1c", 5.2), status: "Entered", enteredBy: "MLS Kamran Butt", version: 1 },
  { id: "res-3", orderId: "lord-8", patientId: "lp-8", testId: "t-ptinr", testName: "Prothrombin Time / INR", value: "1.1", unit: "INR", refRangeDisplay: refDisplay("t-ptinr"), flag: computeFlag("t-ptinr", 1.1), status: "Entered", enteredBy: "MLS Sana Iqbal", version: 1 },
  { id: "res-4", orderId: "lord-8", patientId: "lp-8", testId: "t-aptt", testName: "Activated Partial Thromboplastin Time", value: "38", unit: "sec", refRangeDisplay: refDisplay("t-aptt"), flag: computeFlag("t-aptt", 38), status: "Entered", enteredBy: "MLS Sana Iqbal", version: 1 },
  { id: "res-5", orderId: "lord-9", patientId: "lp-1", testId: "t-ua", testName: "Urinalysis, Complete", value: "No abnormal findings", refRangeDisplay: refDisplay("t-ua"), flag: "Normal", status: "Released", enteredBy: "MLS Kamran Butt", validatedBy: "Sr. MLS Fatima Zahra", releasedAt: "2026-08-20 09:00", version: 1 },
  { id: "res-6", orderId: "lord-13", patientId: "lp-5", testId: "t-na", testName: "Sodium", value: "138", unit: "mmol/L", refRangeDisplay: refDisplay("t-na"), flag: computeFlag("t-na", 138), status: "Released", enteredBy: "MLS Sana Iqbal", validatedBy: "Sr. MLS Fatima Zahra", releasedAt: "2026-08-20 06:30", version: 1 },
  { id: "res-7", orderId: "lord-13", patientId: "lp-5", testId: "t-k", testName: "Potassium", value: "6.9", unit: "mmol/L", refRangeDisplay: refDisplay("t-k"), flag: computeFlag("t-k", 6.9), status: "Released", enteredBy: "MLS Sana Iqbal", validatedBy: "Sr. MLS Fatima Zahra", releasedAt: "2026-08-20 06:30", version: 1 },
  { id: "res-8", orderId: "lord-14", patientId: "lp-6", testId: "t-crea", testName: "Creatinine", value: "1.1", unit: "mg/dL", refRangeDisplay: refDisplay("t-crea"), flag: computeFlag("t-crea", 1.1), status: "Released", enteredBy: "MLS Kamran Butt", validatedBy: "Sr. MLS Fatima Zahra", releasedAt: "2026-08-19 11:00", version: 1 },
];

export const getResults = () => mockRequest([...results]);
export const getResultsByOrderId = (orderId: string) => mockRequest(results.filter((r) => r.orderId === orderId));
export const getResultsByPatientId = (patientId: string) => mockRequest(results.filter((r) => r.patientId === patientId));

export function enterResult(orderId: string, patientId: string, testId: string, value: string, enteredBy: string) {
  const test = getTestById(testId);
  const numeric = Number(value);
  const flag: ResultFlag = test && !Number.isNaN(numeric) ? computeFlag(testId, numeric) : "Normal";
  const existing = results.find((r) => r.orderId === orderId && r.testId === testId);
  if (existing) {
    existing.value = value;
    existing.flag = flag;
    existing.status = "Entered";
    existing.enteredBy = enteredBy;
  } else {
    results = [...results, { id: `res-${Date.now()}`, orderId, patientId, testId, testName: test?.name ?? testId, value, unit: test?.unit, refRangeDisplay: refDisplay(testId), flag, status: "Entered", enteredBy, version: 1 }];
  }
  setOrderStatus(orderId, "Validation");
  return mockRequest([...results]);
}

export function validateResult(id: string, validatedBy: string) {
  const r = results.find((x) => x.id === id);
  if (r && r.status === "Entered") { r.status = "Validated"; r.validatedBy = validatedBy; }
  results = [...results];
  return mockRequest([...results]);
}

// Idempotent — releasing an already-Released result is a no-op. Once all
// of an order's results are released, the order itself moves to Released.
export function releaseResult(id: string) {
  const r = results.find((x) => x.id === id);
  if (r && r.status === "Validated") {
    r.status = "Released";
    r.releasedAt = "just now";
    if (r.flag === "Critical Low" || r.flag === "Critical High") {
      const order = getOrderSync(r.orderId);
      if (order) {
        createCriticalResult({
          patientId: r.patientId, orderId: r.orderId, resultId: r.id, testName: r.testName,
          value: `${r.value} ${r.unit ?? ""} (${r.flag})`.trim(), recipientDoctor: order.orderingDoctor,
        });
      }
    }
    const siblings = results.filter((x) => x.orderId === r.orderId);
    if (siblings.every((s) => s.status === "Released")) setOrderStatus(r.orderId, "Released");
  }
  results = [...results];
  return mockRequest([...results]);
}

export function amendResult(id: string, newValue: string, reason: string, amendedBy: string) {
  const r = results.find((x) => x.id === id);
  if (r && r.status === "Released") {
    r.value = newValue;
    r.status = "Amended";
    r.amendReason = reason;
    r.validatedBy = amendedBy;
    r.version += 1;
    const test = getTestById(r.testId);
    const numeric = Number(newValue);
    if (test && !Number.isNaN(numeric)) r.flag = computeFlag(r.testId, numeric);
  }
  results = [...results];
  return mockRequest([...results]);
}
