export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function statusPillStyle(color: string) {
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}

export const toggleTrackClass = (on: boolean) =>
  `relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${on ? "bg-signal-indigo" : "bg-outline/30"}`;
export const toggleThumbClass = (on: boolean) =>
  `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`;
