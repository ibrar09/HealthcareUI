import { mockRequest } from "@shared/lib/api/client";

// Analyzer status + maintenance combined — the real integration (HL7/
// vendor protocol result feeds) is backend/infrastructure work, flagged
// not faked. This tracks the operational status a lab manager needs.

export type AnalyzerStatus = "Online" | "Offline" | "Maintenance" | "Error";

export interface LabAnalyzer {
  id: string;
  name: string;
  manufacturer: string;
  section: string;
  status: AnalyzerStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  lastCommunication: string;
}

let analyzers: LabAnalyzer[] = [
  { id: "an-1", name: "Hematology Analyzer 1", manufacturer: "Sysmex XN-1000", section: "Hematology", status: "Online", lastMaintenance: "2026-07-10", nextMaintenance: "2026-09-10", lastCommunication: "just now" },
  { id: "an-2", name: "Chemistry Analyzer 1", manufacturer: "Roche Cobas c503", section: "Chemistry", status: "Online", lastMaintenance: "2026-07-15", nextMaintenance: "2026-09-15", lastCommunication: "just now" },
  { id: "an-3", name: "Chemistry Analyzer 2", manufacturer: "Roche Cobas c503", section: "Chemistry", status: "Maintenance", lastMaintenance: "2026-08-20", nextMaintenance: "2026-10-20", lastCommunication: "2 hours ago" },
  { id: "an-4", name: "Coagulation Analyzer 1", manufacturer: "Stago STA Compact Max", section: "Coagulation", status: "Online", lastMaintenance: "2026-07-05", nextMaintenance: "2026-09-05", lastCommunication: "just now" },
  { id: "an-5", name: "Immunoassay Analyzer 1", manufacturer: "Abbott Architect i2000", section: "Immunology", status: "Online", lastMaintenance: "2026-07-22", nextMaintenance: "2026-09-22", lastCommunication: "5 min ago" },
  { id: "an-6", name: "Microbiology Incubator 1", manufacturer: "BD BACTEC FX", section: "Microbiology", status: "Error", lastMaintenance: "2026-06-30", nextMaintenance: "2026-08-30", lastCommunication: "1 hour ago" },
];

export const getAnalyzers = () => mockRequest([...analyzers]);

export function setAnalyzerStatus(id: string, status: AnalyzerStatus) {
  const a = analyzers.find((x) => x.id === id);
  if (a) a.status = status;
  analyzers = [...analyzers];
  return mockRequest([...analyzers]);
}

export interface MaintenanceRecord {
  id: string;
  analyzerId: string;
  type: "Preventive" | "Corrective";
  performedBy: string;
  at: string;
  notes: string;
}

let maintenanceLog: MaintenanceRecord[] = [
  { id: "mnt-1", analyzerId: "an-3", type: "Preventive", performedBy: "BioMed Tech. Waqas Ali", at: "2026-08-20 06:00", notes: "Scheduled quarterly service — filter replacement." },
  { id: "mnt-2", analyzerId: "an-6", type: "Corrective", performedBy: "BioMed Tech. Waqas Ali", at: "2026-08-20 07:30", notes: "Incubator temperature alarm — investigating sensor fault." },
];

export const getMaintenanceLog = () => mockRequest([...maintenanceLog]);

export function logMaintenance(analyzerId: string, type: MaintenanceRecord["type"], performedBy: string, notes: string) {
  const rec: MaintenanceRecord = { id: `mnt-${Date.now()}`, analyzerId, type, performedBy, at: "just now", notes };
  maintenanceLog = [rec, ...maintenanceLog];
  return mockRequest(rec);
}
