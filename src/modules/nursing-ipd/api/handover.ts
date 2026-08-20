import { mockRequest } from "@shared/lib/api/client";

// Shift Handover — the end-of-shift briefing that hands each patient's
// status to the incoming nurse. Deliberately doesn't re-model patient data;
// it reads the same NursePatient records the rest of the portal already
// maintains and adds just one new thing: a free-text handover note per
// patient, since that's the one piece of information this screen actually
// originates rather than just summarizing.

export interface HandoverNote {
  patientId: string;
  note: string;
  updatedAt: string;
}

let handoverNotes: HandoverNote[] = [
  { patientId: "np-1", note: "Watch SpO₂ closely — trending low overnight. Next antibiotic dose due 10:00.", updatedAt: "07:50" },
  { patientId: "np-4", note: "Discharge-ready pending physician sign-off. Family aware and on standby.", updatedAt: "08:00" },
];

export function getHandoverNote(patientId: string) {
  return mockRequest(handoverNotes.find((n) => n.patientId === patientId)?.note ?? "");
}

export function saveHandoverNote(patientId: string, note: string) {
  const existing = handoverNotes.find((n) => n.patientId === patientId);
  if (existing) {
    existing.note = note;
    existing.updatedAt = "just now";
  } else {
    handoverNotes = [...handoverNotes, { patientId, note, updatedAt: "just now" }];
  }
  return mockRequest(note);
}

export function getAllHandoverNotes() {
  return mockRequest([...handoverNotes]);
}
