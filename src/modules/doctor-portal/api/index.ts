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
  patientId?: string; // links to a RosterPatient.id for the patient detail/history view
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
    id: "apt-1", patientId: "rp-1", time: "08:00", name: "Ibrar Ahmad", issue: "Stomach Pain", status: "attended",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-004417", occupation: "Architect", coverageExpiry: "10/05/2027", details: "Male, 31 Yrs",
    address: "12 Garden Town, Lahore", specialNotes: "Frequent abdominal cramping after meals.",
    notes: "Patient responded well to initial antacid therapy.",
  },
  {
    id: "apt-2", patientId: "rp-2", time: "09:00", name: "Fatima Sheikh", issue: "Headache", status: "attended",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    type: "Follow-Up", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Michael Chen",
    mrn: "MRN-2026-004892", occupation: "Software Engineer", coverageExpiry: "01/11/2027", details: "Female, 35 Yrs",
    address: "45 Model Town, Lahore", specialNotes: "Migraine episodes twice a week.",
    notes: "BP normal 120/80. Prescribed mild pain relief.",
  },
  {
    id: "apt-3", patientId: "rp-3", time: "10:00", name: "Zara Malik", issue: "GERD", status: "attended",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Robert Vance",
    mrn: "MRN-2026-005103", occupation: "Accountant", coverageExpiry: "15/09/2026", details: "Female, 41 Yrs",
    address: "8 DHA Phase 5, Lahore", specialNotes: "Acid reflux especially during evening.",
    notes: "Dietary adjustments recommended.",
  },
  {
    id: "apt-4", patientId: "rp-4", time: "11:00", timeSlot: "11:00 – 12:00", currentTime: "11:25",
    name: "Ahsan Tariq", issue: "On Consultation", status: "ongoing",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-003318", occupation: "Designer", coverageExpiry: "12/07/2027", details: "Male, 29 Yrs",
    address: "221 Johar Town, Lahore", specialNotes: "CKD stage 3, co-managed with Nephrology.",
    notes: "",
  },
  { id: "apt-5", time: "12:00", isBreak: true, title: "LUNCH BREAK" },
  {
    id: "apt-6", patientId: "rp-5", time: "13:00", name: "Bilal Hussain", issue: "Stomach Pain", status: "upcoming",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    type: "New Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-006220", occupation: "Teacher", coverageExpiry: "20/02/2028", details: "Male, 45 Yrs",
    address: "77 Township, Lahore", specialNotes: "Sharp lower abdominal pain.", notes: "",
  },
  {
    id: "apt-7", patientId: "rp-6", time: "14:00", name: "Kamal Siddiqui", issue: "Headache", status: "upcoming",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    type: "Follow-Up", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Amina Farooqi",
    mrn: "MRN-2026-004430", occupation: "Photographer", coverageExpiry: "11/08/2026", details: "Male, 38 Yrs",
    address: "5 Iqbal Town, Lahore", specialNotes: "Post-concussion follow up evaluation.", notes: "",
  },
  {
    id: "apt-8", patientId: "rp-7", time: "15:00", name: "Noor Fatima", issue: "Headache", status: "upcoming",
    avatar: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=150&auto=format&fit=crop&q=80",
    type: "Regular Patient", assignedDoctor: "Dr. Ayesha Raza", referringDoctor: "Dr. Sarah Jenkins",
    mrn: "MRN-2026-005567", occupation: "Financial Analyst", coverageExpiry: "04/12/2026", details: "Female, 31 Yrs",
    address: "60 Gulberg III, Lahore", specialNotes: "Tension headaches due to long screen hours.", notes: "",
  },
];

// --- Follow-Up Patients (missed their scheduled review) ---------------------

export interface FollowUpPatient {
  id: string;
  patientId: string; // links to a RosterPatient.id for the patient detail/history view
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
    id: "fu-1", patientId: "rp-8", name: "Hamza Butt", date: "August 26, 2026", condition: "Diabetes",
    reason: "Didn't come for regular check-up.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    phone: "+92 300 1122334", email: "hamza.butt@gmail.com",
  },
  {
    id: "fu-2", patientId: "rp-9", name: "Saira Cheema", date: "August 26, 2026", condition: "Hypertension",
    reason: "Missed medication review appointment.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    phone: "+92 301 5566778", email: "saira.cheema@gmail.com",
  },
  {
    id: "fu-3", patientId: "rp-10", name: "Omar Sethi", date: "August 26, 2026", condition: "CKD Stage 3",
    reason: "Didn't come for regular check-up.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    phone: "+92 302 9988776", email: "omar.sethi@gmail.com",
  },
];

// --- Review Reports (labs/imaging awaiting doctor sign-off) -----------------

export type ReviewReportStatus = "Ready for Review" | "Action Required" | "Lab Completed" | "Radiology Approved" | "Pending Assessment";

export interface ReviewReport {
  id: string;
  patientId: string; // links to a RosterPatient.id for the patient detail/history view
  name: string;
  avatar: string;
  date: string;
  testName: string;
  status: ReviewReportStatus;
  findings: string;
}

const reviewReports: ReviewReport[] = [
  {
    id: "rep-1", patientId: "rp-11", name: "Layla Awan", date: "August 26, 2026", testName: "Complete Blood Count & Lipid Panel",
    status: "Ready for Review",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    findings: "Cholesterol elevated (240 mg/dL). Hemoglobin within normal limits (14.2 g/dL).",
  },
  {
    id: "rep-2", patientId: "rp-12", name: "Rashid Qureshi", date: "August 26, 2026", testName: "Chest X-Ray Digital Imaging",
    status: "Radiology Approved",
    avatar: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=150&auto=format&fit=crop&q=80",
    findings: "Clear lung fields. No cardiomegaly or focal pulmonary consolidation identified.",
  },
  {
    id: "rep-3", patientId: "rp-13", name: "Amina Siddiqui", date: "August 26, 2026", testName: "Thyroid Panel (TSH, Free T4)",
    status: "Lab Completed",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    findings: "TSH: 2.4 mIU/L (Normal). Free T4: 1.1 ng/dL (Normal range).",
  },
  {
    id: "rep-4", patientId: "rp-14", name: "Mariam Farooq", date: "August 26, 2026", testName: "Abdominal Ultrasound",
    status: "Pending Assessment",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&auto=format&fit=crop&q=80",
    findings: "Mild hepatic steatosis (fatty liver grade 1). Gallbladder clear of calculi.",
  },
  {
    id: "rep-5", patientId: "rp-15", name: "Hassan Abbasi", date: "August 26, 2026", testName: "HbA1c Diabetes Progress Scan",
    status: "Action Required",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    findings: "HbA1c level: 6.8% (slightly above target 6.5%). Recommend medication adjustment.",
  },
];

// --- My Patients roster (full panel list, search + filter chips) -----------

export type PatientRosterCategory = "today" | "follow-up-due" | "ipd" | "emergency" | "chronic-care" | "high-risk";
export type RosterStatusTone = "success" | "warning" | "critical" | "info" | "neutral";

export interface RosterPatient {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: "Male" | "Female";
  dob: string;
  mrn: string;
  phone: string;
  conditions: string[];
  lastVisit: string;
  status: string;
  statusTone: RosterStatusTone;
  categories: PatientRosterCategory[];
}

const patientRoster: RosterPatient[] = [
  {
    id: "rp-1", name: "Ibrar Ahmad", age: 31, gender: "Male", dob: "14 Mar 1995",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-004417", phone: "+92 300 4417220", conditions: ["GERD"],
    lastVisit: "Today, 08:00", status: "Stable", statusTone: "success", categories: ["today"],
  },
  {
    id: "rp-2", name: "Fatima Sheikh", age: 35, gender: "Female", dob: "02 Jun 1991",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-004892", phone: "+92 301 4892110", conditions: ["Migraine"],
    lastVisit: "Today, 09:00", status: "Stable", statusTone: "success", categories: ["today", "chronic-care"],
  },
  {
    id: "rp-3", name: "Zara Malik", age: 41, gender: "Female", dob: "27 Nov 1984",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-005103", phone: "+92 302 5103998", conditions: ["GERD"],
    lastVisit: "Today, 10:00", status: "Stable", statusTone: "success", categories: ["today"],
  },
  {
    id: "rp-4", name: "Ahsan Tariq", age: 29, gender: "Male", dob: "19 Feb 1997",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-003318", phone: "+92 303 3318775", conditions: ["CKD Stage 3"],
    lastVisit: "Today, 11:00", status: "On Consultation", statusTone: "info",
    categories: ["today", "chronic-care", "high-risk"],
  },
  {
    id: "rp-5", name: "Bilal Hussain", age: 45, gender: "Male", dob: "05 Sep 1980",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-006220", phone: "+92 304 6220441", conditions: ["Stomach Pain"],
    lastVisit: "Today, 13:00", status: "Upcoming", statusTone: "neutral", categories: ["today"],
  },
  {
    id: "rp-6", name: "Kamal Siddiqui", age: 38, gender: "Male", dob: "23 Jan 1988",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-004430", phone: "+92 305 4430229", conditions: ["Post-Concussion"],
    lastVisit: "Today, 14:00", status: "Upcoming", statusTone: "neutral", categories: ["today"],
  },
  {
    id: "rp-7", name: "Noor Fatima", age: 31, gender: "Female", dob: "11 Jul 1995",
    avatar: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-005567", phone: "+92 306 5567113", conditions: ["Tension Headache"],
    lastVisit: "Today, 15:00", status: "Upcoming", statusTone: "neutral", categories: ["today"],
  },
  {
    id: "rp-8", name: "Hamza Butt", age: 71, gender: "Male", dob: "08 Apr 1955",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-007741", phone: "+92 300 1122334", conditions: ["Diabetes"],
    lastVisit: "Jul 29, 2026", status: "Follow-Up Due", statusTone: "warning",
    categories: ["follow-up-due", "chronic-care"],
  },
  {
    id: "rp-9", name: "Saira Cheema", age: 52, gender: "Female", dob: "16 Dec 1973",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-007902", phone: "+92 301 5566778", conditions: ["Hypertensive Crisis"],
    lastVisit: "Aug 25, 2026", status: "Emergency Admit", statusTone: "critical",
    categories: ["emergency", "high-risk"],
  },
  {
    id: "rp-10", name: "Omar Sethi", age: 58, gender: "Male", dob: "30 Aug 1967",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008015", phone: "+92 302 9988776", conditions: ["CKD Stage 3"],
    lastVisit: "Jul 30, 2026", status: "Follow-Up Due", statusTone: "warning",
    categories: ["follow-up-due", "chronic-care", "high-risk"],
  },
  {
    id: "rp-11", name: "Layla Awan", age: 44, gender: "Female", dob: "21 May 1981",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008220", phone: "+92 303 7743311", conditions: ["Hyperlipidemia"],
    lastVisit: "Aug 12, 2026", status: "Follow-Up Due", statusTone: "warning",
    categories: ["follow-up-due", "chronic-care"],
  },
  {
    id: "rp-12", name: "Rashid Qureshi", age: 36, gender: "Male", dob: "03 Oct 1989",
    avatar: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008349", phone: "+92 304 8812256", conditions: ["Post-Imaging Review"],
    lastVisit: "Aug 10, 2026", status: "Stable", statusTone: "success", categories: [],
  },
  {
    id: "rp-13", name: "Amina Siddiqui", age: 29, gender: "Female", dob: "17 Feb 1997",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008477", phone: "+92 305 3345567", conditions: ["Hypothyroidism"],
    lastVisit: "Aug 08, 2026", status: "Stable", statusTone: "success", categories: ["chronic-care"],
  },
  {
    id: "rp-14", name: "Mariam Farooq", age: 47, gender: "Female", dob: "09 Sep 1978",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008590", phone: "+92 306 6654432", conditions: ["Fatty Liver Grade 1"],
    lastVisit: "Aug 05, 2026", status: "Follow-Up Due", statusTone: "warning", categories: ["follow-up-due"],
  },
  {
    id: "rp-15", name: "Hassan Abbasi", age: 62, gender: "Male", dob: "25 Jun 1963",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008711", phone: "+92 300 9987654", conditions: ["Diabetes", "HbA1c Elevated"],
    lastVisit: "Aug 02, 2026", status: "High-Risk", statusTone: "critical",
    categories: ["chronic-care", "high-risk"],
  },
  {
    id: "rp-16", name: "Elena Rodriguez", age: 39, gender: "Female", dob: "14 Jan 1987",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008856", phone: "+92 301 2247890", conditions: ["Post-Cardiac Admission"],
    lastVisit: "Admitted Aug 15, 2026", status: "IPD · Ward 3B", statusTone: "info", categories: ["ipd"],
  },
  {
    id: "rp-17", name: "Usman Khan", age: 55, gender: "Male", dob: "11 Nov 1970",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    mrn: "MRN-2026-008902", phone: "+92 302 8834521", conditions: ["Post-Operative Recovery"],
    lastVisit: "Admitted Aug 16, 2026", status: "IPD · Post-Op", statusTone: "info", categories: ["ipd"],
  },
];

// --- Patient History (full clinical record backing the Patient Detail view) -
// Each roster patient gets a mixed timeline: visits (Encounter), diagnoses
// (Condition), medications (MedicationRequest), labs/imaging (Observation/
// DiagnosticReport), and clinical notes (DocumentReference) — kept as
// separate typed entries per HMS_DOMAIN_STANDARDS rather than one generic
// "history" text blob, then rendered as a single filterable timeline.

export type HistoryEntryType = "visit" | "condition" | "medication" | "order" | "lab" | "note";

export interface PatientHistoryEntry {
  id: string;
  type: HistoryEntryType;
  date: string;
  title: string;
  summary: string;
  meta?: string;
  tone?: RosterStatusTone;
}

export interface PatientAllergy {
  substance: string;
  reaction: string;
}

export interface PatientHistory {
  patientId: string;
  allergies: PatientAllergy[];
  entries: PatientHistoryEntry[];
}

const patientHistories: Record<string, PatientHistory> = {
  "rp-1": {
    patientId: "rp-1",
    allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis reported 2022" }],
    entries: [
      { id: "rp-1-e1", type: "visit", date: "Today, 08:00", title: "Cardiology Consultation", summary: "Frequent abdominal cramping after meals.", meta: "Dr. Ayesha Raza" },
      { id: "rp-1-e2", type: "condition", date: "Jun 2026", title: "GERD", summary: "Ongoing management, diet-responsive.", tone: "info" },
      { id: "rp-1-e3", type: "medication", date: "Jul 21, 2026", title: "Omeprazole 20mg", summary: "Once daily, active prescription.", meta: "Prescribed by Dr. Ayesha Raza", tone: "info" },
      { id: "rp-1-e4", type: "note", date: "Today, 08:00", title: "Consultation Note", summary: "Patient responded well to initial antacid therapy." },
      { id: "rp-1-e5", type: "visit", date: "Jul 21, 2026", title: "Cardiology Review", summary: "Routine cardiology review, no new complaints.", meta: "Dr. Ayesha Raza" },
    ],
  },
  "rp-2": {
    patientId: "rp-2",
    allergies: [],
    entries: [
      { id: "rp-2-e1", type: "visit", date: "Today, 09:00", title: "Follow-Up Consultation", summary: "BP normal 120/80. Prescribed mild pain relief.", meta: "Dr. Ayesha Raza" },
      { id: "rp-2-e2", type: "condition", date: "Jan 2026", title: "Migraine", summary: "Episodes roughly twice a week.", tone: "warning" },
      { id: "rp-2-e3", type: "medication", date: "Today, 09:00", title: "Sumatriptan 50mg", summary: "As needed for acute episodes, active.", tone: "info" },
      { id: "rp-2-e4", type: "lab", date: "Jan 11, 2026", title: "MRI Brain", summary: "Normal — no structural abnormality identified.", tone: "success" },
    ],
  },
  "rp-3": {
    patientId: "rp-3",
    allergies: [],
    entries: [
      { id: "rp-3-e1", type: "visit", date: "Today, 10:00", title: "Gastroenterology Review", summary: "Dietary adjustments recommended.", meta: "Dr. Ayesha Raza" },
      { id: "rp-3-e2", type: "condition", date: "Sep 2025", title: "GERD", summary: "Acid reflux, especially in the evening.", tone: "info" },
      { id: "rp-3-e3", type: "medication", date: "Today, 10:00", title: "Pantoprazole 40mg", summary: "Once daily, active prescription.", tone: "info" },
    ],
  },
  "rp-4": {
    patientId: "rp-4",
    allergies: [{ substance: "NSAIDs", reaction: "Worsens renal function — avoid" }],
    entries: [
      { id: "rp-4-e1", type: "visit", date: "Today, 11:00", title: "On Consultation", summary: "CKD stage 3, co-managed with Nephrology.", meta: "Dr. Ayesha Raza", tone: "critical" },
      { id: "rp-4-e2", type: "condition", date: "Mar 2025", title: "Chronic Kidney Disease — Stage 3", summary: "Active, high-risk, co-managed with Nephrology.", tone: "critical" },
      { id: "rp-4-e3", type: "medication", date: "Jul 2027", title: "Losartan 50mg", summary: "Once daily, active prescription.", tone: "info" },
      { id: "rp-4-e4", type: "lab", date: "Jul 12, 2027", title: "Serum Creatinine", summary: "2.1 mg/dL — elevated.", tone: "warning" },
    ],
  },
  "rp-5": {
    patientId: "rp-5",
    allergies: [],
    entries: [
      { id: "rp-5-e1", type: "visit", date: "Today, 13:00", title: "New Patient Intake", summary: "Sharp lower abdominal pain.", meta: "Dr. Ayesha Raza" },
      { id: "rp-5-e2", type: "condition", date: "Today, 13:00", title: "Suspected Gastritis", summary: "Under investigation — first visit.", tone: "warning" },
    ],
  },
  "rp-6": {
    patientId: "rp-6",
    allergies: [],
    entries: [
      { id: "rp-6-e1", type: "visit", date: "Today, 14:00", title: "Follow-Up Consultation", summary: "Post-concussion follow-up evaluation.", meta: "Dr. Ayesha Raza" },
      { id: "rp-6-e2", type: "condition", date: "Jul 2026", title: "Post-Concussion Syndrome", summary: "Resolving, no red-flag symptoms.", tone: "success" },
      { id: "rp-6-e3", type: "visit", date: "Jul 2026", title: "Emergency Visit", summary: "Minor head injury, concussion diagnosed.", meta: "Dr. Amina Farooqi" },
      { id: "rp-6-e4", type: "note", date: "Today, 14:00", title: "Consultation Note", summary: "Cleared for gradual activity return." },
    ],
  },
  "rp-7": {
    patientId: "rp-7",
    allergies: [],
    entries: [
      { id: "rp-7-e1", type: "visit", date: "Today, 15:00", title: "Consultation", summary: "Tension headaches due to long screen hours.", meta: "Dr. Ayesha Raza" },
      { id: "rp-7-e2", type: "condition", date: "Today, 15:00", title: "Tension-Type Headache", summary: "Active, lifestyle-related.", tone: "info" },
      { id: "rp-7-e3", type: "note", date: "Today, 15:00", title: "Consultation Note", summary: "Advised screen breaks; ergonomic assessment referral." },
    ],
  },
  "rp-8": {
    patientId: "rp-8",
    allergies: [],
    entries: [
      { id: "rp-8-e1", type: "note", date: "Jul 29, 2026", title: "Missed Appointment", summary: "Didn't come for regular check-up — reminder sent.", tone: "warning" },
      { id: "rp-8-e2", type: "visit", date: "Jun 2026", title: "Endocrinology Review", summary: "Routine diabetes review.", meta: "Dr. Ayesha Raza" },
      { id: "rp-8-e3", type: "condition", date: "2019", title: "Type 2 Diabetes Mellitus", summary: "Active, long-term management.", tone: "warning" },
      { id: "rp-8-e4", type: "medication", date: "Jun 2026", title: "Metformin 1000mg", summary: "Twice daily, active prescription.", tone: "info" },
      { id: "rp-8-e5", type: "lab", date: "Jun 2026", title: "HbA1c", summary: "7.9% — above target.", tone: "warning" },
    ],
  },
  "rp-9": {
    patientId: "rp-9",
    allergies: [],
    entries: [
      { id: "rp-9-e1", type: "visit", date: "Aug 25, 2026", title: "Emergency Admission", summary: "Hypertensive crisis, BP 190/120.", meta: "Emergency Department", tone: "critical" },
      { id: "rp-9-e2", type: "condition", date: "2021", title: "Essential Hypertension", summary: "Active, high-risk.", tone: "critical" },
      { id: "rp-9-e3", type: "medication", date: "Aug 25, 2026", title: "Amlodipine 10mg", summary: "Once daily, active prescription.", tone: "info" },
      { id: "rp-9-e4", type: "note", date: "Aug 25, 2026", title: "Missed Appointment", summary: "Missed medication review appointment prior to admission.", tone: "warning" },
    ],
  },
  "rp-10": {
    patientId: "rp-10",
    allergies: [{ substance: "Ibuprofen", reaction: "Nephrotoxic — contraindicated" }],
    entries: [
      { id: "rp-10-e1", type: "note", date: "Jul 30, 2026", title: "Missed Appointment", summary: "Didn't come for regular check-up.", tone: "warning" },
      { id: "rp-10-e2", type: "visit", date: "May 2026", title: "Nephrology Review", summary: "CKD Stage 3 monitoring.", meta: "Dr. Ayesha Raza" },
      { id: "rp-10-e3", type: "condition", date: "2022", title: "Chronic Kidney Disease — Stage 3", summary: "Active, high-risk.", tone: "critical" },
      { id: "rp-10-e4", type: "medication", date: "May 2026", title: "Furosemide 20mg", summary: "Once daily, active prescription.", tone: "info" },
      { id: "rp-10-e5", type: "lab", date: "May 2026", title: "eGFR", summary: "42 mL/min/1.73m² — reduced.", tone: "warning" },
    ],
  },
  "rp-11": {
    patientId: "rp-11",
    allergies: [],
    entries: [
      { id: "rp-11-e1", type: "note", date: "Aug 26, 2026", title: "Ready for Review", summary: "Recommend statin dose adjustment.", tone: "info" },
      { id: "rp-11-e2", type: "lab", date: "Aug 26, 2026", title: "Cholesterol", summary: "240 mg/dL — elevated.", tone: "warning" },
      { id: "rp-11-e3", type: "lab", date: "Aug 26, 2026", title: "Hemoglobin", summary: "14.2 g/dL — normal.", tone: "success" },
      { id: "rp-11-e4", type: "condition", date: "2023", title: "Hyperlipidemia", summary: "Active, diet and statin managed.", tone: "warning" },
    ],
  },
  "rp-12": {
    patientId: "rp-12",
    allergies: [],
    entries: [
      { id: "rp-12-e1", type: "note", date: "Aug 26, 2026", title: "Radiology Approved", summary: "No follow-up imaging needed.", tone: "success" },
      { id: "rp-12-e2", type: "lab", date: "Aug 26, 2026", title: "Chest X-Ray", summary: "Clear lung fields, no cardiomegaly.", tone: "success" },
      { id: "rp-12-e3", type: "visit", date: "Aug 2026", title: "Radiology", summary: "Chest X-Ray digital imaging.", meta: "Radiology Dept." },
    ],
  },
  "rp-13": {
    patientId: "rp-13",
    allergies: [],
    entries: [
      { id: "rp-13-e1", type: "visit", date: "Aug 2026", title: "Endocrinology Review", summary: "Thyroid panel review.", meta: "Dr. Ayesha Raza" },
      { id: "rp-13-e2", type: "condition", date: "2020", title: "Hypothyroidism", summary: "Active, medication-managed.", tone: "info" },
      { id: "rp-13-e3", type: "medication", date: "Aug 2026", title: "Levothyroxine 75mcg", summary: "Once daily, active prescription.", tone: "info" },
      { id: "rp-13-e4", type: "lab", date: "Aug 26, 2026", title: "TSH / Free T4", summary: "TSH 2.4 mIU/L, Free T4 1.1 ng/dL — both normal.", tone: "success" },
    ],
  },
  "rp-14": {
    patientId: "rp-14",
    allergies: [],
    entries: [
      { id: "rp-14-e1", type: "note", date: "Aug 26, 2026", title: "Pending Assessment", summary: "Dietary counseling recommended.", tone: "warning" },
      { id: "rp-14-e2", type: "lab", date: "Aug 26, 2026", title: "Abdominal Ultrasound", summary: "Mild hepatic steatosis, gallbladder clear of calculi.", tone: "warning" },
      { id: "rp-14-e3", type: "condition", date: "Aug 2026", title: "Fatty Liver — Grade 1", summary: "Newly diagnosed.", tone: "warning" },
    ],
  },
  "rp-15": {
    patientId: "rp-15",
    allergies: [{ substance: "Sulfa drugs", reaction: "Skin rash reported 2018" }],
    entries: [
      { id: "rp-15-e1", type: "note", date: "Aug 26, 2026", title: "Action Required", summary: "Recommend medication adjustment.", tone: "critical" },
      { id: "rp-15-e2", type: "lab", date: "Aug 26, 2026", title: "HbA1c", summary: "6.8% — slightly above target 6.5%.", tone: "warning" },
      { id: "rp-15-e3", type: "condition", date: "2015", title: "Type 2 Diabetes Mellitus", summary: "Active, high-risk, long-term management.", tone: "critical" },
      { id: "rp-15-e4", type: "medication", date: "Aug 2026", title: "Metformin 1000mg + Glimepiride 2mg", summary: "Twice daily, active prescription.", tone: "info" },
    ],
  },
  "rp-16": {
    patientId: "rp-16",
    allergies: [],
    entries: [
      { id: "rp-16-e1", type: "visit", date: "Aug 15, 2026", title: "Admission — Ward 3B", summary: "Post-cardiac event, admitted for monitoring.", meta: "Cardiology", tone: "critical" },
      { id: "rp-16-e2", type: "condition", date: "Aug 2026", title: "Acute Coronary Syndrome", summary: "Active, high-risk, inpatient.", tone: "critical" },
      { id: "rp-16-e3", type: "medication", date: "Aug 15, 2026", title: "Aspirin 75mg + Atorvastatin 40mg", summary: "Once daily, active prescription.", tone: "info" },
      { id: "rp-16-e4", type: "note", date: "Aug 16, 2026", title: "Ward Round Note", summary: "Stable post-admission, continuing cardiac monitoring." },
    ],
  },
  "rp-17": {
    patientId: "rp-17",
    allergies: [],
    entries: [
      { id: "rp-17-e1", type: "visit", date: "Aug 16, 2026", title: "Admission — Post-Operative Ward", summary: "Post-operative recovery, general surgery.", meta: "General Surgery" },
      { id: "rp-17-e2", type: "condition", date: "Aug 2026", title: "Post-Surgical Recovery", summary: "Active, inpatient monitoring.", tone: "info" },
      { id: "rp-17-e3", type: "medication", date: "Aug 16, 2026", title: "Paracetamol 1g", summary: "Every 6 hours as needed, active.", tone: "info" },
      { id: "rp-17-e4", type: "note", date: "Aug 16, 2026", title: "Ward Round Note", summary: "Recovering well, wound healing on track." },
    ],
  },
};

// Adds a new entry to a patient's history. Rebuilds the history object and
// its entries array as fresh references (never mutates in place) — mockRequest
// returns the exact object it's given, and setState with an unchanged
// reference makes React bail out of re-rendering (see mockRequest gotcha).
function addHistoryEntry(patientId: string, entry: PatientHistoryEntry): PatientHistory {
  const existing = patientHistories[patientId] ?? { patientId, allergies: [], entries: [] };
  const updated: PatientHistory = { ...existing, entries: [entry, ...existing.entries] };
  patientHistories[patientId] = updated;
  return updated;
}

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
export const getPatientRoster = () => mockRequest(patientRoster);

export function getRosterPatient(patientId: string) {
  return mockRequest(patientRoster.find((p) => p.id === patientId) ?? null);
}

export function getPatientHistory(patientId: string) {
  return mockRequest(patientHistories[patientId] ?? { patientId, allergies: [], entries: [] });
}

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

// --- Clinical Workspace / Encounter (structured diagnosis/prescription/order authoring) ---
// Diagnosis (Condition), prescription (MedicationRequest), and lab/imaging
// order (ServiceRequest) are kept as separate typed inputs rather than one
// generic "add to encounter" form — each is a different clinical object with
// its own lifecycle, per the domain-model standard.

export interface EncounterDiagnosisInput {
  name: string;
  status: "Active" | "Resolved" | "Chronic";
  notes?: string;
}

export interface EncounterPrescriptionInput {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export type OrderUrgency = "Routine" | "Urgent" | "STAT";

export interface EncounterOrderInput {
  testName: string;
  urgency: OrderUrgency;
  instructions?: string;
}

export function addEncounterDiagnosis(patientId: string, input: EncounterDiagnosisInput) {
  const entry: PatientHistoryEntry = {
    id: `${patientId}-dx-${Date.now()}`,
    type: "condition",
    date: "Today",
    title: input.name,
    summary: input.notes?.trim() || `${input.status} diagnosis recorded during today's encounter.`,
    meta: "Dr. Ayesha Raza",
    tone: input.status === "Chronic" ? "critical" : input.status === "Active" ? "warning" : "success",
  };
  return mockRequest(addHistoryEntry(patientId, entry));
}

export function addEncounterPrescription(patientId: string, input: EncounterPrescriptionInput) {
  const entry: PatientHistoryEntry = {
    id: `${patientId}-rx-${Date.now()}`,
    type: "medication",
    date: "Today",
    title: `${input.medication} — ${input.dosage}`,
    summary: `${input.frequency}, ${input.duration}.${input.instructions ? ` ${input.instructions}` : ""}`,
    meta: "Prescribed by Dr. Ayesha Raza",
    tone: "info",
  };
  return mockRequest(addHistoryEntry(patientId, entry));
}

export function addEncounterOrder(patientId: string, input: EncounterOrderInput) {
  const entry: PatientHistoryEntry = {
    id: `${patientId}-ord-${Date.now()}`,
    type: "order",
    date: "Today",
    title: input.testName,
    summary: input.instructions?.trim() || `${input.urgency} order placed during today's encounter.`,
    meta: `${input.urgency} · Ordered by Dr. Ayesha Raza`,
    tone: input.urgency === "STAT" ? "critical" : input.urgency === "Urgent" ? "warning" : "info",
  };
  return mockRequest(addHistoryEntry(patientId, entry));
}

export function addEncounterNote(patientId: string, note: string) {
  const entry: PatientHistoryEntry = {
    id: `${patientId}-note-${Date.now()}`,
    type: "note",
    date: "Today",
    title: "Encounter Note",
    summary: note,
    meta: "Dr. Ayesha Raza",
  };
  return mockRequest(addHistoryEntry(patientId, entry));
}

export function finishEncounter(patientId: string, appointmentId?: string) {
  if (appointmentId) {
    const appt = doctorAppointments.find((a) => a.id === appointmentId);
    if (appt) appt.status = "attended";
  }
  const patient = patientRoster.find((p) => p.id === patientId);
  if (patient) patient.lastVisit = "Today";
  return mockRequest(patientHistories[patientId] ?? null);
}
