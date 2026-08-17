/**
 * Every role in the platform. Matches the RBAC roles from the backend
 * Architecture doc (§7 Security & Tenancy Model) — keep these in sync
 * with whatever IAM Service defines once it's built.
 */
export const ROLES = {
  DOCTOR: "doctor",
  NURSE: "nurse",
  LAB_TECHNICIAN: "lab_technician",
  RADIOLOGIST: "radiologist",
  PHARMACIST: "pharmacist",
  RECEPTIONIST: "receptionist",
  HOSPITAL_ADMIN: "hospital_admin",
  BILLING_STAFF: "billing_staff",
  PLATFORM_ADMIN: "platform_admin",
  PATIENT: "patient",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
