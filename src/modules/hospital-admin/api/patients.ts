import { mockRequest } from "@shared/lib/api/client";
import { PersonName, getFullName } from "./core";
import { facilities } from "./facilities";

// Patient Administration — registry, demographics, and visit history.
//
// Data model follows HMS_DOMAIN_STANDARDS.md §5-6: a patient's identity is a set of
// Identifiers (MRN, national ID, universal health ID, ...), not one "Patient ID"
// field, and name is structured (given/family), not a single free-text string.
// The mock roster below is still authored as flat, readable rows for maintainability
// — `buildIdentifiers`/`parseName` do the mapping into the standards-aligned shape,
// the same "author at a convenient layer, map to the structured model" pattern the
// spec itself describes.

export type PatientStatus = "active" | "discharged" | "pending-verification" | "flagged" | "merged";

export type IdentifierType = "mrn" | "national-id" | "passport" | "insurance-id" | "universal-health-id" | "external-org-id";

export interface PatientIdentifier {
  type: IdentifierType;
  value: string;
  issuer: string;
  status: "active" | "inactive" | "entered-in-error";
  verified: boolean;
  period: { start: string; end?: string };
}

export type PatientName = PersonName;

export interface VisitRecord {
  date: string;
  department: string;
  provider: string;
  reason: string;
}

export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "unknown";
export type CommunicationPreference = "phone" | "email" | "sms";

export interface Patient {
  id: string;
  name: PatientName;
  preferredName?: string;
  dob: string;
  gender: "male" | "female" | "other" | "unknown";
  maritalStatus: MaritalStatus;
  identifiers: PatientIdentifier[];
  status: PatientStatus;
  possibleDuplicateOf?: string;
  /** Set when `status` is "merged" — FHIR Patient.link (replaced-by) equivalent. */
  mergedInto?: string;
  /** FHIR Patient.managingOrganization — which facility owns this record. */
  managingOrganizationId: string;
  registeredOn: string;
  lastVisit: string;
  primaryProvider: string;
  phone: string;
  email: string;
  address: string;
  communicationPreference: CommunicationPreference;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
  visits: VisitRecord[];
}

export function getPatientFullName(name: PatientName): string {
  return getFullName(name);
}

export function getIdentifier(identifiers: PatientIdentifier[], type: IdentifierType): PatientIdentifier | undefined {
  return identifiers.find((i) => i.type === type);
}

function parseName(full: string): PatientName {
  const parts = full.trim().split(/\s+/);
  const family = parts[parts.length - 1];
  const given = parts.slice(0, -1).join(" ") || family;
  return { given, family };
}

function buildIdentifiers(
  seed: Pick<PatientSeed, "mrn" | "universalHealthId" | "nationalId" | "identifiersVerified" | "registeredOn">
): PatientIdentifier[] {
  const verified = seed.identifiersVerified ?? true;
  const period = { start: seed.registeredOn };
  const identifiers: PatientIdentifier[] = [
    { type: "mrn", value: seed.mrn, issuer: "City General Hospital", status: "active", verified, period },
    { type: "universal-health-id", value: seed.universalHealthId, issuer: "National Health Authority", status: "active", verified, period },
  ];
  if (seed.nationalId) {
    identifiers.push({ type: "national-id", value: seed.nationalId, issuer: "NADRA", status: "active", verified: true, period });
  }
  return identifiers;
}

function age(dob: string): number {
  const diff = new Date(2026, 7, 14).getTime() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

interface PatientSeed {
  id: string;
  fullName: string;
  preferredName?: string;
  dob: string;
  gender: Patient["gender"];
  maritalStatus?: MaritalStatus;
  mrn: string;
  universalHealthId: string;
  nationalId?: string;
  /** Unverified identifiers are what actually trigger MPI duplicate review — defaults to true. */
  identifiersVerified?: boolean;
  status: PatientStatus;
  possibleDuplicateOf?: string;
  /** Defaults to Main Campus — every seed patient was registered there. */
  managingOrganizationId?: string;
  registeredOn: string;
  lastVisit: string;
  primaryProvider: string;
  phone: string;
  email: string;
  address: string;
  communicationPreference?: CommunicationPreference;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  /** Defaults to "Family Member" — the specific relationship wasn't captured for these seed records. */
  emergencyContactRelationship?: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
}

export const patientSeeds: PatientSeed[] = [
  { id: "p-sarah-jenkins", fullName: "Sarah Jenkins", dob: "1988-03-12", gender: "female", mrn: "MRN-2026-004417", universalHealthId: "UHR-PK-772104", nationalId: "35202-1234567-1", status: "active", registeredOn: "2023-10-12", lastVisit: "2026-08-10", primaryProvider: "Dr. Sarah Jenkins", phone: "+1 (555) 220-3301", email: "sarah.j.patient@gmail.com", address: "12 Aslam Road, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-88213-A", emergencyContactName: "David Jenkins", emergencyContactPhone: "+1 (555) 220-3302" },
  { id: "p-marcus-chen-1", fullName: "Marcus Chen", dob: "1975-11-02", gender: "male", mrn: "MRN-2026-008922", universalHealthId: "UHR-PK-881029", identifiersVerified: false, status: "active", possibleDuplicateOf: "p-marcus-chen-2", registeredOn: "2023-10-24", lastVisit: "2026-08-09", primaryProvider: "Dr. Robert Vance", phone: "+1 (555) 220-3303", email: "marcus.chen@gmail.com", address: "8 Canal View, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-44210-B", emergencyContactName: "Linda Chen", emergencyContactPhone: "+1 (555) 220-3304" },
  { id: "p-marcus-chen-2", fullName: "Marcus J. Chen", dob: "1975-11-02", gender: "male", mrn: "MRN-2025-091533", universalHealthId: "UHR-PK-881030", identifiersVerified: false, status: "pending-verification", possibleDuplicateOf: "p-marcus-chen-1", registeredOn: "2025-02-18", lastVisit: "2025-02-18", primaryProvider: "Unassigned", phone: "+1 (555) 220-3303", email: "m.chen@gmail.com", address: "8 Canal View, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-44210-B", emergencyContactName: "Linda Chen", emergencyContactPhone: "+1 (555) 220-3304" },
  { id: "p-elena-rodriguez", fullName: "Elena Rodriguez", dob: "1992-06-25", gender: "female", mrn: "MRN-2025-091102", universalHealthId: "UHR-PK-334910", status: "active", registeredOn: "2023-09-05", lastVisit: "2026-07-28", primaryProvider: "Dr. Calvin Osei", phone: "+1 (555) 220-3305", email: "elena.rodriguez@gmail.com", address: "3 Mall Road, Lahore", insuranceProvider: "EFU Health", insurancePolicyNumber: "EFU-22310-C", emergencyContactName: "Carlos Rodriguez", emergencyContactPhone: "+1 (555) 220-3306" },
  { id: "p-ibrar-ahmad", fullName: "Ibrar Ahmad", dob: "1980-01-19", gender: "male", mrn: "MRN-2026-004501", universalHealthId: "UHR-PK-772210", nationalId: "35202-2234567-3", status: "active", registeredOn: "2024-01-08", lastVisit: "2026-08-14", primaryProvider: "Dr. Reynolds", phone: "+1 (555) 220-3307", email: "ibrar.ahmad@gmail.com", address: "20 Gulberg, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-91820-D", emergencyContactName: "Uzma Ahmad", emergencyContactPhone: "+1 (555) 220-3308" },
  { id: "p-fatima-sheikh", fullName: "Fatima Sheikh", dob: "1995-09-30", gender: "female", mrn: "MRN-2026-004502", universalHealthId: "UHR-PK-772211", status: "active", registeredOn: "2024-01-09", lastVisit: "2026-08-14", primaryProvider: "Dr. Brenda Cole", phone: "+1 (555) 220-3309", email: "fatima.sheikh@gmail.com", address: "5 Model Town, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-73320-E", emergencyContactName: "Kamal Sheikh", emergencyContactPhone: "+1 (555) 220-3310" },
  { id: "p-ahsan-tariq", fullName: "Ahsan Tariq", dob: "1968-04-14", gender: "male", mrn: "MRN-2025-088213", universalHealthId: "UHR-PK-651029", status: "discharged", registeredOn: "2022-05-30", lastVisit: "2026-08-14", primaryProvider: "Dr. Rabecca Iqbal", phone: "+1 (555) 220-3311", email: "ahsan.tariq@gmail.com", address: "17 Defence, Lahore", insuranceProvider: "EFU Health", insurancePolicyNumber: "EFU-10233-F", emergencyContactName: "Mahnoor Tariq", emergencyContactPhone: "+1 (555) 220-3312" },
  { id: "p-zara-malik", fullName: "Zara Malik", dob: "2001-12-05", gender: "female", mrn: "MRN-2026-004509", universalHealthId: "UHR-PK-772218", status: "discharged", registeredOn: "2024-02-14", lastVisit: "2026-08-14", primaryProvider: "Dr. Calvin Osei", phone: "+1 (555) 220-3313", email: "zara.malik@gmail.com", address: "9 Johar Town, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-55210-G", emergencyContactName: "Bilal Malik", emergencyContactPhone: "+1 (555) 220-3314" },
  { id: "p-bilal-hussain", fullName: "Bilal Hussain", dob: "1990-07-08", gender: "male", mrn: "MRN-2026-004512", universalHealthId: "UHR-PK-772221", identifiersVerified: false, status: "flagged", registeredOn: "2024-03-01", lastVisit: "2026-08-14", primaryProvider: "Dr. Gregory Han", phone: "+1 (555) 220-3315", email: "bilal.hussain@gmail.com", address: "2 Cavalry Ground, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-90911-H", emergencyContactName: "Sana Hussain", emergencyContactPhone: "+1 (555) 220-3316" },
  { id: "p-ayesha-raza", fullName: "Ayesha Raza", dob: "1985-02-22", gender: "female", mrn: "MRN-2025-077213", universalHealthId: "UHR-PK-551209", status: "active", registeredOn: "2022-11-19", lastVisit: "2026-08-01", primaryProvider: "Dr. Sarah Jenkins", phone: "+1 (555) 220-3317", email: "ayesha.raza@gmail.com", address: "11 Iqbal Town, Lahore", insuranceProvider: "EFU Health", insurancePolicyNumber: "EFU-33021-I", emergencyContactName: "Hassan Raza", emergencyContactPhone: "+1 (555) 220-3318" },
  { id: "p-kamal-siddiqui", fullName: "Kamal Siddiqui", dob: "1972-10-17", gender: "male", mrn: "MRN-2025-077214", universalHealthId: "UHR-PK-551210", status: "active", registeredOn: "2022-11-20", lastVisit: "2026-07-15", primaryProvider: "Dr. Elena Rostova", phone: "+1 (555) 220-3319", email: "kamal.siddiqui@gmail.com", address: "6 Faisal Town, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-66432-J", emergencyContactName: "Nadia Siddiqui", emergencyContactPhone: "+1 (555) 220-3320" },
  { id: "p-hassan-abbasi", fullName: "Hassan Abbasi", dob: "1998-05-03", gender: "male", mrn: "MRN-2025-062098", universalHealthId: "UHR-PK-441098", identifiersVerified: false, status: "pending-verification", registeredOn: "2025-06-02", lastVisit: "2025-06-02", primaryProvider: "Unassigned", phone: "+1 (555) 220-3321", email: "hassan.abbasi@gmail.com", address: "14 Township, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-12093-K", emergencyContactName: "Farah Abbasi", emergencyContactPhone: "+1 (555) 220-3322" },
  { id: "p-mariam-farooq", fullName: "Mariam Farooq", dob: "1993-08-27", gender: "female", mrn: "MRN-2025-062099", universalHealthId: "UHR-PK-441099", identifiersVerified: false, status: "pending-verification", registeredOn: "2025-06-03", lastVisit: "2025-06-03", primaryProvider: "Unassigned", phone: "+1 (555) 220-3323", email: "mariam.farooq@gmail.com", address: "18 Wapda Town, Lahore", insuranceProvider: "EFU Health", insurancePolicyNumber: "EFU-77032-L", emergencyContactName: "Usman Farooq", emergencyContactPhone: "+1 (555) 220-3324" },
  { id: "p-usman-khan", fullName: "Usman Khan", dob: "1965-01-30", gender: "male", mrn: "MRN-2024-051287", universalHealthId: "UHR-PK-331287", status: "active", registeredOn: "2021-07-14", lastVisit: "2026-06-20", primaryProvider: "Dr. Robert Vance", phone: "+1 (555) 220-3325", email: "usman.khan@gmail.com", address: "22 DHA Phase 5, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-20938-M", emergencyContactName: "Sara Khan", emergencyContactPhone: "+1 (555) 220-3326" },
  { id: "p-noor-fatima", fullName: "Noor Fatima", dob: "2010-04-11", gender: "female", mrn: "MRN-2024-051288", universalHealthId: "UHR-PK-331288", status: "active", registeredOn: "2021-07-15", lastVisit: "2026-05-30", primaryProvider: "Dr. Calvin Osei", phone: "+1 (555) 220-3327", email: "guardian.fatima@gmail.com", address: "22 DHA Phase 5, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-40921-N", emergencyContactName: "Noor Sr. Fatima", emergencyContactPhone: "+1 (555) 220-3328" },
  { id: "p-hamza-butt", fullName: "Hamza Butt", dob: "1955-09-09", gender: "male", mrn: "MRN-2023-041982", universalHealthId: "UHR-PK-220982", status: "discharged", registeredOn: "2020-03-22", lastVisit: "2026-04-11", primaryProvider: "Dr. Sarah Jenkins", phone: "+1 (555) 220-3329", email: "hamza.butt@gmail.com", address: "4 Garden Town, Lahore", insuranceProvider: "EFU Health", insurancePolicyNumber: "EFU-88213-O", emergencyContactName: "Ali Butt", emergencyContactPhone: "+1 (555) 220-3330" },
  { id: "p-saira-cheema", fullName: "Saira Cheema", dob: "1999-11-23", gender: "female", mrn: "MRN-2023-041983", universalHealthId: "UHR-PK-220983", identifiersVerified: false, status: "flagged", registeredOn: "2020-03-23", lastVisit: "2026-03-19", primaryProvider: "Dr. Gregory Han", phone: "+1 (555) 220-3331", email: "saira.cheema@gmail.com", address: "15 Askari 10, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-99213-P", emergencyContactName: "Bilal Cheema", emergencyContactPhone: "+1 (555) 220-3332" },
  { id: "p-omar-sethi", fullName: "Omar Sethi", dob: "1983-06-06", gender: "male", mrn: "MRN-2022-032871", universalHealthId: "UHR-PK-110871", status: "active", registeredOn: "2019-08-01", lastVisit: "2026-02-27", primaryProvider: "Dr. Robert Vance", phone: "+1 (555) 220-3333", email: "omar.sethi@gmail.com", address: "31 Bahria Town, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-55102-Q", emergencyContactName: "Layla Sethi", emergencyContactPhone: "+1 (555) 220-3334" },
  { id: "p-layla-awan", fullName: "Layla Awan", dob: "1977-03-15", gender: "female", mrn: "MRN-2022-032872", universalHealthId: "UHR-PK-110872", status: "active", registeredOn: "2019-08-02", lastVisit: "2026-01-18", primaryProvider: "Dr. Elena Rostova", phone: "+1 (555) 220-3335", email: "layla.awan@gmail.com", address: "9 Valencia, Lahore", insuranceProvider: "EFU Health", insurancePolicyNumber: "EFU-66210-R", emergencyContactName: "Omar Awan", emergencyContactPhone: "+1 (555) 220-3336" },
  { id: "p-rashid-qureshi", fullName: "Rashid Qureshi", dob: "1960-12-25", gender: "male", mrn: "MRN-2021-021093", universalHealthId: "UHR-PK-990093", status: "discharged", registeredOn: "2018-01-10", lastVisit: "2025-12-05", primaryProvider: "Dr. Sarah Jenkins", phone: "+1 (555) 220-3337", email: "rashid.qureshi@gmail.com", address: "7 Cantt, Lahore", insuranceProvider: "State Life Health", insurancePolicyNumber: "SLH-30219-S", emergencyContactName: "Amina Qureshi", emergencyContactPhone: "+1 (555) 220-3338" },
  { id: "p-amina-siddiqui", fullName: "Amina Siddiqui", dob: "2004-10-02", gender: "female", mrn: "MRN-2021-021094", universalHealthId: "UHR-PK-990094", status: "active", registeredOn: "2018-01-11", lastVisit: "2025-11-22", primaryProvider: "Dr. Calvin Osei", phone: "+1 (555) 220-3339", email: "amina.siddiqui@gmail.com", address: "13 Shadman, Lahore", insuranceProvider: "Jubilee Health", insurancePolicyNumber: "JH-20981-T", emergencyContactName: "Rashid Siddiqui", emergencyContactPhone: "+1 (555) 220-3340" },
];

const visitTemplates: VisitRecord[] = [
  { date: "2026-08-10", department: "Cardiology", provider: "Dr. Sarah Jenkins", reason: "Routine follow-up" },
  { date: "2026-05-02", department: "OPD General", provider: "Dr. Robert Vance", reason: "Annual physical" },
  { date: "2026-01-14", department: "Radiology", provider: "Dr. Elena Rostova", reason: "Chest X-Ray" },
];

export const patients: Patient[] = patientSeeds.map((seed, i) => ({
  id: seed.id,
  name: parseName(seed.fullName),
  preferredName: seed.preferredName,
  dob: seed.dob,
  gender: seed.gender,
  maritalStatus: seed.maritalStatus ?? "unknown",
  identifiers: buildIdentifiers(seed),
  status: seed.status,
  possibleDuplicateOf: seed.possibleDuplicateOf,
  managingOrganizationId: seed.managingOrganizationId ?? "fac-main-campus",
  registeredOn: seed.registeredOn,
  lastVisit: seed.lastVisit,
  primaryProvider: seed.primaryProvider,
  phone: seed.phone,
  email: seed.email,
  address: seed.address,
  communicationPreference: seed.communicationPreference ?? "phone",
  insuranceProvider: seed.insuranceProvider,
  insurancePolicyNumber: seed.insurancePolicyNumber,
  emergencyContactName: seed.emergencyContactName,
  emergencyContactRelationship: seed.emergencyContactRelationship ?? "Family Member",
  emergencyContactPhone: seed.emergencyContactPhone,
  emergencyContactAddress: seed.emergencyContactAddress,
  visits: seed.status === "pending-verification" ? [] : visitTemplates.slice(0, (i % 3) + 1),
}));


export interface PatientPage {
  results: (Patient & { managingOrganizationName: string })[];
  total: number;
  page: number;
  pageSize: number;
}

function withOrganizationName(p: Patient) {
  return { ...p, managingOrganizationName: facilities.find((f) => f.id === p.managingOrganizationId)?.name ?? "Unknown facility" };
}

/** Search covers everything HMS_DOMAIN_STANDARDS.md §7 requires: name, identifier (MRN/national ID/UHID/...), phone, DOB, email. */
export function getPatients(params: { page: number; pageSize: number; search?: string; status?: PatientStatus | "all" }) {
  const { page, pageSize, search = "", status = "all" } = params;
  const q = search.trim().toLowerCase();
  const filtered = patients.filter((p) => {
    const matchesStatus = status === "all" || p.status === status;
    const matchesSearch =
      !q ||
      getPatientFullName(p.name).toLowerCase().includes(q) ||
      p.identifiers.some((identifier) => identifier.value.toLowerCase().includes(q)) ||
      p.phone.toLowerCase().includes(q) ||
      p.dob.includes(q) ||
      p.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
  const start = (page - 1) * pageSize;
  const result: PatientPage = {
    results: filtered.slice(start, start + pageSize).map(withOrganizationName),
    total: filtered.length,
    page,
    pageSize,
  };
  return mockRequest(result);
}

export const getPatient = (id: string) => mockRequest(patients.find((p) => p.id === id) ?? null);
export const getPatientAge = age;

export interface NewPatientInput {
  givenName: string;
  familyName: string;
  prefix?: string;
  preferredName?: string;
  dob: string;
  gender: Patient["gender"];
  maritalStatus: MaritalStatus;
  nationalId?: string;
  managingOrganizationId: string;
  phone: string;
  email: string;
  address: string;
  communicationPreference: CommunicationPreference;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
}

/** New front-desk registrations start as "pending-verification" until staff confirm identity against the MPI. */
export function createPatient(input: NewPatientInput) {
  const { givenName, familyName, prefix, nationalId, ...rest } = input;
  const year = 2026;
  const sequence = String(patients.length + 1).padStart(6, "0");
  const mrn = `MRN-${year}-${sequence}`;
  const universalHealthId = `UHR-PK-${900000 + patients.length}`;
  const registeredOn = "2026-08-14";
  const newPatient: Patient = {
    ...rest,
    id: `p-${familyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${patients.length}`,
    name: { given: givenName, family: familyName, prefix },
    identifiers: buildIdentifiers({ mrn, universalHealthId, nationalId, identifiersVerified: false, registeredOn }),
    status: "pending-verification",
    registeredOn,
    lastVisit: registeredOn,
    primaryProvider: "Unassigned",
    visits: [],
  };
  patients.push(newPatient);
  return mockRequest(newPatient);
}

export function updatePatient(id: string, updates: Partial<Patient>) {
  const index = patients.findIndex((p) => p.id === id);
  if (index !== -1) patients[index] = { ...patients[index], ...updates };
  return mockRequest(patients[index] ?? null);
}

export const getPatientStats = () =>
  mockRequest({
    total: patients.length,
    pendingVerification: patients.filter((p) => p.status === "pending-verification").length,
    flagged: patients.filter((p) => p.status === "flagged").length,
    possibleDuplicates: patients.filter((p) => p.possibleDuplicateOf).length,
  });

// MPI (Master Patient Index) — HMS_DOMAIN_STANDARDS.md §8. Match confidence is
// computed from the same demographic/contact fields a real MPI engine would
// compare (name, DOB, phone, address) — never auto-merged, always routed to a
// human for Review / Merge / Not a Duplicate.

export interface DuplicateCandidate {
  patientA: Patient;
  patientB: Patient;
  matchConfidence: number;
  matchedFields: string[];
}

function computeMatch(a: Patient, b: Patient): { confidence: number; matchedFields: string[] } {
  const matchedFields: string[] = [];
  let confidence = 0;
  if (a.name.family.toLowerCase() === b.name.family.toLowerCase()) {
    confidence += 20;
    matchedFields.push("Last name");
  }
  if (a.name.given.toLowerCase() === b.name.given.toLowerCase()) {
    confidence += 15;
    matchedFields.push("First name");
  } else if (a.name.given.toLowerCase().startsWith(b.name.given.toLowerCase()) || b.name.given.toLowerCase().startsWith(a.name.given.toLowerCase())) {
    confidence += 8;
    matchedFields.push("First name (partial)");
  }
  if (a.dob === b.dob) {
    confidence += 30;
    matchedFields.push("Date of birth");
  }
  if (a.phone === b.phone) {
    confidence += 20;
    matchedFields.push("Phone");
  }
  if (a.address === b.address) {
    confidence += 15;
    matchedFields.push("Address");
  }
  return { confidence: Math.min(confidence, 100), matchedFields };
}

export function getDuplicateQueue() {
  const seen = new Set<string>();
  const queue: DuplicateCandidate[] = [];
  for (const p of patients) {
    if (!p.possibleDuplicateOf || seen.has(p.id)) continue;
    const other = patients.find((o) => o.id === p.possibleDuplicateOf);
    if (!other) continue;
    seen.add(p.id);
    seen.add(other.id);
    const { confidence, matchedFields } = computeMatch(p, other);
    queue.push({ patientA: p, patientB: other, matchConfidence: confidence, matchedFields });
  }
  return mockRequest(queue.sort((a, b) => b.matchConfidence - a.matchConfidence));
}

export function getDuplicatePair(patientId: string) {
  const p = patients.find((x) => x.id === patientId);
  if (!p?.possibleDuplicateOf) return mockRequest(null);
  const other = patients.find((o) => o.id === p.possibleDuplicateOf);
  if (!other) return mockRequest(null);
  const { confidence, matchedFields } = computeMatch(p, other);
  const result: DuplicateCandidate = { patientA: p, patientB: other, matchConfidence: confidence, matchedFields };
  return mockRequest(result);
}

/** Merges `mergeId` into `keepId` — the kept record's data is canonical, the merged record is archived with a link, never deleted. */
export function mergePatients(keepId: string, mergeId: string) {
  const keep = patients.find((p) => p.id === keepId);
  const merge = patients.find((p) => p.id === mergeId);
  if (!keep || !merge) return mockRequest(null);
  keep.possibleDuplicateOf = undefined;
  merge.status = "merged";
  merge.mergedInto = keepId;
  merge.possibleDuplicateOf = undefined;
  return mockRequest(keep);
}

/** Confirms the two records are genuinely different people — clears the flag on both sides without merging. */
export function dismissDuplicate(patientIdA: string, patientIdB: string) {
  const a = patients.find((p) => p.id === patientIdA);
  const b = patients.find((p) => p.id === patientIdB);
  if (a) a.possibleDuplicateOf = undefined;
  if (b) b.possibleDuplicateOf = undefined;
  return mockRequest({ a, b });
}

