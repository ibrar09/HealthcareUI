import { mockRequest } from "@shared/lib/api/client";

export interface CriticalAlert {
  id: string;
  encounterId: string;
  patientId: string;
  source: "Lab" | "Radiology";
  description: string;
  recipientDoctor: string;
  notifiedAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  escalated: boolean;
}

let alerts: CriticalAlert[] = [
  { id: "calert-1", encounterId: "enc-3", patientId: "ep-3", source: "Lab", description: "Arterial Blood Gas: pCO2 62 mmHg (Critical High)", recipientDoctor: "Dr. Ahsan Malik", notifiedAt: "08:16", acknowledged: false, escalated: false },
];

export const getCriticalAlerts = () => mockRequest([...alerts]);

export function createCriticalAlert(input: Omit<CriticalAlert, "id" | "acknowledged" | "escalated" | "notifiedAt">) {
  const alert: CriticalAlert = { ...input, id: `calert-${Date.now()}`, acknowledged: false, escalated: false, notifiedAt: "just now" };
  alerts = [alert, ...alerts];
  return mockRequest(alert);
}

export function acknowledgeCriticalAlert(id: string) {
  const a = alerts.find((x) => x.id === id);
  if (a) { a.acknowledged = true; a.acknowledgedAt = "just now"; }
  alerts = [...alerts];
  return mockRequest([...alerts]);
}

export function escalateCriticalAlert(id: string) {
  const a = alerts.find((x) => x.id === id);
  if (a) a.escalated = true;
  alerts = [...alerts];
  return mockRequest([...alerts]);
}
