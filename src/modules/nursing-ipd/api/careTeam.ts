import { mockRequest } from "@shared/lib/api/client";

export interface CareTeamMember {
  patientId: string;
  name: string;
  role: string;
}

const team: CareTeamMember[] = [
  { patientId: "np-1", name: "Dr. Ahsan Malik", role: "Attending Physician" },
  { patientId: "np-1", name: "Nurse Fatima Khalid", role: "Primary Nurse" },
  { patientId: "np-2", name: "Dr. Sana Riaz", role: "Attending Physician" },
  { patientId: "np-2", name: "Nurse Fatima Khalid", role: "Primary Nurse" },
  { patientId: "np-3", name: "Dr. Ahsan Malik", role: "Attending Physician" },
  { patientId: "np-3", name: "Nurse Fatima Khalid", role: "Primary Nurse" },
  { patientId: "np-4", name: "Dr. Sana Riaz", role: "Attending Physician" },
  { patientId: "np-4", name: "Nurse Fatima Khalid", role: "Primary Nurse" },
  { patientId: "np-5", name: "Dr. Bilal Chaudhry", role: "Attending Physician — Cardiology" },
  { patientId: "np-5", name: "Nurse Fatima Khalid", role: "Primary Nurse" },
  { patientId: "np-6", name: "Dr. Ahsan Malik", role: "Attending Physician" },
  { patientId: "np-6", name: "Nurse Fatima Khalid", role: "Primary Nurse" },
];

export const getCareTeam = () => mockRequest([...team]);
