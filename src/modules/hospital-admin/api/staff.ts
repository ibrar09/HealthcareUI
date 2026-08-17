import { mockRequest } from "@shared/lib/api/client";
import { getFullName, PersonName } from "./core";
import { departmentConfigs } from "./facilities";

// Staff — FHIR `Practitioner` + `PractitionerRole` (HMS_DOMAIN_STANDARDS.md §9-10).
// A person's identity (name, license, contact) and their department assignment
// are modeled as two separate records and joined for display, so the same
// practitioner could hold more than one role without duplicating their identity.
// `staffMembers` below is the joined read view the Staff Directory/Roster UI
// consumes — the same "structure underneath, friendly view on top" pattern used
// for Patient identifiers.

interface Practitioner {
  id: string;
  name: PersonName;
  licenseNumber: string;
  nationalId: string;
  email: string;
  phone: string;
  status: "active" | "on-leave" | "inactive";
}

interface PractitionerRole {
  id: string;
  practitionerId: string;
  roleType: "doctor" | "nurse" | "technician" | "admin";
  title: string;
  specialty: string;
  departmentId: string;
  schedule: string[];
}

export const practitionerSeeds: Practitioner[] = [
  { id: "prac-sarah-jenkins", name: { prefix: "Dr.", given: "Sarah", family: "Jenkins" }, licenseNumber: "LIC-992384-MD", nationalId: "ID-48213-9021", email: "sarah.jenkins@citygeneral.org", phone: "+1 (555) 010-2201", status: "active" },
  { id: "prac-marcus-chen", name: { given: "Marcus", family: "Chen", suffix: "RN" }, licenseNumber: "LIC-445122-RN", nationalId: "ID-48213-9022", email: "marcus.chen@citygeneral.org", phone: "+1 (555) 010-2202", status: "active" },
  { id: "prac-elena-rostova", name: { given: "Elena", family: "Rostova" }, licenseNumber: "CRT-8821-RX", nationalId: "ID-48213-9023", email: "elena.rostova@citygeneral.org", phone: "+1 (555) 010-2203", status: "on-leave" },
  { id: "prac-robert-vance", name: { prefix: "Dr.", given: "Robert", family: "Vance" }, licenseNumber: "LIC-112344-MD", nationalId: "ID-48213-9024", email: "robert.vance@citygeneral.org", phone: "+1 (555) 010-2204", status: "active" },
  { id: "prac-michael-chen", name: { prefix: "Dr.", given: "Michael", family: "Chen" }, licenseNumber: "LIC-330198-MD", nationalId: "ID-48213-9025", email: "michael.chen@citygeneral.org", phone: "+1 (555) 010-2205", status: "active" },
  { id: "prac-amina-farooqi", name: { prefix: "Dr.", given: "Amina", family: "Farooqi" }, licenseNumber: "LIC-778213-MD", nationalId: "ID-48213-9026", email: "amina.farooqi@citygeneral.org", phone: "+1 (555) 010-2206", status: "active" },
  { id: "prac-farah-chaudhry", name: { prefix: "Dr.", given: "Farah", family: "Chaudhry" }, licenseNumber: "LIC-664213-MD", nationalId: "ID-48213-9027", email: "farah.chaudhry@citygeneral.org", phone: "+1 (555) 010-2207", status: "active" },
  { id: "prac-ali-rasheed", name: { given: "Ali", family: "Rasheed" }, licenseNumber: "CRT-9931-RX", nationalId: "ID-48213-9028", email: "ali.rasheed@citygeneral.org", phone: "+1 (555) 010-2208", status: "active" },
  { id: "prac-ahmed-hassan", name: { prefix: "Dr.", given: "Ahmed", family: "Hassan" }, licenseNumber: "LIC-556213-MD", nationalId: "ID-48213-9029", email: "ahmed.hassan@citygeneral.org", phone: "+1 (555) 010-2209", status: "active" },
  { id: "prac-sara-malik", name: { prefix: "Dr.", given: "Sara", family: "Malik" }, licenseNumber: "LIC-661209-MD", nationalId: "ID-48213-9030", email: "sara.malik@citygeneral.org", phone: "+1 (555) 010-2210", status: "active" },
  { id: "prac-hina-tariq", name: { given: "Hina", family: "Tariq", suffix: "RN" }, licenseNumber: "LIC-223198-RN", nationalId: "ID-48213-9031", email: "hina.tariq@citygeneral.org", phone: "+1 (555) 010-2211", status: "active" },
  { id: "prac-bilal-nadeem", name: { given: "Bilal", family: "Nadeem" }, licenseNumber: "CRT-4471-OT", nationalId: "ID-48213-9032", email: "bilal.nadeem@citygeneral.org", phone: "+1 (555) 010-2212", status: "active" },
  { id: "prac-nadia-yousaf", name: { given: "Nadia", family: "Yousaf", suffix: "RN" }, licenseNumber: "LIC-223199-RN", nationalId: "ID-48213-9033", email: "nadia.yousaf@citygeneral.org", phone: "+1 (555) 010-2213", status: "active" },
  { id: "prac-nadia-khokhar", name: { prefix: "Dr.", given: "Nadia", family: "Khokhar", suffix: "PharmD" }, licenseNumber: "LIC-773310-PH", nationalId: "ID-48213-9034", email: "nadia.khokhar@citygeneral.org", phone: "+1 (555) 010-2214", status: "active" },
  { id: "prac-usman-farooq", name: { given: "Usman", family: "Farooq" }, licenseNumber: "CRT-5521-PH", nationalId: "ID-48213-9035", email: "usman.farooq@citygeneral.org", phone: "+1 (555) 010-2215", status: "active" },
  { id: "prac-sadia-riaz", name: { given: "Sadia", family: "Riaz" }, licenseNumber: "CRT-5522-PH", nationalId: "ID-48213-9036", email: "sadia.riaz@citygeneral.org", phone: "+1 (555) 010-2216", status: "active" },
  { id: "prac-waqas-anjum", name: { given: "Waqas", family: "Anjum" }, licenseNumber: "CRT-6601-INV", nationalId: "ID-48213-9037", email: "waqas.anjum@citygeneral.org", phone: "+1 (555) 010-2217", status: "active" },
  { id: "prac-hira-shahid", name: { given: "Hira", family: "Shahid" }, licenseNumber: "CRT-6602-INV", nationalId: "ID-48213-9038", email: "hira.shahid@citygeneral.org", phone: "+1 (555) 010-2218", status: "active" },
  { id: "prac-junaid-malik", name: { given: "Junaid", family: "Malik" }, licenseNumber: "CRT-6603-INV", nationalId: "ID-48213-9039", email: "junaid.malik@citygeneral.org", phone: "+1 (555) 010-2219", status: "active" },
  { id: "prac-nadia-farhan", name: { prefix: "Dr.", given: "Nadia", family: "Farhan" }, licenseNumber: "LIC-889213-MD", nationalId: "ID-48213-9040", email: "nadia.farhan@citygeneral.org", phone: "+1 (555) 010-2220", status: "active" },
  { id: "prac-imran-qureshi", name: { prefix: "Dr.", given: "Imran", family: "Qureshi" }, licenseNumber: "LIC-993214-MD", nationalId: "ID-48213-9041", email: "imran.qureshi@citygeneral.org", phone: "+1 (555) 010-2221", status: "active" },
  { id: "prac-samina-riaz", name: { given: "Samina", family: "Riaz", suffix: "RN" }, licenseNumber: "LIC-556219-RN", nationalId: "ID-48213-9042", email: "samina.riaz@citygeneral.org", phone: "+1 (555) 010-2222", status: "active" },
  { id: "prac-fahad-siddique", name: { given: "Fahad", family: "Siddique", suffix: "RN" }, licenseNumber: "LIC-778241-RN", nationalId: "ID-48213-9043", email: "fahad.siddique@citygeneral.org", phone: "+1 (555) 010-2223", status: "active" },
];

export const practitionerRoleSeeds: PractitionerRole[] = [
  { id: "sarah-jenkins", practitionerId: "prac-sarah-jenkins", roleType: "doctor", specialty: "Cardiology", title: "Chief Resident", departmentId: "dept-cardiology", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "marcus-chen", practitionerId: "prac-marcus-chen", roleType: "nurse", specialty: "ICU", title: "Senior Staff Nurse", departmentId: "dept-icu", schedule: ["Mon", "Wed", "Fri", "Sat", "Sun"] },
  { id: "elena-rostova", practitionerId: "prac-elena-rostova", roleType: "technician", specialty: "Radiology", title: "MRI Specialist", departmentId: "dept-radiology", schedule: ["Tue", "Wed", "Thu"] },
  { id: "robert-vance", practitionerId: "prac-robert-vance", roleType: "doctor", specialty: "Neurology", title: "Attending", departmentId: "dept-neurology", schedule: ["Mon", "Tue", "Thu", "Fri"] },
  { id: "michael-chen", practitionerId: "prac-michael-chen", roleType: "doctor", specialty: "Internal Medicine", title: "Medical Director", departmentId: "dept-opd", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "amina-farooqi", practitionerId: "prac-amina-farooqi", roleType: "doctor", specialty: "Pathology", title: "Lab Director", departmentId: "dept-laboratory", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "farah-chaudhry", practitionerId: "prac-farah-chaudhry", roleType: "doctor", specialty: "Neuroradiology", title: "Chief Radiologist", departmentId: "dept-radiology", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "ali-rasheed", practitionerId: "prac-ali-rasheed", roleType: "technician", specialty: "Radiology", title: "Radiologic Technologist", departmentId: "dept-radiology", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "ahmed-hassan", practitionerId: "prac-ahmed-hassan", roleType: "doctor", specialty: "General Surgery", title: "Consultant Surgeon", departmentId: "dept-ot", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "sara-malik", practitionerId: "prac-sara-malik", roleType: "doctor", specialty: "Anesthesiology", title: "Consultant Anesthesiologist", departmentId: "dept-ot", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "hina-tariq", practitionerId: "prac-hina-tariq", roleType: "nurse", specialty: "Perioperative Nursing", title: "Scrub Nurse", departmentId: "dept-ot", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "bilal-nadeem", practitionerId: "prac-bilal-nadeem", roleType: "technician", specialty: "Operating Theatre", title: "OT Technician", departmentId: "dept-ot", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "nadia-yousaf", practitionerId: "prac-nadia-yousaf", roleType: "nurse", specialty: "Perioperative Nursing", title: "Circulating Nurse", departmentId: "dept-ot", schedule: ["Mon", "Wed", "Thu", "Fri", "Sat"] },
  { id: "nadia-khokhar", practitionerId: "prac-nadia-khokhar", roleType: "doctor", specialty: "Pharmacy", title: "Chief Pharmacist", departmentId: "dept-pharmacy", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "usman-farooq", practitionerId: "prac-usman-farooq", roleType: "technician", specialty: "Pharmacy", title: "Pharmacy Technician", departmentId: "dept-pharmacy", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "sadia-riaz", practitionerId: "prac-sadia-riaz", roleType: "admin", specialty: "Pharmacy Management", title: "Pharmacy Manager", departmentId: "dept-pharmacy", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "waqas-anjum", practitionerId: "prac-waqas-anjum", roleType: "admin", specialty: "Inventory Management", title: "Inventory Manager", departmentId: "dept-inventory", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "hira-shahid", practitionerId: "prac-hira-shahid", roleType: "technician", specialty: "Warehouse Operations", title: "Storekeeper", departmentId: "dept-inventory", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "junaid-malik", practitionerId: "prac-junaid-malik", roleType: "admin", specialty: "Procurement", title: "Procurement Officer", departmentId: "dept-inventory", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "nadia-farhan", practitionerId: "prac-nadia-farhan", roleType: "doctor", specialty: "Emergency Medicine", title: "Attending Emergency Physician", departmentId: "dept-emergency", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  { id: "imran-qureshi", practitionerId: "prac-imran-qureshi", roleType: "doctor", specialty: "Emergency Medicine", title: "Emergency Physician", departmentId: "dept-emergency", schedule: ["Wed", "Thu", "Fri", "Sat", "Sun"] },
  { id: "samina-riaz", practitionerId: "prac-samina-riaz", roleType: "nurse", specialty: "Emergency Nursing", title: "ED Charge Nurse", departmentId: "dept-emergency", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  { id: "fahad-siddique", practitionerId: "prac-fahad-siddique", roleType: "nurse", specialty: "Emergency Nursing", title: "Triage Nurse", departmentId: "dept-emergency", schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
];

export interface StaffMember {
  id: string;
  name: string;
  role: "doctor" | "nurse" | "technician" | "admin";
  specialty: string;
  title: string;
  licenseNumber: string;
  status: "active" | "on-leave" | "inactive";
  email: string;
  phone: string;
  nationalId: string;
  department: string;
  schedule: string[];
}


export const staffMembers: StaffMember[] = practitionerRoleSeeds.map((role) => {
  const practitioner = practitionerSeeds.find((p) => p.id === role.practitionerId)!;
  const department = departmentConfigs.find((d) => d.id === role.departmentId);
  return {
    id: role.id,
    name: getFullName(practitioner.name),
    role: role.roleType,
    specialty: role.specialty,
    title: role.title,
    licenseNumber: practitioner.licenseNumber,
    status: practitioner.status,
    email: practitioner.email,
    phone: practitioner.phone,
    nationalId: practitioner.nationalId,
    department: department?.name ?? "Unassigned",
    schedule: role.schedule,
  };
});

export function resolveHeadName(headDoctorId: string): string {
  return staffMembers.find((s) => s.id === headDoctorId)?.name ?? "Unassigned";
}

// Attendance — last 14 days per staff member, derived from their weekly schedule
// with a couple of deliberate absences/leave days mixed in so it reads as real history.
export type AttendanceStatus = "present" | "absent" | "leave" | "off";

export interface AttendanceDay {
  date: string;
  status: AttendanceStatus;
}

const attendanceOverrides: Record<string, Record<string, AttendanceStatus>> = {
  "sarah-jenkins": { "2026-08-06": "absent" },
  "marcus-chen": { "2026-08-09": "leave" },
  "elena-rostova": { "2026-08-11": "leave", "2026-08-12": "leave", "2026-08-13": "leave" },
  "robert-vance": {},
  "michael-chen": {},
};

function buildAttendance(staffId: string, schedule: string[]): AttendanceDay[] {
  const days: AttendanceDay[] = [];
  const end = new Date(2026, 7, 14); // "today"
  for (let i = 13; i >= 0; i--) {
    const date = new Date(end);
    date.setDate(date.getDate() - i);
    const iso = date.toISOString().slice(0, 10);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const override = attendanceOverrides[staffId]?.[iso];
    const status: AttendanceStatus = override ?? (schedule.includes(weekday) ? "present" : "off");
    days.push({ date: iso, status });
  }
  return days;
}

// Roster — the week of Aug 10-16, 2026 (Mon-Sun), one shift entry per staff member per day.
export type ShiftType = "standard" | "night" | "leave" | "gap";

export interface ShiftCell {
  day: string;
  type: ShiftType;
  time?: string;
}

export interface StaffRosterRow {
  staffId: string;
  shifts: ShiftCell[];
}

const weekDayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const rosterWeek: StaffRosterRow[] = [
  {
    staffId: "sarah-jenkins",
    shifts: [
      { day: "Mon", type: "standard", time: "9 AM–5 PM" },
      { day: "Tue", type: "standard", time: "9 AM–5 PM" },
      { day: "Wed", type: "standard", time: "9 AM–5 PM" },
      { day: "Thu", type: "night", time: "Night Shift" },
      { day: "Fri", type: "leave" },
      { day: "Sat", type: "gap" },
      { day: "Sun", type: "gap" },
    ],
  },
  {
    staffId: "marcus-chen",
    shifts: [
      { day: "Mon", type: "standard", time: "9 AM–5 PM" },
      { day: "Tue", type: "gap" },
      { day: "Wed", type: "standard", time: "9 AM–5 PM" },
      { day: "Thu", type: "gap" },
      { day: "Fri", type: "standard", time: "9 AM–5 PM" },
      { day: "Sat", type: "night", time: "Night Shift" },
      { day: "Sun", type: "standard", time: "9 AM–5 PM" },
    ],
  },
  {
    staffId: "elena-rostova",
    shifts: [
      { day: "Mon", type: "gap" },
      { day: "Tue", type: "standard", time: "9 AM–5 PM" },
      { day: "Wed", type: "standard", time: "9 AM–5 PM" },
      { day: "Thu", type: "night", time: "Night Shift" },
      { day: "Fri", type: "gap" },
      { day: "Sat", type: "gap" },
      { day: "Sun", type: "gap" },
    ],
  },
  {
    staffId: "robert-vance",
    shifts: [
      { day: "Mon", type: "standard", time: "9 AM–5 PM" },
      { day: "Tue", type: "standard", time: "9 AM–5 PM" },
      { day: "Wed", type: "leave" },
      { day: "Thu", type: "standard", time: "9 AM–5 PM" },
      { day: "Fri", type: "standard", time: "9 AM–5 PM" },
      { day: "Sat", type: "gap" },
      { day: "Sun", type: "gap" },
    ],
  },
  {
    staffId: "michael-chen",
    shifts: [
      { day: "Mon", type: "standard", time: "9 AM–5 PM" },
      { day: "Tue", type: "standard", time: "9 AM–5 PM" },
      { day: "Wed", type: "standard", time: "9 AM–5 PM" },
      { day: "Thu", type: "standard", time: "9 AM–5 PM" },
      { day: "Fri", type: "standard", time: "9 AM–5 PM" },
      { day: "Sat", type: "gap" },
      { day: "Sun", type: "gap" },
    ],
  },
];

/** A department's staff are derived from PractitionerRole (primary, single-department today) plus this department's own additionalStaffIds (a person whose primary department is elsewhere but who also works here) — never double-counted. */
export function countDepartmentStaff(departmentId: string): number {
  const dept = departmentConfigs.find((d) => d.id === departmentId);
  const primary = practitionerRoleSeeds.filter((r) => r.departmentId === departmentId).length;
  const additional = dept?.additionalStaffIds.length ?? 0;
  return primary + additional;
}

export const getStaffMembers = () => mockRequest(staffMembers);
export const getStaffMember = (id: string) => mockRequest(staffMembers.find((s) => s.id === id) ?? null);
export const getStaffAttendance = (id: string) => {
  const member = staffMembers.find((s) => s.id === id);
  return mockRequest(member ? buildAttendance(id, member.schedule) : []);
};
export const getRosterWeek = () => mockRequest(rosterWeek);
export const WEEKDAY_ORDER = weekDayOrder;
