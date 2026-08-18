import { mockRequest } from "@shared/lib/api/client";

// Doctor Portal's Settings module. Name/specialty/hospital are
// institutionally set (credentialing, HR) — a doctor doesn't self-edit
// their own specialty, so only contact info (email/phone) is editable here.
// Password reset stays IT-Support-only (see Help Center), never self-service,
// to keep account recovery auditable.

export interface DoctorProfile {
  name: string;
  specialty: string;
  hospital: string;
  email: string;
  phone: string;
}

export interface NotificationPreferences {
  newMessages: boolean;
  appointmentRequests: boolean;
  criticalResults: boolean;
  followUpsDue: boolean;
  waitlistSlotOpened: boolean;
}

let doctorProfile: DoctorProfile = {
  name: "Dr. Ayesha Raza",
  specialty: "Cardiology",
  hospital: "City General Hospital",
  email: "ayesha.raza@citygeneral.org",
  phone: "+92 300 1234567",
};

let notificationPreferences: NotificationPreferences = {
  newMessages: true,
  appointmentRequests: true,
  criticalResults: true,
  followUpsDue: true,
  waitlistSlotOpened: false,
};

export const getDoctorProfile = () => mockRequest({ ...doctorProfile });
export const getNotificationPreferences = () => mockRequest({ ...notificationPreferences });

export function updateDoctorContact(input: { email: string; phone: string }) {
  doctorProfile = { ...doctorProfile, ...input };
  return mockRequest({ ...doctorProfile });
}

export function updateNotificationPreferences(prefs: NotificationPreferences) {
  notificationPreferences = { ...prefs };
  return mockRequest({ ...notificationPreferences });
}
