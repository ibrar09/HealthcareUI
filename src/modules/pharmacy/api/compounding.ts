import { mockRequest } from "@shared/lib/api/client";

export interface CompoundPreparation {
  id: string;
  patientId: string;
  medicationName: string;
  ingredients: string;
  finalVolume: string;
  batchNo: string;
  preparedBy: string;
  checkedBy?: string;
  status: "Preparing" | "Pending Check" | "Verified";
  beyondUseDate: string;
  preparedAt: string;
}

let preparations: CompoundPreparation[] = [
  { id: "iv-1", patientId: "pp-4", medicationName: "Vancomycin 1g in 250mL NS", ingredients: "Vancomycin 1g, Normal Saline 250mL", finalVolume: "250mL", batchNo: "CMP-2601", preparedBy: "Pharm. Zainab Hussain", status: "Pending Check", beyondUseDate: "2026-08-20 08:00", preparedAt: "07:50" },
];

export const getCompounds = () => mockRequest([...preparations]);

// High-risk preparations require an independent double-check — checkedBy
// must differ from preparedBy, enforced here rather than left to the UI.
export function verifyCompound(id: string, checkedBy: string) {
  const p = preparations.find((x) => x.id === id);
  if (!p) return mockRequest([...preparations]);
  if (checkedBy === p.preparedBy) throw new Error("Independent double-check required — checker must differ from preparer.");
  p.checkedBy = checkedBy;
  p.status = "Verified";
  preparations = [...preparations];
  return mockRequest([...preparations]);
}
