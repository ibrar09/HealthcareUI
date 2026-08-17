export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function statusPillStyle(color: string) {
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}

export const moduleColors: Record<string, string> = {
  Beds: "var(--signal-indigo)",
  Laboratory: "var(--module-lab)",
  Radiology: "var(--module-radiology)",
  Pharmacy: "var(--module-pharmacy)",
  "OT/Surgery": "var(--pulse-coral)",
  Inventory: "var(--module-inventory)",
  Emergency: "var(--pulse-coral)",
};
