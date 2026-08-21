import { mockRequest } from "@shared/lib/api/client";

export interface Referral {
  id: string;
  patientId: string;
  referringOrg: string;
  referringDoctor: string;
  reason: string;
  status: "Pending" | "Accepted" | "Completed";
}

let referrals: Referral[] = [
  { id: "ref-1", patientId: "rp-2", referringOrg: "Al-Noor Diagnostic Clinic", referringDoctor: "Dr. Kamran Shah", reason: "MRI Brain — external referral for specialist review", status: "Pending" },
];

export const getReferrals = () => mockRequest([...referrals]);

export function advanceReferral(id: string) {
  const r = referrals.find((x) => x.id === id);
  if (!r) return mockRequest([...referrals]);
  const next = { Pending: "Accepted", Accepted: "Completed", Completed: "Completed" } as const;
  r.status = next[r.status];
  referrals = [...referrals];
  return mockRequest([...referrals]);
}
