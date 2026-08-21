import { mockRequest } from "@shared/lib/api/client";

// Equipment status/maintenance/QC combined — same three-in-one entity
// consolidation as Pharmacy's inventory (status field covers all views).

export type EquipmentStatus = "Online" | "Offline" | "Maintenance" | "Out of Service";

export interface Equipment {
  id: string;
  modality: string;
  room: string;
  manufacturer: string;
  status: EquipmentStatus;
  lastMaintenance: string;
  nextMaintenance: string;
}

let equipment: Equipment[] = [
  { id: "eq-1", modality: "CT", room: "CT-1", manufacturer: "Siemens Somatom", status: "Online", lastMaintenance: "2026-07-15", nextMaintenance: "2026-09-15" },
  { id: "eq-2", modality: "MRI", room: "MRI-1", manufacturer: "GE Signa", status: "Online", lastMaintenance: "2026-07-20", nextMaintenance: "2026-09-20" },
  { id: "eq-3", modality: "X-Ray", room: "XR-1", manufacturer: "Philips DigitalDiagnost", status: "Online", lastMaintenance: "2026-07-01", nextMaintenance: "2026-09-01" },
  { id: "eq-4", modality: "Ultrasound", room: "US-1", manufacturer: "Philips EPIQ", status: "Maintenance", lastMaintenance: "2026-08-20", nextMaintenance: "2026-10-20" },
  { id: "eq-5", modality: "Mammography", room: "MAM-1", manufacturer: "Hologic 3Dimensions", status: "Online", lastMaintenance: "2026-06-10", nextMaintenance: "2026-08-10" },
];

export interface QcRecord {
  id: string;
  equipmentId: string;
  result: "Pass" | "Fail";
  performedBy: string;
  at: string;
}

let qcRecords: QcRecord[] = [
  { id: "qc-1", equipmentId: "eq-1", result: "Pass", performedBy: "Tech. Hamza Iqbal", at: "2026-08-20 06:00" },
];

export const getEquipment = () => mockRequest([...equipment]);
export const getQcRecords = () => mockRequest([...qcRecords]);

export function setEquipmentStatus(id: string, status: EquipmentStatus) {
  const e = equipment.find((x) => x.id === id);
  if (e) e.status = status;
  equipment = [...equipment];
  return mockRequest([...equipment]);
}

export function recordQc(equipmentId: string, result: QcRecord["result"], performedBy: string) {
  const rec: QcRecord = { id: `qc-${Date.now()}`, equipmentId, result, performedBy, at: "just now" };
  qcRecords = [rec, ...qcRecords];
  return mockRequest(rec);
}
