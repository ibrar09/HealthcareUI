import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@modules/nursing-ipd/api";
import type { NurseProfile, NotificationPreferences } from "@modules/nursing-ipd/api";

const PREF_LABELS: Record<keyof NotificationPreferences, string> = {
  medicationDue: "Medication due reminders",
  criticalAlerts: "Critical safety alerts",
  taskReminders: "Task reminders",
  shiftHandoverReminders: "Shift handover reminders",
};

export function Settings() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<NurseProfile | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getProfile().then((p) => {
      setProfile(p);
      setEmail(p.email);
      setPhone(p.phone);
    });
    api.getNotificationPreferences().then(setPrefs);
  }, []);

  function handleSaveProfile() {
    api.updateProfile({ email, phone }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  function handleTogglePref(key: keyof NotificationPreferences) {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    api.updateNotificationPreferences({ [key]: next[key] });
  }

  return (
    <NurseLayout active="Settings">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Profile and notification preferences.</p>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Name</p><p className="text-sm font-semibold text-slate-700">{profile.name}</p></div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Ward</p><p className="text-sm font-semibold text-slate-700">{profile.ward}</p></div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Hospital</p><p className="text-sm font-semibold text-slate-700">{profile.hospital}</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-200" />
            </div>
          </div>
          <button type="button" onClick={handleSaveProfile} className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-4 py-2.5">
            {saved ? "Saved" : "Save Profile"}
          </button>
        </div>
      )}

      {prefs && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Notification Preferences</h2>
          <div className="flex flex-col divide-y divide-slate-50">
            {(Object.keys(PREF_LABELS) as (keyof NotificationPreferences)[]).map((key) => (
              <label key={key} className="flex items-center justify-between py-2.5 cursor-pointer">
                <span className="text-xs font-medium text-slate-700">{PREF_LABELS[key]}</span>
                <input type="checkbox" checked={prefs[key]} onChange={() => handleTogglePref(key)} className="w-4 h-4 accent-teal-600" />
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Security</h2>
        <button type="button" onClick={() => signOut()} className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg px-4 py-2.5">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </NurseLayout>
  );
}
