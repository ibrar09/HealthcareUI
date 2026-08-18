import { mockRequest } from "@shared/lib/api/client";
import type { AppointmentPriority } from "./index";

// Distinct from a Requested appointment: a request has a tentative future
// date the patient proposed. A waitlist entry has no date at all — it's
// "notify me whenever a slot opens" — so it can't be modeled as an
// Appointment with an empty date; it needs its own shape entirely.

export interface WaitlistEntry {
  id: string;
  patientId: string;
  preferredWindow: string; // "Any time next week", "Mornings only", etc.
  reason: string;
  addedAt: string; // display date the patient was added
  priority: AppointmentPriority;
}

let waitlist: WaitlistEntry[] = [
  {
    id: "wl-1", patientId: "rp-14", preferredWindow: "Any time next week",
    reason: "Dietary counseling follow-up for fatty liver", addedAt: "17 Aug 2026", priority: "Routine",
  },
  {
    id: "wl-2", patientId: "rp-12", preferredWindow: "Mornings only",
    reason: "Routine follow-up, post-imaging clear", addedAt: "15 Aug 2026", priority: "Routine",
  },
];

export const getWaitlist = () => mockRequest([...waitlist]);

export function addToWaitlist(input: Omit<WaitlistEntry, "id">) {
  waitlist = [...waitlist, { id: `wl-${Date.now()}`, ...input }];
  return mockRequest([...waitlist]);
}

export function removeFromWaitlist(id: string) {
  waitlist = waitlist.filter((w) => w.id !== id);
  return mockRequest([...waitlist]);
}
