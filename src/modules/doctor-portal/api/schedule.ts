import { mockRequest } from "@shared/lib/api/client";
import type { VisitType } from "./index";

// Doctor Portal's Schedule module — the narrower "Core" slice: weekly
// working hours, breaks, blocked time/leave, and per-visit-type slot
// durations. Deliberately excludes the day/week/month calendar view,
// holidays, multi-facility, on-call, and resource-aware scheduling —
// those need infrastructure (facilities, resources, multi-doctor
// coordination) this module doesn't have yet.

export type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface DayHours {
  day: DayName;
  enabled: boolean;
  start: string; // "09:00", 24h
  end: string; // "17:00", 24h
  breakStart?: string;
  breakEnd?: string;
}

export interface BlockedTime {
  id: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  label: string;
}

export interface SlotDurationConfig {
  visitType: VisitType;
  minutes: number;
}

const DAY_NAMES: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const workingHours: DayHours[] = [
  { day: "Monday", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "13:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "14:00" },
  { day: "Saturday", enabled: false, start: "09:00", end: "13:00" },
  { day: "Sunday", enabled: false, start: "09:00", end: "13:00" },
];

let blockedTimes: BlockedTime[] = [
  { id: "block-1", startDate: "2026-08-21", endDate: "2026-08-21", label: "Doctor Conference" },
  { id: "block-2", startDate: "2026-08-30", endDate: "2026-08-31", label: "Personal Leave" },
];

let slotDurations: SlotDurationConfig[] = [
  { visitType: "New Consultation", minutes: 30 },
  { visitType: "Follow-up", minutes: 15 },
  { visitType: "Second Opinion", minutes: 30 },
  { visitType: "Chronic Disease Review", minutes: 20 },
  { visitType: "Post-Operative Follow-up", minutes: 20 },
  { visitType: "Procedure", minutes: 60 },
  { visitType: "Lab Consultation", minutes: 15 },
  { visitType: "Imaging Review", minutes: 15 },
  { visitType: "Telemedicine", minutes: 15 },
  { visitType: "Annual Check-up", minutes: 30 },
];

export const getWorkingHours = () => mockRequest([...workingHours]);
export const getBlockedTimes = () => mockRequest([...blockedTimes]);
export const getSlotDurations = () => mockRequest([...slotDurations]);

export function updateDayHours(day: DayName, updates: Partial<Omit<DayHours, "day">>) {
  const entry = workingHours.find((d) => d.day === day);
  if (entry) Object.assign(entry, updates);
  return mockRequest([...workingHours]);
}

export function addBlockedTime(input: { startDate: string; endDate: string; label: string }) {
  blockedTimes = [...blockedTimes, { id: `block-${Date.now()}`, ...input }];
  return mockRequest([...blockedTimes]);
}

export function removeBlockedTime(id: string) {
  blockedTimes = blockedTimes.filter((b) => b.id !== id);
  return mockRequest([...blockedTimes]);
}

export function updateSlotDuration(visitType: VisitType, minutes: number) {
  slotDurations = slotDurations.map((s) => (s.visitType === visitType ? { ...s, minutes } : s));
  return mockRequest([...slotDurations]);
}

export function getDayOfWeek(iso: string): DayName {
  // Local calendar day-of-week — safe from the toISOString() UTC-shift bug
  // fixed in AppointmentDateNav, since getDay() never round-trips through UTC.
  const jsDay = new Date(`${iso}T00:00:00`).getDay(); // 0 = Sunday
  return DAY_NAMES[(jsDay + 6) % 7]; // rotate so 0 = Monday, matching DAY_NAMES order
}

/** Pure, synchronous check against already-fetched schedule data — used for live form validation without round-tripping through mockRequest on every keystroke. */
export function checkSlotAgainstSchedule(hours: DayHours[], blocked: BlockedTime[], date: string, time24: string): string[] {
  const warnings: string[] = [];
  const dayName = getDayOfWeek(date);
  const dayHours = hours.find((d) => d.day === dayName);

  if (!dayHours || !dayHours.enabled) {
    warnings.push(`${dayName} is not a working day.`);
  } else {
    if (time24 < dayHours.start || time24 > dayHours.end) {
      warnings.push(`Outside working hours (${dayHours.start}–${dayHours.end}).`);
    } else if (dayHours.breakStart && dayHours.breakEnd && time24 >= dayHours.breakStart && time24 < dayHours.breakEnd) {
      warnings.push(`Falls within the scheduled break (${dayHours.breakStart}–${dayHours.breakEnd}).`);
    }
  }

  const blockedMatch = blocked.find((b) => date >= b.startDate && date <= b.endDate);
  if (blockedMatch) warnings.push(`This date is blocked: ${blockedMatch.label}.`);

  return warnings;
}
