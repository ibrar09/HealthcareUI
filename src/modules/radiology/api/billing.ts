import { mockRequest } from "@shared/lib/api/client";

export interface RadiologyCharge {
  id: string;
  orderId: string;
  patientId: string;
  study: string;
  amount: number;
  payer: "Insurance" | "Self-Pay" | "Corporate";
  status: "Pending" | "Billed" | "Paid";
}

let charges: RadiologyCharge[] = [
  { id: "chg-1", orderId: "rord-7", patientId: "rp-3", study: "CT Chest", amount: 450, payer: "Insurance", status: "Billed" },
  { id: "chg-2", orderId: "rord-6", patientId: "rp-1", study: "CT Abdomen", amount: 520, payer: "Insurance", status: "Pending" },
];

export const getCharges = () => mockRequest([...charges]);

export function markCharged(id: string, status: RadiologyCharge["status"]) {
  const c = charges.find((x) => x.id === id);
  if (c) c.status = status;
  charges = [...charges];
  return mockRequest([...charges]);
}
