import { mockRequest } from "@shared/lib/api/client";
import type { Patient, Doctor } from "@shared/types/domain";

// Module-local sample data — only Doctor Portal screens use this file.
// Patient identities/geography/MRN format deliberately match Hospital
// Admin's own seed data (Lahore-based, MRN-2026-###### convention) rather
// than inventing a second fictional world — same patients could plausibly
// show up in both portals.

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

// --- Today's Appointments (rich shape backing the timeline + consultation card) --

export type DoctorAppointmentStatus = "attended" | "ongoing" | "upcoming";
export type PatientCategory = "New Patient" | "Regular Patient" | "Follow-Up";

export interface DoctorAppointment {
  id: string;
  time: string;
  timeSlot?: string;
  currentTime?: string;
  isBreak?: boolean;
  title?: string;
  name?: string;
  issue?: string;
  status?: DoctorAppointmentStatus;
  avatar?: string;
  type?: PatientCategory;
  assignedDoctor?: string;
  referringDoctor?: string;
  mrn?: string;
  occupation?: string;
  coverageExpiry?: string;
  details?: string;
  address?: string;
  specialNotes?: string;
  notes?: string;
}

const doctorAppointments: DoctorAppointment[] = [
  {
    id: "apt-1", time: "08:00", name: "Ibrar Ahmad", issue: "Stomach Pain", status: "attended",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-004417", occupation: "Architect", coverageExpiry: "10/05/2027", details: "Male, 31 Yrs",
    address: "12 Garden Town, Lahore", specialNotes: "Frequent abdominal cramping after meals.",
    notes: "Patient responded well to initial antacid therapy.",
  },
  {
    id: "apt-2", time: "09:00", name: "Fatima Sheikh", issue: "Headache", status: "attended",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    type: "Follow-Up", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Michael Chen",
    mrn: "MRN-2026-004892", occupation: "Software Engineer", coverageExpiry: "01/11/2027", details: "Female, 35 Yrs",
    address: "45 Model Town, Lahore", specialNotes: "Migraine episodes twice a week.",
    notes: "BP normal 120/80. Prescribed mild pain relief.",
  },
  {
    id: "apt-3", time: "10:00", name: "Zara Malik", issue: "GERD", status: "attended",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Robert Vance",
    mrn: "MRN-2026-005103", occupation: "Accountant", coverageExpiry: "15/09/2026", details: "Female, 41 Yrs",
    address: "8 DHA Phase 5, Lahore", specialNotes: "Acid reflux especially during evening.",
    notes: "Dietary adjustments recommended.",
  },
  {
    id: "apt-4", time: "11:00", timeSlot: "11:00 – 12:00", currentTime: "11:25",
    name: "Ahsan Tariq", issue: "On Consultation", status: "ongoing",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-003318", occupation: "Designer", coverageExpiry: "12/07/2027", details: "Male, 29 Yrs",
    address: "221 Johar Town, Lahore", specialNotes: "CKD stage 3, co-managed with Nephrology.",
    notes: "",
  },
  { id: "apt-5", time: "12:00", isBreak: true, title: "LUNCH BREAK" },
  {
    id: "apt-6", time: "13:00", name: "Bilal Hussain", issue: "Stomach Pain", status: "upcoming",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    type: "New Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-006220", occupation: "Teacher", coverageExpiry: "20/02/2028", details: "Male, 45 Yrs",
    address: "77 Township, Lahore", specialNotes: "Sharp lower abdominal pain.", notes: "",
  },
  {
    id: "apt-7", time: "14:00", name: "Kamal Siddiqui", issue: "Headache", status: "upcoming",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    type: "Follow-Up", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Amina Farooqi",
    mrn: "MRN-2026-004430", occupation: "Photographer", coverageExpiry: "11/08/2026", details: "Male, 38 Yrs",
    address: "5 Iqbal Town, Lahore", specialNotes: "Post-concussion follow up evaluation.", notes: "",
  },
  {
    id: "apt-8", time: "15:00", name: "Noor Fatima", issue: "Headache", status: "upcoming",
    avatar: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-005567", occupation: "Financial Analyst", coverageExpiry: "04/12/2026", details: "Female, 31 Yrs",
    address: "60 Gulberg III, Lahore", specialNotes: "Tension headaches due to long screen hours.", notes: "",
  },
];

// --- Follow-Up Patients (missed their scheduled review) ---------------------

export interface FollowUpPatient {
  id: string;
  name: string;
  avatar: string;
  date: string;
  condition: string;
  reason: string;
  phone: string;
  email: string;
}

const followUpPatients: FollowUpPatient[] = [
  {
    id: "fu-1", name: "Hamza Butt", date: "August 26, 2026", condition: "Diabetes",
    reason: "Didn't come for regular check-up.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    phone: "+92 300 1122334", email: "hamza.butt@gmail.com",
  },
  {
    id: "fu-2", name: "Saira Cheema", date: "August 26, 2026", condition: "Hypertension",
    reason: "Missed medication review appointment.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    phone: "+92 301 5566778", email: "saira.cheema@gmail.com",
  },
  {
    id: "fu-3", name: "Omar Sethi", date: "August 26, 2026", condition: "CKD Stage 3",
    reason: "Didn't come for regular check-up.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    phone: "+92 302 9988776", email: "omar.sethi@gmail.com",
  },
];

// --- Review Reports (labs/imaging awaiting doctor sign-off) -----------------

export type ReviewReportStatus = "Ready for Review" | "Action Required" | "Lab Completed" | "Radiology Approved" | "Pending Assessment";

export interface ReviewReport {
  id: string;
  name: string;
  avatar: string;
  date: string;
  testName: string;
  status: ReviewReportStatus;
  findings: string;
}

const reviewReports: ReviewReport[] = [
  {
    id: "rep-1", name: "Layla Awan", date: "August 26, 2026", testName: "Complete Blood Count & Lipid Panel",
    status: "Ready for Review",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    findings: "Cholesterol elevated (240 mg/dL). Hemoglobin within normal limits (14.2 g/dL).",
  },
  {
    id: "rep-2", name: "Rashid Qureshi", date: "August 26, 2026", testName: "Chest X-Ray Digital Imaging",
    status: "Radiology Approved",
    avatar: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=150&auto=format&fit=crop&q=80",
    findings: "Clear lung fields. No cardiomegaly or focal pulmonary consolidation identified.",
  },
  {
    id: "rep-3", name: "Amina Siddiqui", date: "August 26, 2026", testName: "Thyroid Panel (TSH, Free T4)",
    status: "Lab Completed",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    findings: "TSH: 2.4 mIU/L (Normal). Free T4: 1.1 ng/dL (Normal range).",
  },
  {
    id: "rep-4", name: "Mariam Farooq", date: "August 26, 2026", testName: "Abdominal Ultrasound",
    status: "Pending Assessment",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&auto=format&fit=crop&q=80",
    findings: "Mild hepatic steatosis (fatty liver grade 1). Gallbladder clear of calculi.",
  },
  {
    id: "rep-5", name: "Hassan Abbasi", date: "August 26, 2026", testName: "HbA1c Diabetes Progress Scan",
    status: "Action Required",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    findings: "HbA1c level: 6.8% (slightly above target 6.5%). Recommend medication adjustment.",
  },
];

// --- Summary cards (spec §1 KPI row) ----------------------------------------

export interface SummaryCardData {
  id: string;
  title: string;
  count: number;
  subtitle: string;
  chartColor: "slate" | "orange" | "brown" | "green" | "blue";
  chartValues: number[];
}

const summaryCards: SummaryCardData[] = [
  { id: "appointments", title: "Appointments", count: doctorAppointments.filter((a) => !a.isBreak).length, subtitle: "Today", chartColor: "slate", chartValues: [30, 50, 40, 80, 60] },
  { id: "new-patients", title: "New Patients", count: doctorAppointments.filter((a) => a.type === "New Patient").length, subtitle: "Today", chartColor: "orange", chartValues: [40, 70, 30, 90, 50] },
  { id: "follow-up", title: "Follow-Up Patients", count: followUpPatients.length, subtitle: "Overdue", chartColor: "brown", chartValues: [50, 40, 75, 60, 80] },
  { id: "review-reports", title: "Review Reports", count: reviewReports.length, subtitle: "Awaiting You", chartColor: "green", chartValues: [35, 60, 45, 95, 70] },
  { id: "feedback", title: "Feedback", count: 18, subtitle: "This Month", chartColor: "blue", chartValues: [60, 80, 50, 90, 70] },
];

export interface AttendedProgress {
  newPatients: { done: number; total: number };
  followUpPatients: { done: number; total: number };
}

const attendedProgress: AttendedProgress = {
  newPatients: { done: 1, total: 4 },
  followUpPatients: { done: 2, total: 3 },
};

// --- public module API — pages import from here, never touch mock data directly ---
export const getCurrentPatient = () => mockRequest(currentPatient);
export const getCurrentDoctor = () => mockRequest(currentDoctor);
export const getDoctorAppointments = () => mockRequest(doctorAppointments);
export const getFollowUpPatients = () => mockRequest(followUpPatients);
export const getReviewReports = () => mockRequest(reviewReports);
export const getSummaryCards = () => mockRequest(summaryCards);
export const getAttendedProgress = () => mockRequest(attendedProgress);

export function saveConsultationNotes(appointmentId: string, notes: string) {
  const appt = doctorAppointments.find((a) => a.id === appointmentId);
  if (appt) appt.notes = notes;
  return mockRequest(appt ?? null);
}

export function completeConsultation(appointmentId: string) {
  const appt = doctorAppointments.find((a) => a.id === appointmentId);
  if (appt) appt.status = "attended";
  return mockRequest(appt ?? null);
}
