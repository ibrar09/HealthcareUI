import { mockRequest } from "@shared/lib/api/client";
import { getWardLayout } from "./patients";
import type { WardBedSlot } from "./patients";

export type EmptyBedStatus = "Vacant" | "Cleaning" | "Reserved";

const emptyBedStatus: Record<string, EmptyBedStatus> = {};

export interface BedManagementSlot extends WardBedSlot {
  emptyStatus?: EmptyBedStatus;
}

export async function getBedManagement(): Promise<BedManagementSlot[]> {
  const layout = await getWardLayout();
  return layout.map((slot) => ({
    ...slot,
    emptyStatus: slot.patient ? undefined : emptyBedStatus[`${slot.room}${slot.bed}`] ?? "Vacant",
  }));
}

export function setEmptyBedStatus(room: string, bed: string, status: EmptyBedStatus) {
  emptyBedStatus[`${room}${bed}`] = status;
  return mockRequest(true);
}
