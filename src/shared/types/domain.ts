/**
 * Shared domain types — mirrors the backend Service Catalog's entities.
 * Both devs use these; if a module needs a field that doesn't exist here,
 * add it here (not a local duplicate type) so Patient, Encounter, etc.
 * mean the same thing in every module.
 */

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  mrn: string;
  uhr: string; // Universal Health ID
  bloodGroup: string;
  insurance: string;
  lastVisit: string;
  registeredSince: string;
  allergies: Allergy[];
}

export interface Allergy {
  substance: string;
  reaction: string;
}

export interface Doctor {
  name: string;
  specialty: string;
  hospital: string;
}

export type AppointmentStatus = "checked-in" | "waiting" | "completed" | "confirmed" | "cancelled";

export interface Appointment {
  time: string;
  patient: string;
  type: string;
  status: AppointmentStatus;
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  range: string;
  flag: "normal" | "high" | "low" | "critical";
}

export type OrderTone = "success" | "warning" | "critical" | "info";

export interface ClinicalOrder {
  id: string;
  type: string;
  status: string;
  tone: OrderTone;
}

export interface Vital {
  label: string;
  value: string;
  unit: string;
}
