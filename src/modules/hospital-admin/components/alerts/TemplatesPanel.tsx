import { useState } from "react";
import { Card } from "@shared/design-system/components";
import { channelLabels } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import type { NotificationTemplate } from "@modules/hospital-admin/api";

interface TemplatesPanelProps {
  templates: NotificationTemplate[];
  previewFor: (template: NotificationTemplate, sampleData: Record<string, string>) => string;
}

const languageLabels: Record<string, string> = { en: "English", ar: "Arabic", ur: "Urdu", fr: "French" };

const sampleData: Record<string, string> = {
  patientName: "Hamza Butt", doctorName: "Sarah Jenkins", appointmentDate: "20 Aug 2026", appointmentTime: "10:00 AM",
  hospitalName: "City General Hospital", department: "Cardiology", appointmentId: "APT-2026-000441",
  testName: "Potassium", value: "6.8 mmol/L", itemName: "Insulin XYZ",
};

/** Module-local — Notification Templates (spec §20) + Multi-language Templates (spec §21): per-event/channel/language message templates with a live token-substitution preview. */
export function TemplatesPanel({ templates, previewFor }: TemplatesPanelProps) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id);
  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Name</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Event</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Channel</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Language</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {templates.map((t) => (
                <tr key={t.id} className={`cursor-pointer hover:bg-surface-container-low ${t.id === selected?.id ? "bg-surface-container-low" : ""}`} onClick={() => setSelectedId(t.id)}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{t.name}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{t.event}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{channelLabels[t.channel]}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{languageLabels[t.language]}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.status === "active" ? "bg-vital-green/14 text-vital-green" : "bg-outline/14 text-on-surface-variant"}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-1">Live Preview</h2>
          <p className="text-xs text-on-surface-variant mb-4">Rendered with sample data — tokens: {selected.variables.join(", ")}</p>
          {selected.subject && <p className="text-sm font-semibold text-on-surface mb-2">Subject: {previewFor({ ...selected, message: selected.subject }, sampleData)}</p>}
          <p className="rounded-card bg-surface-container-low p-4 text-sm text-on-surface whitespace-pre-wrap" dir={selected.language === "ar" || selected.language === "ur" ? "rtl" : "ltr"}>
            {previewFor(selected, sampleData)}
          </p>
        </Card>
      )}
    </div>
  );
}
