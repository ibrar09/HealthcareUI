import { mockRequest } from "@shared/lib/api/client";
import { getEncounters } from "./encounters";
import type { EDArea, EDEncounter } from "./encounters";

// Bed slots are static (a bed exists whether or not anyone is in it);
// occupancy is derived by joining against encounters, so this can never
// disagree with the Dashboard/Queue about who's where — same pattern as
// Nursing's ward layout.

export type BedStatus = "Available" | "Occupied" | "Reserved" | "Cleaning" | "Isolation" | "Maintenance";

export interface BedSlot {
  id: string;
  area: EDArea;
  bedNo: string;
  manualStatus?: BedStatus;
}

const bedSlots: BedSlot[] = [
  { id: "bed-1", area: "Resuscitation", bedNo: "RESUS-1" },
  { id: "bed-2", area: "Resuscitation", bedNo: "RESUS-2" },
  { id: "bed-3", area: "Trauma", bedNo: "TRAUMA-1" },
  { id: "bed-4", area: "Trauma", bedNo: "TRAUMA-2" },
  { id: "bed-5", area: "Acute Care", bedNo: "BED-05" },
  { id: "bed-6", area: "Acute Care", bedNo: "BED-06" },
  { id: "bed-7", area: "Acute Care", bedNo: "BED-07" },
  { id: "bed-8", area: "Acute Care", bedNo: "BED-08" },
  { id: "bed-9", area: "Acute Care", bedNo: "BED-09" },
  { id: "bed-10", area: "Acute Care", bedNo: "BED-10" },
  { id: "bed-11", area: "Fast Track", bedNo: "FT-1" },
  { id: "bed-12", area: "Fast Track", bedNo: "FT-2" },
  { id: "bed-13", area: "Observation", bedNo: "OBS-1" },
  { id: "bed-14", area: "Observation", bedNo: "OBS-2" },
];

const manualStatusOverrides: Record<string, BedStatus> = { "bed-9": "Cleaning" };

export interface BedBoardEntry {
  id: string;
  area: EDArea;
  bedNo: string;
  status: BedStatus;
  encounter: EDEncounter | null;
}

export async function getBedBoard(): Promise<BedBoardEntry[]> {
  const encounters = await getEncounters();
  return bedSlots.map((slot) => {
    const encounter = encounters.find((e) => e.bedId === slot.id) ?? null;
    const status: BedStatus = encounter ? "Occupied" : manualStatusOverrides[slot.id] ?? "Available";
    return { ...slot, status, encounter };
  });
}

export function setManualBedStatus(bedId: string, status: BedStatus) {
  manualStatusOverrides[bedId] = status;
  return mockRequest(true);
}

export function releaseBed(bedId: string) {
  delete manualStatusOverrides[bedId];
  manualStatusOverrides[bedId] = "Cleaning";
  return mockRequest(true);
}
