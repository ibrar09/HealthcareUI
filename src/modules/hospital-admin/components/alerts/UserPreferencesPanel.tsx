import { useState } from "react";
import { Card } from "@shared/design-system/components";
import { toggleTrackClass, toggleThumbClass } from "@modules/hospital-admin/components/configuration/configHelpers";
import { ConfigToggleRow } from "@modules/hospital-admin/components/configuration/ConfigToggleRow";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { UserNotificationPreference, ChannelPreferenceSet, QuietHoursConfig } from "@modules/hospital-admin/api";

interface UserPreferencesPanelProps {
  preference: UserNotificationPreference | null;
  quietHours: QuietHoursConfig | null;
  onUpdateSeverity: (severity: "critical" | "high" | "medium" | "low", channels: ChannelPreferenceSet) => void;
  onUpdateQuietHours: (updates: { enabled: boolean; startTime: string; endTime: string }) => void;
}

const rows: { key: "critical" | "high" | "medium" | "low"; label: string; mandatory?: boolean }[] = [
  { key: "critical", label: "Critical Alerts", mandatory: true },
  { key: "high", label: "High-Priority Alerts" },
  { key: "medium", label: "Medium Alerts" },
  { key: "low", label: "Low Alerts" },
];

const channelKeys: (keyof ChannelPreferenceSet)[] = ["push", "sms", "email", "inApp"];
const channelLabelMap: Record<keyof ChannelPreferenceSet, string> = { push: "Push", sms: "SMS", email: "Email", inApp: "In-App" };

/** Module-local — Notification Preferences (spec §27) + Quiet Hours (spec §28), combined: per-severity per-channel toggles (Push/SMS always locked on for Critical, per the spec's own explicit safety rule) plus a quiet-hours window that critical alerts always bypass. */
export function UserPreferencesPanel({ preference, quietHours, onUpdateSeverity, onUpdateQuietHours }: UserPreferencesPanelProps) {
  const [start, setStart] = useState(quietHours?.startTime ?? "22:00");
  const [end, setEnd] = useState(quietHours?.endTime ?? "07:00");
  if (!preference || !quietHours) return null;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-1">Notification Preferences</h2>
        <p className="text-xs text-on-surface-variant mb-4">Mandatory safety-critical channels for Critical Alerts (Push + SMS) cannot be disabled, per hospital policy.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Severity</th>
                {channelKeys.map((ck) => (
                  <th key={ck} className="text-center py-2 px-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">{channelLabelMap[ck]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => {
                const current = preference[row.key];
                return (
                  <tr key={row.key}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{row.label}</td>
                    {channelKeys.map((ck) => {
                      const locked = row.mandatory && (ck === "push" || ck === "sms");
                      return (
                        <td key={ck} className="py-2.5 px-3 text-center">
                          <button
                            type="button" role="switch" aria-checked={current[ck]} disabled={locked}
                            onClick={() => !locked && onUpdateSeverity(row.key, { ...current, [ck]: !current[ck] })}
                            className={`${toggleTrackClass(current[ck])} ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <span className={toggleThumbClass(current[ck])} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Quiet Hours</h2>
        <ConfigToggleRow
          label="Quiet Hours Enabled"
          description="Non-critical notifications are held during this window. Critical alerts always bypass quiet hours."
          checked={quietHours.enabled}
          onChange={(v) => onUpdateQuietHours({ enabled: v, startTime: start, endTime: end })}
        />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Start Time</span>
            <input type="time" className={formInputClass} value={start} onChange={(e) => { setStart(e.target.value); onUpdateQuietHours({ enabled: quietHours.enabled, startTime: e.target.value, endTime: end }); }} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">End Time</span>
            <input type="time" className={formInputClass} value={end} onChange={(e) => { setEnd(e.target.value); onUpdateQuietHours({ enabled: quietHours.enabled, startTime: start, endTime: e.target.value }); }} />
          </label>
        </div>
      </Card>
    </div>
  );
}
