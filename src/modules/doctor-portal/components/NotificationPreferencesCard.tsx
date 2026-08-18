import type { NotificationPreferences } from "@modules/doctor-portal/api";

interface NotificationPreferencesCardProps {
  preferences: NotificationPreferences;
  onChange: (prefs: NotificationPreferences) => void;
}

const LABELS: { key: keyof NotificationPreferences; label: string; hint: string }[] = [
  { key: "newMessages", label: "New Messages", hint: "A patient or staff member sends you a message" },
  { key: "appointmentRequests", label: "Appointment Requests", hint: "A patient requests a new appointment" },
  { key: "criticalResults", label: "Critical Results", hint: "A lab or imaging result comes back critical" },
  { key: "followUpsDue", label: "Follow-ups Due", hint: "A patient's scheduled follow-up is due" },
  { key: "waitlistSlotOpened", label: "Waitlist Slot Opened", hint: "A slot opens up that a waitlisted patient could take" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

/** Module-local — which events surface a notification. Doesn't control whether the underlying event happens, only whether it notifies. */
export function NotificationPreferencesCard({ preferences, onChange }: NotificationPreferencesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-4">Notification Preferences</h2>
      <div className="flex flex-col divide-y divide-slate-50">
        {LABELS.map(({ key, label, hint }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-700">{label}</p>
              <p className="text-[11px] text-slate-400">{hint}</p>
            </div>
            <Toggle checked={preferences[key]} onChange={() => onChange({ ...preferences, [key]: !preferences[key] })} />
          </div>
        ))}
      </div>
    </div>
  );
}
