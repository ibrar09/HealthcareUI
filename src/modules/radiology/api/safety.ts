import { mockRequest } from "@shared/lib/api/client";

// MRI safety screening and contrast administration combined — both are
// patient-preparation safety gates a technician records before/during
// acquisition, never an automated clinical decision.

export type MriSafetyStatus = "Screened" | "Cleared" | "Requires Review" | "Not Cleared";

export interface MriSafetyScreening {
  orderId: string;
  status: MriSafetyStatus;
  notes: string;
  screenedBy: string;
  at: string;
}

let mriScreenings: MriSafetyScreening[] = [];

export function getMriScreening(orderId: string) {
  return mockRequest(mriScreenings.find((s) => s.orderId === orderId) ?? null);
}

export function recordMriScreening(orderId: string, status: MriSafetyStatus, notes: string, screenedBy: string) {
  mriScreenings = [...mriScreenings.filter((s) => s.orderId !== orderId), { orderId, status, notes, screenedBy, at: "just now" }];
  return mockRequest(mriScreenings.find((s) => s.orderId === orderId)!);
}

export interface ContrastAdministration {
  orderId: string;
  agent: string;
  dose: string;
  administeredBy: string;
  at: string;
  reaction?: string;
}

let contrastRecords: ContrastAdministration[] = [];

export function getContrastRecord(orderId: string) {
  return mockRequest(contrastRecords.find((c) => c.orderId === orderId) ?? null);
}

export function recordContrastAdministration(orderId: string, agent: string, dose: string, administeredBy: string) {
  contrastRecords = [...contrastRecords.filter((c) => c.orderId !== orderId), { orderId, agent, dose, administeredBy, at: "just now" }];
  return mockRequest(contrastRecords.find((c) => c.orderId === orderId)!);
}

export function recordContrastReaction(orderId: string, reaction: string) {
  const c = contrastRecords.find((x) => x.orderId === orderId);
  if (c) c.reaction = reaction;
  contrastRecords = [...contrastRecords];
  return mockRequest(c ?? null);
}
