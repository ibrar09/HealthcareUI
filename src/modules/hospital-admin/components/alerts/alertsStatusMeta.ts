import type { AlertSeverity, AlertStatus, AlertCategory, NotificationDeliveryStatus, NotificationChannel } from "@modules/hospital-admin/api";
import { alertCategoryLabels } from "@modules/hospital-admin/api";

export const severityMeta: Record<AlertSeverity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "var(--pulse-coral)" },
  high: { label: "High", color: "var(--caution-amber)" },
  medium: { label: "Medium", color: "var(--signal-indigo)" },
  low: { label: "Low", color: "var(--outline)" },
};

export const statusMeta: Record<AlertStatus, { label: string; color: string }> = {
  new: { label: "New", color: "var(--signal-indigo)" },
  acknowledged: { label: "Acknowledged", color: "var(--caution-amber)" },
  "in-progress": { label: "In Progress", color: "var(--caution-amber)" },
  resolved: { label: "Resolved", color: "var(--vital-green)" },
  escalated: { label: "Escalated", color: "var(--pulse-coral)" },
  dismissed: { label: "Dismissed", color: "var(--outline)" },
  expired: { label: "Expired", color: "var(--outline)" },
  failed: { label: "Failed", color: "var(--pulse-coral)" },
};

export const deliveryStatusMeta: Record<NotificationDeliveryStatus, { label: string; color: string }> = {
  created: { label: "Created", color: "var(--outline)" },
  queued: { label: "Queued", color: "var(--outline)" },
  sent: { label: "Sent", color: "var(--signal-indigo)" },
  delivered: { label: "Delivered", color: "var(--vital-green)" },
  read: { label: "Read", color: "var(--vital-green)" },
  acknowledged: { label: "Acknowledged", color: "var(--vital-green)" },
  failed: { label: "Failed", color: "var(--pulse-coral)" },
  retrying: { label: "Retrying", color: "var(--caution-amber)" },
};

export const channelLabels: Record<NotificationChannel, string> = {
  email: "Email",
  sms: "SMS",
  push: "Push",
  whatsapp: "WhatsApp",
  "in-app": "In-App",
};

export const categoryLabels = alertCategoryLabels;
export type { AlertCategory };

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
}

export function statusPillStyle(color: string) {
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}
