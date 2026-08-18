import { mockRequest } from "@shared/lib/api/client";
import type { EncounterType } from "./index";

// Doctor Portal's Appointments module — deliberately a separate dataset from
// the Dashboard's `doctorAppointments` (index.ts), not a shared one. That
// array models a single day's live consultation workspace (referring doctor,
// coverage expiry, special notes — fields specific to today's encounter
// card). This one models the full multi-day scheduling lifecycle (Requested
// through Completed/Cancelled/No-show) across past, today, and future dates.
// Where a patient appears in both (e.g. today's OPD roster), the two are
// kept in sync by hand rather than merged, to avoid a large cross-cutting
// refactor of the already-built Dashboard for this module's sake.

export const TODAY_ISO = "2026-08-18";

export type AppointmentStatus =
  | "Requested" | "Scheduled" | "Confirmed" | "Checked-in" | "Waiting"
  | "In Consultation" | "Completed" | "Cancelled" | "No-show" | "Rescheduled";

export type AppointmentPriority = "Routine" | "Urgent" | "High Priority" | "Emergency";

export type VisitType =
  | "New Consultation" | "Follow-up" | "Second Opinion" | "Chronic Disease Review"
  | "Post-Operative Follow-up" | "Procedure" | "Lab Consultation" | "Imaging Review"
  | "Telemedicine" | "Annual Check-up";

export interface AppointmentPreVisit {
  questionnaireComplete: boolean;
  insuranceVerified: boolean;
  previousRecordsAvailable: boolean;
  recentLabsAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string; // ISO yyyy-mm-dd, for sorting/date-navigation
  displayDate: string; // "18 Aug 2026"
  time: string; // "09:30 AM"
  duration: number; // minutes
  department: string;
  location: string;
  encounterType: EncounterType;
  visitType: VisitType;
  isNewPatient: boolean;
  priority: AppointmentPriority;
  reason: string;
  reasonDuration?: string;
  status: AppointmentStatus;
  checkedInAt?: string;
  preVisit: AppointmentPreVisit;
  notes?: string;
  cancelReason?: string;
  previousSlot?: string; // "18 Aug 2026, 10:00 AM" — set when rescheduled, for audit display
  preferredWindow?: string; // only meaningful while status === "Requested"
}

const appointments: Appointment[] = [
  {
    id: "APT-20260818-00101", patientId: "rp-1", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "08:00 AM", duration: 20,
    department: "Cardiology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Stomach pain", status: "Completed",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260818-00102", patientId: "rp-2", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "09:00 AM", duration: 20,
    department: "Cardiology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Headache follow-up", status: "Completed",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260818-00103", patientId: "rp-3", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "10:00 AM", duration: 20,
    department: "Cardiology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Acid reflux", status: "Completed",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260818-00104", patientId: "rp-4", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "11:00 AM", duration: 30,
    department: "Nephrology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "High Priority", reason: "CKD monitoring", reasonDuration: "Ongoing", status: "In Consultation",
    checkedInAt: "10:52 AM",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260818-00105", patientId: "rp-5", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "01:00 PM", duration: 30,
    department: "Cardiology", location: "OPD Room 4", encounterType: "OPD", visitType: "New Consultation", isNewPatient: true,
    priority: "Routine", reason: "Abdominal pain", reasonDuration: "3 days", status: "Waiting", checkedInAt: "12:55 PM",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: false, recentLabsAvailable: false },
  },
  {
    id: "APT-20260818-00106", patientId: "rp-6", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "02:00 PM", duration: 20,
    department: "Neurology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Post-concussion follow-up", status: "Confirmed",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260818-00107", patientId: "rp-7", date: TODAY_ISO, displayDate: "18 Aug 2026", time: "03:00 PM", duration: 15,
    department: "Cardiology", location: "Video Consultation", encounterType: "Telemedicine", visitType: "Telemedicine", isNewPatient: false,
    priority: "Routine", reason: "Tension headache", status: "Confirmed",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260729-00071", patientId: "rp-8", date: "2026-07-29", displayDate: "29 Jul 2026", time: "10:00 AM", duration: 20,
    department: "Endocrinology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "Routine", reason: "Diabetes review", status: "No-show",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260730-00072", patientId: "rp-10", date: "2026-07-30", displayDate: "30 Jul 2026", time: "11:00 AM", duration: 20,
    department: "Nephrology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "Routine", reason: "CKD monitoring", status: "No-show",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260812-00081", patientId: "rp-11", date: "2026-08-12", displayDate: "12 Aug 2026", time: "09:30 AM", duration: 20,
    department: "Cardiology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Lipid panel review", status: "Cancelled", cancelReason: "Patient request",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260820-00121", patientId: "rp-15", date: "2026-08-20", displayDate: "20 Aug 2026", time: "02:00 PM", duration: 20,
    department: "Endocrinology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "Urgent", reason: "Diabetes progress review", status: "Scheduled",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260822-00131", patientId: "rp-4", date: "2026-08-22", displayDate: "22 Aug 2026", time: "09:00 AM", duration: 30,
    department: "Nephrology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "High Priority", reason: "CKD monitoring", status: "Confirmed",
    preVisit: { questionnaireComplete: true, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260825-00141", patientId: "rp-11", date: "2026-08-25", displayDate: "25 Aug 2026", time: "10:30 AM", duration: 20,
    department: "Cardiology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Lipid panel review", status: "Scheduled",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260828-00151", patientId: "rp-10", date: "2026-08-28", displayDate: "28 Aug 2026", time: "11:00 AM", duration: 20,
    department: "Nephrology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "Routine", reason: "CKD monitoring", status: "Scheduled",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260825-00201", patientId: "rp-13", date: "2026-08-25", displayDate: "25 Aug 2026", time: "", duration: 20,
    department: "Endocrinology", location: "OPD Room 4", encounterType: "OPD", visitType: "Follow-up", isNewPatient: false,
    priority: "Routine", reason: "Thyroid follow-up", status: "Requested", preferredWindow: "Morning",
    preVisit: { questionnaireComplete: false, insuranceVerified: false, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
  {
    id: "APT-20260826-00202", patientId: "rp-8", date: "2026-08-26", displayDate: "26 Aug 2026", time: "", duration: 20,
    department: "Endocrinology", location: "OPD Room 4", encounterType: "OPD", visitType: "Chronic Disease Review", isNewPatient: false,
    priority: "Urgent", reason: "Diabetes follow-up after missed appointment", status: "Requested", preferredWindow: "Afternoon",
    preVisit: { questionnaireComplete: false, insuranceVerified: true, previousRecordsAvailable: true, recentLabsAvailable: true },
  },
];

function refreshedList() {
  // Always returns a fresh array reference — mockRequest returns the exact
  // object it's given, and setState with an unchanged reference makes React
  // bail out of re-rendering.
  return [...appointments];
}

export const getAppointments = () => mockRequest(refreshedList());
export const getAppointmentsByDate = (date: string) => mockRequest(appointments.filter((a) => a.date === date));
export const getAppointment = (id: string) => mockRequest(appointments.find((a) => a.id === id) ?? null);
export const getAppointmentsByPatient = (patientId: string) => mockRequest(appointments.filter((a) => a.patientId === patientId));

// Requests don't belong to "today" or any specific date the doctor happens
// to be browsing in List view — a patient's requested appointment can carry
// a tentative future date with no confirmed time, so it needs its own
// cross-date lookup rather than getAppointmentsByDate.
export const getRequestedAppointments = () => mockRequest(appointments.filter((a) => a.status === "Requested"));

export interface AppointmentSummary {
  today: number;
  upcoming: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export function getAppointmentSummary() {
  const summary: AppointmentSummary = {
    today: appointments.filter((a) => a.date === TODAY_ISO && a.status !== "Cancelled").length,
    upcoming: appointments.filter((a) => a.date > TODAY_ISO && (a.status === "Scheduled" || a.status === "Confirmed" || a.status === "Requested")).length,
    waiting: appointments.filter((a) => a.status === "Waiting").length,
    inProgress: appointments.filter((a) => a.status === "In Consultation").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
    noShow: appointments.filter((a) => a.status === "No-show").length,
  };
  return mockRequest(summary);
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus, extra?: { cancelReason?: string }) {
  const appt = appointments.find((a) => a.id === id);
  if (appt) {
    appt.status = status;
    if (status === "Checked-in") appt.checkedInAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (extra?.cancelReason) appt.cancelReason = extra.cancelReason;
  }
  return mockRequest(appt ?? null);
}

export function rescheduleAppointment(id: string, next: { date: string; displayDate: string; time: string }) {
  const appt = appointments.find((a) => a.id === id);
  if (appt) {
    appt.previousSlot = `${appt.displayDate}, ${appt.time}`;
    appt.date = next.date;
    appt.displayDate = next.displayDate;
    appt.time = next.time;
    appt.status = "Confirmed";
  }
  return mockRequest(appt ?? null);
}

export function acceptAppointmentRequest(id: string, slot: { date: string; displayDate: string; time: string }) {
  const appt = appointments.find((a) => a.id === id);
  if (appt) {
    appt.date = slot.date;
    appt.displayDate = slot.displayDate;
    appt.time = slot.time;
    appt.status = "Scheduled";
    appt.preferredWindow = undefined;
  }
  return mockRequest(appt ?? null);
}

export function declineAppointmentRequest(id: string, reason: string) {
  return updateAppointmentStatus(id, "Cancelled", { cancelReason: reason });
}

export interface NewAppointmentInput {
  patientId: string;
  date: string;
  displayDate: string;
  time: string;
  duration: number;
  department: string;
  location: string;
  encounterType: EncounterType;
  visitType: VisitType;
  isNewPatient: boolean;
  priority: AppointmentPriority;
  reason: string;
}

export function bookAppointment(input: NewAppointmentInput) {
  const seq = String(appointments.length + 1).padStart(5, "0");
  const appt: Appointment = {
    ...input,
    id: `APT-${input.date.replace(/-/g, "")}-${seq}`,
    status: "Scheduled",
    preVisit: { questionnaireComplete: false, insuranceVerified: false, previousRecordsAvailable: false, recentLabsAvailable: false },
  };
  appointments.push(appt);
  return mockRequest(appt);
}
