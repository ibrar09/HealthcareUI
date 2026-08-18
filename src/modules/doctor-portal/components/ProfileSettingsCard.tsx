import { useState } from "react";
import type { DoctorProfile } from "@modules/doctor-portal/api";

interface ProfileSettingsCardProps {
  profile: DoctorProfile;
  onSave: (input: { email: string; phone: string }) => void;
}

const inputClass = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const readOnlyClass = "w-full text-sm border border-slate-100 bg-slate-50 text-slate-500 rounded-lg px-3 py-2";

/** Module-local — profile settings. Name/specialty/hospital are institutionally set (read-only); only contact info is editable. */
export function ProfileSettingsCard({ profile, onSave }: ProfileSettingsCardProps) {
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave({ email: email.trim(), phone: phone.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-1">Profile</h2>
      <p className="text-[11px] text-slate-400 mb-4">Name, specialty, and hospital are set by City General Hospital and can't be self-edited.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
          <div className={readOnlyClass}>{profile.name}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Specialty</label>
          <div className={readOnlyClass}>{profile.specialty}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Hospital</label>
          <div className={readOnlyClass}>{profile.hospital}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="settings-email" className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="settings-phone" className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
          <input id="settings-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2">
          Save Changes
        </button>
        {saved && <span className="text-xs text-emerald-600 font-semibold">Saved</span>}
      </div>
    </div>
  );
}
