import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients } from "./patients";
import type { NursePatient } from "./patients";

// Safety Alerts — a ward-wide feed of items a nurse needs to see and act on
// (distinct from the Dashboard's small "Needs Attention" preview, which
// stays as-is). Acknowledging an alert here doesn't resolve the underlying
// condition (that still happens via Vitals/Medications/etc.) — it just
// records that a nurse has seen and triaged it, same as a real ward
// safety board.

export type AlertSeverity = "critical" | "high" | "medium";
export type AlertCategory = "Vital Sign" | "Medication" | "Allergy" | "Isolation" | "Fall Risk";

export interface SafetyAlert {
  id: string;
  patientId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  message: string;
  raisedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

let alerts: SafetyAlert[] = [
  { id: "alert-1", patientId: "np-1", category: "Vital Sign", severity: "critical", message: "SpO₂ 90% — below target range", raisedAt: "07:30", acknowledged: false },
  { id: "alert-2", patientId: "np-1", category: "Allergy", severity: "high", message: "Penicillin allergy — anaphylaxis reported 2021", raisedAt: "07:00", acknowledged: false },
  { id: "alert-3", patientId: "np-2", category: "Medication", severity: "high", message: "Paracetamol 09:00 dose overdue", raisedAt: "09:05", acknowledged: false },
  { id: "alert-4", patientId: "np-3", category: "Vital Sign", severity: "medium", message: "Respiratory rate elevated (24/min)", raisedAt: "07:40", acknowledged: false },
  { id: "alert-5", patientId: "np-5", category: "Fall Risk", severity: "medium", message: "High fall risk — mobility assistance required", raisedAt: "07:00", acknowledged: false },
  { id: "alert-6", patientId: "np-6", category: "Isolation", severity: "medium", message: "Contact Precautions — Sulfa drug allergy on file", raisedAt: "07:00", acknowledged: true, acknowledgedAt: "07:55" },
];

export interface AlertsQueueEntry extends SafetyAlert {
  patient: NursePatient;
}

export async function getAlerts(): Promise<AlertsQueueEntry[]> {
  const patients = await getMyPatients();
  return alerts
    .map((a) => ({ ...a, patient: patients.find((p) => p.id === a.patientId)! }))
    .filter((a) => a.patient)
    .sort((a, b) => Number(a.acknowledged) - Number(b.acknowledged));
}

export interface AlertSummary {
  critical: number;
  high: number;
  medium: number;
  unacknowledged: number;
}

export function getAlertSummary(): Promise<AlertSummary> {
  return mockRequest({
    critical: alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    high: alerts.filter((a) => a.severity === "high" && !a.acknowledged).length,
    medium: alerts.filter((a) => a.severity === "medium" && !a.acknowledged).length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  });
}

export function acknowledgeAlert(id: string) {
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.acknowledged = true;
    alert.acknowledgedAt = "just now";
  }
  alerts = [...alerts];
  return mockRequest([...alerts]);
}
