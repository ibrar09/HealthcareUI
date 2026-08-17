import type { BedStatus } from "@modules/hospital-admin/api";

/** Shared bed-status → label/color mapping — used by Facilities' Wards & Beds tab and the Bed Management module. */
export const bedStatusMeta: Record<BedStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "var(--vital-green)" },
  reserved: { label: "Reserved", color: "var(--module-radiology)" },
  occupied: { label: "Occupied", color: "var(--signal-indigo)" },
  cleaning: { label: "Cleaning", color: "var(--caution-amber)" },
  maintenance: { label: "Maintenance", color: "var(--pulse-coral)" },
  blocked: { label: "Blocked", color: "var(--ink-navy)" },
  "out-of-service": { label: "Out of Service", color: "var(--outline)" },
};
