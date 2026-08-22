import { mockRequest } from "@shared/lib/api/client";

// EDEncounter — the central ED entity. Status lifecycle condensed from
// the spec's full chain (Arrived→Registered→Triaged→Waiting→BedAssigned→
// InTreatment→Observation/Reassessment→DispositionDecision→Discharged/
// Admitted/Transferred/Other) into states that still tell the real
// clinical story without a dozen screens showing "nothing changed yet"
// between them.

export type ArrivalMethod = "Walk-in" | "Ambulance" | "Police" | "Referral" | "Transfer";
export type AcuityLevel = 1 | 2 | 3 | 4 | 5;
export type EDArea = "Resuscitation" | "Trauma" | "Acute Care" | "Fast Track" | "Observation";
export type EncounterStatus = "Arrived" | "Triaged" | "Waiting" | "In Treatment" | "Observation" | "Disposition Pending" | "Discharged" | "Admitted" | "Transferred" | "LWBS" | "AMA" | "Deceased";

export const ACUITY_LABEL: Record<AcuityLevel, string> = { 1: "Resuscitation", 2: "Emergent", 3: "Urgent", 4: "Less Urgent", 5: "Non-Urgent" };
export const ACUITY_COLOR: Record<AcuityLevel, string> = { 1: "#dc2626", 2: "#f97316", 3: "#eab308", 4: "#22c55e", 5: "#3b82f6" };

export interface ClinicalNote {
  text: string;
  author: string;
  at: string;
}

export interface EDEncounter {
  id: string;
  patientId: string;
  arrivalMethod: ArrivalMethod;
  arrivedAt: string;
  chiefComplaint: string;
  acuityLevel?: AcuityLevel;
  area?: EDArea;
  bedId?: string;
  assignedDoctor?: string;
  assignedNurse?: string;
  status: EncounterStatus;
  isolation?: string;
  notes: ClinicalNote[];
}

let encounters: EDEncounter[] = [
  { id: "enc-1", patientId: "ep-1", arrivalMethod: "Walk-in", arrivedAt: "07:40", chiefComplaint: "Chest pain, radiating to left arm", acuityLevel: 2, area: "Acute Care", bedId: "bed-5", assignedDoctor: "Dr. Ahsan Malik", assignedNurse: "Nurse Amina Riaz", status: "In Treatment", notes: [{ text: "Patient alert, oriented. Pain 7/10 on arrival, now 4/10 after analgesia. ECG shows sinus tachycardia, no acute ST changes. Troponin pending.", author: "Dr. Ahsan Malik", at: "07:50" }] },
  { id: "enc-2", patientId: "ep-2", arrivalMethod: "Ambulance", arrivedAt: "07:55", chiefComplaint: "Motor vehicle collision, suspected fracture", acuityLevel: 1, area: "Trauma", bedId: "bed-3", assignedDoctor: "Dr. Sana Riaz", assignedNurse: "Nurse Hamza Iqbal", status: "In Treatment", notes: [{ text: "Primary survey: airway patent, breathing equal bilaterally, circulation intact with two large-bore IVs. Left femur deformity noted, distal pulses present. CT trauma series ordered.", author: "Dr. Sana Riaz", at: "08:00" }] },
  { id: "enc-3", patientId: "ep-3", arrivalMethod: "Walk-in", arrivedAt: "08:05", chiefComplaint: "Shortness of breath, known COPD", acuityLevel: 2, area: "Acute Care", bedId: "bed-6", assignedDoctor: "Dr. Ahsan Malik", assignedNurse: "Nurse Amina Riaz", status: "Observation", notes: [{ text: "Known COPD, acute exacerbation. Started on nebulized salbutamol and oxygen. ABG shows respiratory acidosis, pCO2 critically elevated — notified.", author: "Dr. Ahsan Malik", at: "08:18" }] },
  { id: "enc-4", patientId: "ep-4", arrivalMethod: "Walk-in", arrivedAt: "08:10", chiefComplaint: "High fever, 39.4°C at home", status: "Arrived", notes: [] },
  { id: "enc-5", patientId: "ep-5", arrivalMethod: "Walk-in", arrivedAt: "08:15", chiefComplaint: "Ankle sprain after fall", acuityLevel: 4, area: "Fast Track", bedId: "bed-11", assignedDoctor: "Dr. Bilal Chaudhry", status: "In Treatment", notes: [{ text: "Right ankle swelling, unable to bear weight. X-ray ordered to rule out fracture. Splinted for comfort in the meantime.", author: "Dr. Bilal Chaudhry", at: "08:23" }] },
  { id: "enc-6", patientId: "ep-6", arrivalMethod: "Referral", arrivedAt: "08:20", chiefComplaint: "Suspected contact dermatitis reaction", status: "Arrived", notes: [] },
  { id: "enc-7", patientId: "ep-7", arrivalMethod: "Police", arrivedAt: "08:25", chiefComplaint: "Found unresponsive, identity unknown", acuityLevel: 1, area: "Resuscitation", bedId: "bed-1", assignedDoctor: "Dr. Sana Riaz", assignedNurse: "Nurse Hamza Iqbal", status: "In Treatment", notes: [{ text: "Unidentified male, found unresponsive by police. GCS 9 on arrival, improved to 12 after naloxone. Toxicology and CBC pending. Awaiting ICU/toxicology consult.", author: "Dr. Sana Riaz", at: "08:30" }] },
  { id: "enc-8", patientId: "ep-8", arrivalMethod: "Walk-in", arrivedAt: "08:00", chiefComplaint: "Abdominal pain, right lower quadrant", acuityLevel: 3, status: "Waiting", notes: [] },
];

export const getEncounters = () => mockRequest([...encounters]);
export const getEncounterById = (id: string) => mockRequest(encounters.find((e) => e.id === id) ?? null);

export function getEncounterSync(id: string) {
  return encounters.find((e) => e.id === id);
}

export function setEncounterStatus(id: string, status: EncounterStatus) {
  const e = encounters.find((x) => x.id === id);
  if (e) e.status = status;
  encounters = [...encounters];
  return mockRequest([...encounters]);
}

export function assignBed(id: string, bedId: string, area: EDArea) {
  const e = encounters.find((x) => x.id === id);
  if (e) { e.bedId = bedId; e.area = area; e.status = "In Treatment"; }
  encounters = [...encounters];
  return mockRequest([...encounters]);
}

export function assignTeam(id: string, doctor: string, nurse: string) {
  const e = encounters.find((x) => x.id === id);
  if (e) { e.assignedDoctor = doctor; e.assignedNurse = nurse; }
  encounters = [...encounters];
  return mockRequest([...encounters]);
}

export function addClinicalNote(id: string, text: string, author: string) {
  const e = encounters.find((x) => x.id === id);
  if (e) e.notes = [...e.notes, { text, author, at: "just now" }];
  encounters = [...encounters];
  return mockRequest([...encounters]);
}

export function setAcuity(id: string, level: AcuityLevel) {
  const e = encounters.find((x) => x.id === id);
  if (e) { e.acuityLevel = level; if (e.status === "Arrived") e.status = "Waiting"; }
  encounters = [...encounters];
  return mockRequest([...encounters]);
}
