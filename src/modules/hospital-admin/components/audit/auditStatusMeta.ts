import type { AuditSeverity, AuditResult, AuditEventCategory, AuditSource } from "@modules/hospital-admin/api";

export const severityMeta: Record<AuditSeverity, { label: string; color: string }> = {
  info: { label: "Info", color: "var(--outline)" },
  low: { label: "Low", color: "var(--signal-indigo-light)" },
  medium: { label: "Medium", color: "var(--caution-amber)" },
  high: { label: "High", color: "var(--pulse-coral)" },
  critical: { label: "Critical", color: "var(--pulse-coral)" },
};

export const resultMeta: Record<AuditResult, { label: string; color: string }> = {
  success: { label: "Success", color: "var(--vital-green)" },
  failed: { label: "Failed", color: "var(--pulse-coral)" },
  denied: { label: "Denied", color: "var(--pulse-coral)" },
  blocked: { label: "Blocked", color: "var(--pulse-coral)" },
  partial: { label: "Partial", color: "var(--caution-amber)" },
};

export const categoryLabels: Record<AuditEventCategory, string> = {
  authentication: "Authentication",
  patient: "Patient",
  clinical: "Clinical",
  medication: "Medication",
  laboratory: "Laboratory",
  radiology: "Radiology",
  billing: "Billing",
  administration: "Administration",
  integration: "Integration",
  security: "Security",
  system: "System",
};

export const sourceLabels: Record<AuditSource, string> = {
  web: "HMS Web Portal",
  mobile: "Mobile App",
  api: "API",
  integration: "Integration",
  system: "System",
  "background-job": "Background Job",
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
}

export function statusPillStyle(color: string) {
  return { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color };
}
