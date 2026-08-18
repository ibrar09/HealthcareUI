import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ProfileSettingsCard } from "@modules/doctor-portal/components/ProfileSettingsCard";
import { NotificationPreferencesCard } from "@modules/doctor-portal/components/NotificationPreferencesCard";
import { SecuritySettingsCard } from "@modules/doctor-portal/components/SecuritySettingsCard";
import * as api from "@modules/doctor-portal/api";
import type { DoctorProfile, NotificationPreferences } from "@modules/doctor-portal/api";

export function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    api.getDoctorProfile().then(setProfile);
    api.getNotificationPreferences().then(setPreferences);
  }, []);

  function handleSignOut() {
    signOut();
    navigate(ROUTES.DOCTOR.SIGN_IN);
  }

  return (
    <DoctorLayout active="Settings">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
      </div>

      {profile && <ProfileSettingsCard profile={profile} onSave={(input) => api.updateDoctorContact(input).then(setProfile)} />}
      {preferences && <NotificationPreferencesCard preferences={preferences} onChange={(prefs) => api.updateNotificationPreferences(prefs).then(setPreferences)} />}

      <SecuritySettingsCard onSignOut={handleSignOut} />
    </DoctorLayout>
  );
}
