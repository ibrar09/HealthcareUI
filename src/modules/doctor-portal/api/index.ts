import { mockRequest } from "@shared/lib/api/client";
import type { Patient, Doctor, Appointment, LabResult, ClinicalOrder, Vital } from "@shared/types/domain";

// Module-local sample data — only Doctor Portal screens use this file.
const currentPatient: Patient = {
  id: "b2f1a9e0-0000-0000-0000-000000000001",
  name: "Ibrar Ahmad",
  age: 31,
  gender: "Male",
  mrn: "MRN-2026-004417",
  uhr: "UHR-PK-772104",
  bloodGroup: "O Positive",
  insurance: "State Health Plan · Active",
  lastVisit: "Jul 21, 2026 — Cardiology",
  registeredSince: "Mar 2024",
  allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis reported 2022" }],
};

const currentDoctor: Doctor = {
  name: "Dr. Ayesha Raza",
  specialty: "Cardiology",
  hospital: "City General Hospital",
};

const todaysSchedule: Appointment[] = [
  { time: "09:00 AM", patient: "Ibrar Ahmad", type: "Follow-up, Cardiology", status: "checked-in" },
  { time: "09:30 AM", patient: "Fatima Sheikh", type: "New Consultation", status: "waiting" },
  { time: "10:00 AM", patient: "Ahsan Tariq", type: "Post-op Review", status: "waiting" },
  { time: "10:30 AM", patient: "Zara Malik", type: "Follow-up", status: "completed" },
  { time: "11:00 AM", patient: "Bilal Hussain", type: "New Consultation", status: "completed" },
];

const resultsAwaitingReview = [
  { patient: "Ibrar Ahmad", test: "Lipid Profile", source: "ABC Laboratory", abnormal: true },
  { patient: "Fatima Sheikh", test: "Complete Blood Count", source: "ABC Laboratory", abnormal: false },
  { patient: "Ahsan Tariq", test: "Chest X-Ray", source: "City General Radiology", abnormal: false },
];

const patientVolume7d = [8, 11, 9, 14, 12, 6, 4];

const labResults: LabResult[] = [
  { parameter: "Hemoglobin", value: "14.2", unit: "g/dL", range: "13.0-17.0", flag: "normal" },
  { parameter: "WBC", value: "12.4", unit: "x10³/µL", range: "4.0-11.0", flag: "high" },
  { parameter: "Platelets", value: "245", unit: "x10³/µL", range: "150-400", flag: "normal" },
];

const clinicalOrders: ClinicalOrder[] = [
  { id: "LAB-2026-33810", type: "Laboratory · Lipid Profile + Troponin", status: "Result Ready", tone: "success" },
  { id: "RAD-2026-11207", type: "Radiology · ECG / Echocardiogram", status: "In Progress", tone: "warning" },
  { id: "RX-2026-90142", type: "Pharmacy · Atorvastatin 20mg OD", status: "Sent to Pharmacy", tone: "info" },
];

const vitals: Vital[] = [
  { label: "Blood Pressure", value: "128 / 82", unit: "mmHg" },
  { label: "Heart Rate", value: "76", unit: "bpm" },
  { label: "SpO2", value: "98", unit: "%" },
  { label: "Temperature", value: "37.0", unit: "°C" },
];

// --- public module API — pages import from here, never touch mock data directly ---
export const getCurrentPatient = () => mockRequest(currentPatient);
export const getCurrentDoctor = () => mockRequest(currentDoctor);
export const getTodaysSchedule = () => mockRequest(todaysSchedule);
export const getResultsAwaitingReview = () => mockRequest(resultsAwaitingReview);
export const getPatientVolume7d = () => mockRequest(patientVolume7d);
export const getLabResults = () => mockRequest(labResults);
export const getClinicalOrders = () => mockRequest(clinicalOrders);
export const getVitals = () => mockRequest(vitals);
