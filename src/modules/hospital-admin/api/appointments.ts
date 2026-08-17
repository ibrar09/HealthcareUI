import { mockRequest } from "@shared/lib/api/client";
import { TODAY } from "./core";
import { facilities, departmentConfigs } from "./facilities";
import { staffMembers, countDepartmentStaff } from "./staff";
import { patients, getPatientFullName, getIdentifier } from "./patients";

// Appointments — FHIR `Appointment` + `Schedule` + `Slot` (HMS_DOMAIN_STANDARDS.md §13-15).
// Status set is the richer FHIR-compatible domain model (FHIR Appointment.status
// really does include "checked-in", not just the condensed Proposed/Pending/
// Booked/Arrived/Fulfilled list) — distinguishing checked-in/waiting/in-progress
// is genuinely useful for a front-desk queue, and every value still maps cleanly
// to a FHIR status underneath (rescheduled = cancelled + a new linked Appointment
// at the FHIR layer, kept as one visible status here for operational clarity).
//
// Built in the phases the spec itself lays out (§50): this pass is Step 1 (Core
// UI — Dashboard, Calendar, List, Details, Create Appointment). Check-in/Cancel/
// Reschedule/No-show actions, Doctor Schedule configuration, Waitlist, and
// Referrals are later steps — Appointment Details only exposes "View Patient"
// here, same as Bed Details did before its own Phase 2.

export type AppointmentStatus =
  | "requested"
  | "pending-confirmation"
  | "confirmed"
  | "checked-in"
  | "waiting"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no-show";

export type AppointmentPriority = "routine" | "urgent" | "high" | "emergency";
export type AppointmentSource =
  | "reception"
  | "call-center"
  | "patient-mobile-app"
  | "patient-web-portal"
  | "doctor"
  | "referral"
  | "external-system"
  | "partner";

// Appointment Types are hospital-configurable, never hardcoded (spec §6) — same
// lookup-table pattern as Bed Types.
export interface AppointmentTypeConfig {
  id: string;
  name: string;
  defaultDurationMinutes: number;
  accentColor: string;
}

export const appointmentTypes: AppointmentTypeConfig[] = [
  { id: "at-new-patient", name: "New Patient", defaultDurationMinutes: 45, accentColor: "var(--vital-green)" },
  { id: "at-follow-up", name: "Follow-up", defaultDurationMinutes: 15, accentColor: "var(--signal-indigo)" },
  { id: "at-consultation", name: "Consultation", defaultDurationMinutes: 30, accentColor: "var(--module-radiology)" },
  { id: "at-procedure", name: "Procedure", defaultDurationMinutes: 60, accentColor: "var(--pulse-coral)" },
  { id: "at-annual-checkup", name: "Annual Check-up", defaultDurationMinutes: 30, accentColor: "var(--caution-amber)" },
  { id: "at-telemedicine", name: "Telemedicine", defaultDurationMinutes: 20, accentColor: "var(--outline)" },
];

export const getAppointmentTypes = () => mockRequest(appointmentTypes);

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  appointmentTypeId: string;
  reason?: string;
  notes?: string;
  /** ISO date+time, "2026-08-14T09:00" — local to the facility, no timezone math needed for a single-hospital mock. */
  start: string;
  end: string;
  priority: AppointmentPriority;
  source: AppointmentSource;
  patientId: string;
  practitionerId: string;
  departmentId?: string;
  facilityId: string;
  createdOn: string;
  cancellationReason?: string;
  /** Set on the OLD appointment when rescheduled — the FHIR layer would model this as cancelled + a linked new Appointment; we keep one visible "rescheduled" status for operational clarity (spec §24). */
  rescheduledToId?: string;
}

// Schedule (spec §10) — the working pattern a Calendar day/slot grid is computed
// from. Slots (spec §11) are never pre-materialized as data; they're derived on
// demand from the Schedule + existing Appointments, same as a real scheduling
// engine would — storing thousands of slot rows would just be duplicated state
// that could drift from the schedule that generated it.
interface ScheduleRecord {
  id: string;
  practitionerId: string;
  facilityId: string;
  departmentId?: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean;
}

const schedules: ScheduleRecord[] = [
  { id: "sched-sarah-jenkins", practitionerId: "sarah-jenkins", facilityId: "fac-main-campus", departmentId: "dept-cardiology", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "09:00", endTime: "17:00", slotDurationMinutes: 15, active: true },
  { id: "sched-robert-vance", practitionerId: "robert-vance", facilityId: "fac-main-campus", departmentId: "dept-neurology", workingDays: ["Mon", "Tue", "Thu", "Fri"], startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30, active: true },
  { id: "sched-michael-chen", practitionerId: "michael-chen", facilityId: "fac-main-campus", departmentId: "dept-opd", workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "09:00", endTime: "17:00", slotDurationMinutes: 20, active: true },
];

function toScheduleView(s: ScheduleRecord) {
  return {
    ...s,
    practitionerName: staffMembers.find((m) => m.id === s.practitionerId)?.name ?? "Unknown",
    departmentName: departmentConfigs.find((d) => d.id === s.departmentId)?.name,
  };
}

export const getSchedules = () => mockRequest(schedules.map(toScheduleView));
export const getSchedule = (id: string) => {
  const s = schedules.find((x) => x.id === id);
  return mockRequest(s ? toScheduleView(s) : null);
};

export interface NewScheduleInput {
  practitionerId: string;
  facilityId: string;
  departmentId?: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean;
}

/** Appointments Step 2 (spec §10) — one active schedule per practitioner drives their whole slot grid. */
export function createSchedule(input: NewScheduleInput) {
  const newSchedule: ScheduleRecord = { ...input, id: `sched-${input.practitionerId}-${Date.now()}` };
  schedules.push(newSchedule);
  return mockRequest(toScheduleView(newSchedule));
}

export function updateSchedule(id: string, updates: Partial<NewScheduleInput>) {
  const index = schedules.findIndex((s) => s.id === id);
  if (index !== -1) schedules[index] = { ...schedules[index], ...updates };
  return mockRequest(index !== -1 ? toScheduleView(schedules[index]) : null);
}

// Blocked Time (spec §14) — a doctor has time that isn't leave (surgery, meeting,
// admin block) but still isn't bookable. Independent of Doctor Leave (spec §13),
// which blocks whole days rather than a window within a working day.

export interface BlockedTime {
  id: string;
  practitionerId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

const blockedTimes: BlockedTime[] = [
  { id: "block-1", practitionerId: "sarah-jenkins", date: "2026-08-14", startTime: "13:15", endTime: "14:00", reason: "Cardiology case review" },
];

export const getBlockedTimes = (practitionerId?: string) =>
  mockRequest(practitionerId ? blockedTimes.filter((b) => b.practitionerId === practitionerId) : blockedTimes);

export interface NewBlockedTimeInput {
  practitionerId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export function createBlockedTime(input: NewBlockedTimeInput) {
  const newBlock: BlockedTime = { ...input, id: `block-${blockedTimes.length + 1}-${Date.now()}` };
  blockedTimes.push(newBlock);
  return mockRequest(newBlock);
}

export function removeBlockedTime(id: string) {
  const index = blockedTimes.findIndex((b) => b.id === id);
  if (index !== -1) blockedTimes.splice(index, 1);
  return mockRequest(true);
}

// Doctor Leave (spec §13) — whole-day(s) unavailability, overrides the regular
// working-day pattern entirely.

export type DoctorLeaveType = "annual" | "sick" | "training" | "conference" | "personal" | "hospital-closure";

export interface DoctorLeave {
  id: string;
  practitionerId: string;
  startDate: string;
  endDate: string;
  type: DoctorLeaveType;
  reason?: string;
}

const doctorLeaves: DoctorLeave[] = [
  { id: "leave-1", practitionerId: "robert-vance", startDate: "2026-08-19", endDate: "2026-08-21", type: "conference", reason: "Neurology Society annual meeting" },
];

function toDoctorLeaveView(l: DoctorLeave) {
  return { ...l, practitionerName: staffMembers.find((m) => m.id === l.practitionerId)?.name ?? "Unknown" };
}

export const getDoctorLeaves = (practitionerId?: string) =>
  mockRequest((practitionerId ? doctorLeaves.filter((l) => l.practitionerId === practitionerId) : doctorLeaves).map(toDoctorLeaveView));

export interface NewDoctorLeaveInput {
  practitionerId: string;
  startDate: string;
  endDate: string;
  type: DoctorLeaveType;
  reason?: string;
}

export function createDoctorLeave(input: NewDoctorLeaveInput) {
  const newLeave: DoctorLeave = { ...input, id: `leave-${doctorLeaves.length + 1}-${Date.now()}` };
  doctorLeaves.push(newLeave);
  return mockRequest(toDoctorLeaveView(newLeave));
}

export function removeDoctorLeave(id: string) {
  const index = doctorLeaves.findIndex((l) => l.id === id);
  if (index !== -1) doctorLeaves.splice(index, 1);
  return mockRequest(true);
}

function isOnLeave(practitionerId: string, date: string): DoctorLeave | undefined {
  return doctorLeaves.find((l) => l.practitionerId === practitionerId && date >= l.startDate && date <= l.endDate);
}

export const appointments: Appointment[] = [
  { id: "apt-1", status: "completed", appointmentTypeId: "at-follow-up", start: "2026-08-14T09:00", end: "2026-08-14T09:15", priority: "routine", source: "reception", patientId: "p-hamza-butt", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-01" },
  { id: "apt-2", status: "checked-in", appointmentTypeId: "at-new-patient", start: "2026-08-14T09:30", end: "2026-08-14T09:45", priority: "routine", source: "patient-web-portal", patientId: "p-ayesha-raza", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-05" },
  { id: "apt-3", status: "waiting", appointmentTypeId: "at-follow-up", start: "2026-08-14T10:00", end: "2026-08-14T10:15", priority: "routine", source: "reception", patientId: "p-rashid-qureshi", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-06" },
  { id: "apt-4", status: "in-progress", appointmentTypeId: "at-follow-up", start: "2026-08-14T10:15", end: "2026-08-14T10:30", priority: "urgent", source: "doctor", patientId: "p-amina-siddiqui", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-07" },
  { id: "apt-5", status: "confirmed", appointmentTypeId: "at-follow-up", start: "2026-08-14T10:45", end: "2026-08-14T11:00", priority: "routine", source: "call-center", patientId: "p-zara-malik", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-08" },
  { id: "apt-6", status: "no-show", appointmentTypeId: "at-consultation", start: "2026-08-14T11:45", end: "2026-08-14T12:00", priority: "routine", source: "patient-mobile-app", patientId: "p-saira-cheema", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-02" },
  { id: "apt-7", status: "cancelled", appointmentTypeId: "at-follow-up", start: "2026-08-14T13:00", end: "2026-08-14T13:15", priority: "routine", source: "reception", patientId: "p-bilal-hussain", practitionerId: "sarah-jenkins", departmentId: "dept-cardiology", facilityId: "fac-main-campus", createdOn: "2026-08-03", cancellationReason: "Patient request" },
  { id: "apt-8", status: "checked-in", appointmentTypeId: "at-follow-up", start: "2026-08-14T09:00", end: "2026-08-14T09:30", priority: "routine", source: "reception", patientId: "p-usman-khan", practitionerId: "robert-vance", departmentId: "dept-neurology", facilityId: "fac-main-campus", createdOn: "2026-08-04" },
  { id: "apt-9", status: "confirmed", appointmentTypeId: "at-consultation", start: "2026-08-14T09:30", end: "2026-08-14T10:00", priority: "routine", source: "referral", patientId: "p-layla-awan", practitionerId: "robert-vance", departmentId: "dept-neurology", facilityId: "fac-main-campus", createdOn: "2026-08-09" },
  { id: "apt-10", status: "cancelled", appointmentTypeId: "at-follow-up", start: "2026-08-14T10:30", end: "2026-08-14T11:00", priority: "routine", source: "reception", patientId: "p-omar-sethi", practitionerId: "robert-vance", departmentId: "dept-neurology", facilityId: "fac-main-campus", createdOn: "2026-08-03", cancellationReason: "Doctor unavailable" },
  { id: "apt-11", status: "confirmed", appointmentTypeId: "at-new-patient", start: "2026-08-14T09:00", end: "2026-08-14T09:20", priority: "routine", source: "patient-web-portal", patientId: "p-kamal-siddiqui", practitionerId: "michael-chen", departmentId: "dept-opd", facilityId: "fac-main-campus", createdOn: "2026-08-10" },
  { id: "apt-12", status: "completed", appointmentTypeId: "at-follow-up", start: "2026-08-14T09:20", end: "2026-08-14T09:40", priority: "routine", source: "reception", patientId: "p-noor-fatima", practitionerId: "michael-chen", departmentId: "dept-opd", facilityId: "fac-main-campus", createdOn: "2026-08-01" },
  { id: "apt-13", status: "pending-confirmation", appointmentTypeId: "at-consultation", start: "2026-08-14T09:40", end: "2026-08-14T10:00", priority: "high", source: "call-center", patientId: "p-hassan-abbasi", practitionerId: "michael-chen", departmentId: "dept-opd", facilityId: "fac-main-campus", createdOn: "2026-08-12" },
];

function getWeekdayShort(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

function addMinutesToTime(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export interface AppointmentListRow {
  id: string;
  status: AppointmentStatus;
  appointmentTypeId: string;
  appointmentTypeName: string;
  reason?: string;
  notes?: string;
  start: string;
  end: string;
  priority: AppointmentPriority;
  source: AppointmentSource;
  patientId: string;
  patientName: string;
  patientMrn?: string;
  practitionerId: string;
  practitionerName: string;
  departmentName?: string;
  facilityName: string;
  cancellationReason?: string;
  rescheduledToId?: string;
  rescheduledToStart?: string;
}

function toAppointmentRow(a: Appointment): AppointmentListRow {
  const patient = patients.find((p) => p.id === a.patientId);
  const practitioner = staffMembers.find((s) => s.id === a.practitionerId);
  const department = departmentConfigs.find((d) => d.id === a.departmentId);
  const facility = facilities.find((f) => f.id === a.facilityId);
  const rescheduledTo = a.rescheduledToId ? appointments.find((x) => x.id === a.rescheduledToId) : undefined;
  return {
    id: a.id,
    status: a.status,
    appointmentTypeId: a.appointmentTypeId,
    appointmentTypeName: appointmentTypes.find((t) => t.id === a.appointmentTypeId)?.name ?? "Unknown",
    reason: a.reason,
    notes: a.notes,
    start: a.start,
    end: a.end,
    priority: a.priority,
    source: a.source,
    patientId: a.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value : undefined,
    practitionerId: a.practitionerId,
    practitionerName: practitioner?.name ?? "Unknown",
    departmentName: department?.name,
    facilityName: facility?.name ?? "Unknown",
    cancellationReason: a.cancellationReason,
    rescheduledToId: a.rescheduledToId,
    rescheduledToStart: rescheduledTo?.start,
  };
}

const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = ["requested", "pending-confirmation", "confirmed", "checked-in", "waiting", "in-progress", "completed"];

export function getAppointments(
  params: { search?: string; status?: AppointmentStatus | "all"; practitionerId?: string | "all"; date?: string } = {}
) {
  const { search = "", status = "all", practitionerId = "all", date } = params;
  const q = search.trim().toLowerCase();
  const rows = appointments
    .map(toAppointmentRow)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => practitionerId === "all" || r.practitionerId === practitionerId)
    .filter((r) => !date || r.start.startsWith(date))
    .filter(
      (r) =>
        !q ||
        r.patientName.toLowerCase().includes(q) ||
        r.patientMrn?.toLowerCase().includes(q) ||
        r.practitionerName.toLowerCase().includes(q) ||
        (r.departmentName ?? "").toLowerCase().includes(q)
    )
    .sort((a, b) => a.start.localeCompare(b.start));
  return mockRequest(rows);
}

export const getAppointment = (id: string) => {
  const appt = appointments.find((a) => a.id === id);
  return mockRequest(appt ? toAppointmentRow(appt) : null);
};

export interface DaySlot {
  start: string;
  end: string;
  status: "available" | "booked" | "blocked";
  appointment?: AppointmentListRow;
  blockedReason?: string;
}

export interface DaySchedule {
  practitionerId: string;
  practitionerName: string;
  date: string;
  working: boolean;
  onLeave?: boolean;
  leaveReason?: string;
  slots: DaySlot[];
}

function overlaps(slotStart: string, slotEnd: string, rangeStart: string, rangeEnd: string): boolean {
  return slotStart < rangeEnd && slotEnd > rangeStart;
}

/** Computes a practitioner's day as a slot grid from their Schedule + Appointments + Blocked Time + Leave — never pre-stored. */
export function getDaySchedule(practitionerId: string, date: string) {
  const schedule = schedules.find((s) => s.practitionerId === practitionerId && s.active);
  const practitioner = staffMembers.find((s) => s.id === practitionerId);
  const result: DaySchedule = { practitionerId, practitionerName: practitioner?.name ?? "Unknown", date, working: false, slots: [] };
  if (!schedule) return mockRequest(result);

  const leave = isOnLeave(practitionerId, date);
  if (leave) {
    result.working = false;
    result.onLeave = true;
    result.leaveReason = `${leave.type} leave${leave.reason ? ` — ${leave.reason}` : ""}`;
    return mockRequest(result);
  }

  const weekday = getWeekdayShort(date);
  result.working = schedule.workingDays.includes(weekday);
  if (!result.working) return mockRequest(result);

  const dayAppointments = appointments.filter(
    (a) => a.practitionerId === practitionerId && a.start.startsWith(date) && ACTIVE_APPOINTMENT_STATUSES.includes(a.status)
  );
  const dayBlocks = blockedTimes.filter((b) => b.practitionerId === practitionerId && b.date === date);

  let t = schedule.startTime;
  while (t < schedule.endTime) {
    const end = addMinutesToTime(t, schedule.slotDurationMinutes);
    const match = dayAppointments.find((a) => a.start === `${date}T${t}`);
    const block = dayBlocks.find((b) => overlaps(t, end, b.startTime, b.endTime));
    result.slots.push({
      start: t,
      end,
      status: match ? "booked" : block ? "blocked" : "available",
      appointment: match ? toAppointmentRow(match) : undefined,
      blockedReason: block?.reason,
    });
    t = end;
  }
  return mockRequest(result);
}

export interface NewAppointmentInput {
  patientId: string;
  facilityId: string;
  departmentId?: string;
  practitionerId: string;
  appointmentTypeId: string;
  date: string;
  time: string;
  priority: AppointmentPriority;
  source: AppointmentSource;
  reason?: string;
}

/** Books a slot — the appointment service owns booking logic, never the caller (spec §17-18). */
export function createAppointment(input: NewAppointmentInput) {
  const schedule = schedules.find((s) => s.practitionerId === input.practitionerId && s.active);
  const type = appointmentTypes.find((t) => t.id === input.appointmentTypeId);
  const durationMinutes = type?.defaultDurationMinutes ?? schedule?.slotDurationMinutes ?? 30;
  const start = `${input.date}T${input.time}`;
  const end = `${input.date}T${addMinutesToTime(input.time, durationMinutes)}`;

  const conflict = appointments.some(
    (a) => a.practitionerId === input.practitionerId && a.start === start && ACTIVE_APPOINTMENT_STATUSES.includes(a.status)
  );
  if (conflict) throw new Error("This slot was just booked by someone else — pick another.");

  const newAppointment: Appointment = {
    id: `apt-${appointments.length + 1}-${Date.now()}`,
    status: "confirmed",
    appointmentTypeId: input.appointmentTypeId,
    reason: input.reason,
    start,
    end,
    priority: input.priority,
    source: input.source,
    patientId: input.patientId,
    practitionerId: input.practitionerId,
    departmentId: input.departmentId,
    facilityId: input.facilityId,
    createdOn: TODAY,
  };
  appointments.push(newAppointment);
  return mockRequest(toAppointmentRow(newAppointment));
}

// Appointments Step 3 — Patient Operations (spec §21, §23-27): the workflow
// that makes Appointment Details' action buttons real, same as Bed
// Management's Phase 2 did for Bed Details.

function findAppointmentOrThrow(id: string): Appointment {
  const appt = appointments.find((a) => a.id === id);
  if (!appt) throw new Error(`Appointment ${id} not found`);
  return appt;
}

/** Patient has arrived (spec §26). */
export function checkInAppointment(id: string) {
  const appt = findAppointmentOrThrow(id);
  appt.status = "checked-in";
  return mockRequest(toAppointmentRow(appt));
}

/** Queue calls the patient in — moves them from the waiting queue into the room (spec §27). */
export function startConsultation(id: string) {
  const appt = findAppointmentOrThrow(id);
  appt.status = "in-progress";
  return mockRequest(toAppointmentRow(appt));
}

export function completeConsultation(id: string) {
  const appt = findAppointmentOrThrow(id);
  appt.status = "completed";
  return mockRequest(toAppointmentRow(appt));
}

/** Spec §23: cancellation always records who/when/reason. */
export function cancelAppointment(id: string, reason: string) {
  const appt = findAppointmentOrThrow(id);
  appt.status = "cancelled";
  appt.cancellationReason = reason;
  return mockRequest(toAppointmentRow(appt));
}

/** Spec §25: the patient never arrived. */
export function markNoShow(id: string) {
  const appt = findAppointmentOrThrow(id);
  appt.status = "no-show";
  return mockRequest(toAppointmentRow(appt));
}

export interface RescheduleInput {
  appointmentId: string;
  date: string;
  time: string;
}

/** Spec §24: never just edit the date — keep the original record and link to the new one for auditability. */
export function rescheduleAppointment(input: RescheduleInput) {
  const original = findAppointmentOrThrow(input.appointmentId);
  const type = appointmentTypes.find((t) => t.id === original.appointmentTypeId);
  const schedule = schedules.find((s) => s.practitionerId === original.practitionerId && s.active);
  const durationMinutes = type?.defaultDurationMinutes ?? schedule?.slotDurationMinutes ?? 30;
  const start = `${input.date}T${input.time}`;
  const end = `${input.date}T${addMinutesToTime(input.time, durationMinutes)}`;

  const conflict = appointments.some(
    (a) => a.practitionerId === original.practitionerId && a.start === start && ACTIVE_APPOINTMENT_STATUSES.includes(a.status)
  );
  if (conflict) throw new Error("This slot was just booked by someone else — pick another.");

  const rescheduled: Appointment = {
    id: `apt-${appointments.length + 1}-${Date.now()}`,
    status: "confirmed",
    appointmentTypeId: original.appointmentTypeId,
    reason: original.reason,
    start,
    end,
    priority: original.priority,
    source: original.source,
    patientId: original.patientId,
    practitionerId: original.practitionerId,
    departmentId: original.departmentId,
    facilityId: original.facilityId,
    createdOn: TODAY,
  };
  appointments.push(rescheduled);
  original.status = "rescheduled";
  original.rescheduledToId = rescheduled.id;
  return mockRequest(toAppointmentRow(rescheduled));
}

// Queue (spec §27) — today's checked-in/waiting/in-progress patients, ordered
// by arrival (start time), across every doctor.
export function getTodayQueue() {
  const rows = appointments
    .filter((a) => a.start.startsWith(TODAY) && (a.status === "checked-in" || a.status === "waiting" || a.status === "in-progress"))
    .map(toAppointmentRow)
    .sort((a, b) => a.start.localeCompare(b.start));
  return mockRequest(rows);
}

export interface AppointmentDashboardData {
  todaysTotal: number;
  byStatus: Record<AppointmentStatus, number>;
  waitingPatients: number;
  availableSlotsToday: number;
  fullyBookedDoctors: number;
  pendingRequests: number;
  doctorUtilization: { name: string; booked: number; total: number; utilization: number }[];
  departmentUtilization: { name: string; booked: number; total: number; utilization: number }[];
}

export function getAppointmentDashboard() {
  const todays = appointments.filter((a) => a.start.startsWith(TODAY));
  const byStatus = todays.reduce(
    (acc, a) => {
      acc[a.status] += 1;
      return acc;
    },
    {
      requested: 0,
      "pending-confirmation": 0,
      confirmed: 0,
      "checked-in": 0,
      waiting: 0,
      "in-progress": 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
      "no-show": 0,
    } as Record<AppointmentStatus, number>
  );

  const doctorUtilization = schedules.map((s) => {
    const day = getWeekdayShort(TODAY);
    const working = s.workingDays.includes(day);
    const totalSlots = working ? Math.floor((toMinutes(s.endTime) - toMinutes(s.startTime)) / s.slotDurationMinutes) : 0;
    const booked = todays.filter((a) => a.practitionerId === s.practitionerId && ACTIVE_APPOINTMENT_STATUSES.includes(a.status)).length;
    return {
      name: staffMembers.find((m) => m.id === s.practitionerId)?.name ?? "Unknown",
      booked,
      total: totalSlots,
      utilization: totalSlots > 0 ? Math.round((booked / totalSlots) * 100) : 0,
    };
  });

  const deptGroups = new Map<string, { booked: number }>();
  for (const a of todays) {
    if (!ACTIVE_APPOINTMENT_STATUSES.includes(a.status)) continue;
    const dept = departmentConfigs.find((d) => d.id === a.departmentId);
    const name = dept?.name ?? "Unassigned";
    deptGroups.set(name, { booked: (deptGroups.get(name)?.booked ?? 0) + 1 });
  }
  const departmentUtilization = Array.from(deptGroups.entries()).map(([name, v]) => {
    const dept = departmentConfigs.find((d) => d.name === name);
    const total = dept ? Math.max(v.booked, countDepartmentStaff(dept.id)) : v.booked;
    return { name, booked: v.booked, total, utilization: total > 0 ? Math.round((v.booked / total) * 100) : 0 };
  });

  const availableSlotsToday = doctorUtilization.reduce((sum, d) => sum + Math.max(0, d.total - d.booked), 0);
  const fullyBookedDoctors = doctorUtilization.filter((d) => d.total > 0 && d.booked >= d.total).length;

  const data: AppointmentDashboardData = {
    todaysTotal: todays.length,
    byStatus,
    waitingPatients: byStatus["checked-in"] + byStatus.waiting,
    availableSlotsToday,
    fullyBookedDoctors,
    pendingRequests: byStatus.requested + byStatus["pending-confirmation"],
    doctorUtilization,
    departmentUtilization,
  };
  return mockRequest(data);
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

