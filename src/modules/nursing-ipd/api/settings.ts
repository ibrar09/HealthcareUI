import { mockRequest } from "@shared/lib/api/client";

export interface NurseProfile {
  name: string;
  ward: string;
  hospital: string;
  email: string;
  phone: string;
}

export interface NotificationPreferences {
  medicationDue: boolean;
  criticalAlerts: boolean;
  taskReminders: boolean;
  shiftHandoverReminders: boolean;
}

let profile: NurseProfile = {
  name: "Nurse Fatima Khalid",
  ward: "Medical Ward A",
  hospital: "City General Hospital",
  email: "fatima.khalid@citygeneral.org",
  phone: "+92 300 1234567",
};

let prefs: NotificationPreferences = { medicationDue: true, criticalAlerts: true, taskReminders: true, shiftHandoverReminders: false };

export const getProfile = () => mockRequest({ ...profile });
export const getNotificationPreferences = () => mockRequest({ ...prefs });

export function updateProfile(fields: Partial<Pick<NurseProfile, "email" | "phone">>) {
  profile = { ...profile, ...fields };
  return mockRequest({ ...profile });
}

export function updateNotificationPreferences(fields: Partial<NotificationPreferences>) {
  prefs = { ...prefs, ...fields };
  return mockRequest({ ...prefs });
}
