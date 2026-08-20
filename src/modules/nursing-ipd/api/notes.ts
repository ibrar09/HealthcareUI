import { mockRequest } from "@shared/lib/api/client";
import { getMyPatients, syncNoteStatus } from "./patients";
import type { NursePatient } from "./patients";

// Nursing Notes — free-text is still backed by a coded note type per
// HMS_DOMAIN_STANDARDS.md's Clinical Notes section (type, author, date/time,
// subject, content, status), never a single unstructured box with nothing
// else. Filing a note for a patient marks that patient's `noteStatus`
// Documented for the shift, synced back through patients.ts.

export type NoteType = "Shift Note" | "Incident" | "General";

export interface NursingNote {
  id: string;
  patientId: string;
  type: NoteType;
  content: string;
  authorName: string;
  createdAt: string;
}

let notes: NursingNote[] = [
  {
    id: "note-1", patientId: "np-4", type: "Shift Note", authorName: "Nurse Fatima Khalid", createdAt: "08:10",
    content: "Blood glucose stable overnight, DKA resolving well. Tolerating oral fluids. Discharge planning discussed with attending.",
  },
  {
    id: "note-2", patientId: "np-6", type: "Shift Note", authorName: "Nurse Fatima Khalid", createdAt: "08:30",
    content: "Cellulitis site redness continuing to reduce. Contact precautions maintained. IV antibiotics tolerated without reaction.",
  },
];

export function getNotesForPatient(patientId: string) {
  return mockRequest([...notes].filter((n) => n.patientId === patientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export interface NotesQueueItem {
  patient: NursePatient;
  lastNoteAt?: string;
}

export async function getNotesQueue(): Promise<NotesQueueItem[]> {
  const patients = await getMyPatients();
  // getMyPatients() above already simulated the network delay once.
  return patients.map((patient) => ({
    patient,
    lastNoteAt: [...notes].filter((n) => n.patientId === patient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt,
  }));
}

export function addNote(patientId: string, type: NoteType, content: string) {
  const note: NursingNote = { id: `note-${Date.now()}`, patientId, type, content, authorName: "Nurse Fatima Khalid", createdAt: "just now" };
  notes = [note, ...notes];
  syncNoteStatus(patientId, "Documented");
  return mockRequest(note);
}
