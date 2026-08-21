import { mockRequest } from "@shared/lib/api/client";

export interface LabCharge {
  id: string;
  orderId: string;
  patientId: string;
  description: string;
  amount: number;
  payer: "Insurance" | "Self-Pay" | "Corporate";
  status: "Pending" | "Billed" | "Paid";
}

let charges: LabCharge[] = [
  { id: "lchg-1", orderId: "lord-9", patientId: "lp-1", description: "Urinalysis, Complete", amount: 35, payer: "Insurance", status: "Billed" },
  { id: "lchg-2", orderId: "lord-13", patientId: "lp-5", description: "Sodium + Potassium (STAT)", amount: 90, payer: "Insurance", status: "Billed" },
  { id: "lchg-3", orderId: "lord-14", patientId: "lp-6", description: "Creatinine", amount: 40, payer: "Self-Pay", status: "Paid" },
  { id: "lchg-4", orderId: "lord-7", patientId: "lp-7", description: "TSH + HbA1c", amount: 150, payer: "Insurance", status: "Pending" },
];

export const getCharges = () => mockRequest([...charges]);

export function advanceCharge(id: string) {
  const c = charges.find((x) => x.id === id);
  if (!c) return mockRequest([...charges]);
  const next = { Pending: "Billed", Billed: "Paid", Paid: "Paid" } as const;
  c.status = next[c.status];
  charges = [...charges];
  return mockRequest([...charges]);
}
