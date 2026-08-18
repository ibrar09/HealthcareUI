/**
 * Centralized path strings — modules import these instead of typing
 * "/doctor/dashboard" by hand in multiple places. Update a path here,
 * it updates everywhere that links to it.
 */
export const ROUTES = {
  DOCTOR: {
    SIGN_IN: "/doctor/sign-in",
    DASHBOARD: "/doctor/dashboard",
    PATIENTS: "/doctor/patients",
    PATIENT_DETAIL: (id: string) => `/doctor/patients/${id}`,
    ENCOUNTER: (patientId: string) => `/doctor/encounter/${patientId}`,
    APPOINTMENTS: "/doctor/appointments",
  },
  HOSPITAL_ADMIN: {
    SIGN_IN: "/hospital-admin/sign-in",
    DASHBOARD: "/hospital-admin/dashboard",
    RECEPTION: "/hospital-admin/reception",
    FACILITIES: "/hospital-admin/facilities",
    STAFF: "/hospital-admin/staff",
    STAFF_DETAIL: (id: string) => `/hospital-admin/staff/${id}`,
    PATIENTS: "/hospital-admin/patients",
    PATIENT_DETAIL: (id: string) => `/hospital-admin/patients/${id}`,
    MPI_REVIEW: "/hospital-admin/patients/mpi-review",
    MPI_REVIEW_PAIR: (id: string) => `/hospital-admin/patients/mpi-review/${id}`,
    BEDS: "/hospital-admin/beds",
    APPOINTMENTS: "/hospital-admin/appointments",
    BILLING: "/hospital-admin/billing",
    EMERGENCY: "/hospital-admin/emergency",
    LABORATORY: "/hospital-admin/laboratory",
    RADIOLOGY: "/hospital-admin/radiology",
    PHARMACY: "/hospital-admin/pharmacy",
    OPERATION_THEATRE: "/hospital-admin/operation-theatre",
    INVENTORY: "/hospital-admin/inventory",
    REPORTS: "/hospital-admin/reports",
    AUDIT: "/hospital-admin/audit",
    CONFIGURATION: "/hospital-admin/configuration",
    ALERTS: "/hospital-admin/alerts",
  },
  LABORATORY: {
    SIGN_IN: "/laboratory/sign-in",
  },
  RADIOLOGY: {
    SIGN_IN: "/radiology/sign-in",
  },
  PHARMACY: {
    SIGN_IN: "/pharmacy/sign-in",
  },
  NURSING: {
    SIGN_IN: "/nursing/sign-in",
  },
  EMERGENCY: {
    SIGN_IN: "/emergency/sign-in",
  },
  BILLING: {
    SIGN_IN: "/billing/sign-in",
  },
  PLATFORM_ADMIN: {
    SIGN_IN: "/platform-admin/sign-in",
  },
  PATIENT_APP: {
    HOME: "/app/home",
  },
} as const;
