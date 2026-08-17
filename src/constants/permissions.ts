import { ROLES, type Role } from "./roles";

/**
 * Coarse-grained frontend permission gates — mirrors what the backend
 * Consent/Authorization Service will actually enforce. The frontend
 * check is a UX convenience (hide/disable what a role can't use);
 * the backend is the real enforcement boundary. Never rely on this
 * file alone for security-sensitive decisions.
 */
export const PERMISSIONS = {
  VIEW_PATIENT_RECORDS: "view_patient_records",
  CREATE_CLINICAL_NOTES: "create_clinical_notes",
  CREATE_ORDERS: "create_orders",
  DISPENSE_MEDICATION: "dispense_medication",
  ENTER_LAB_RESULTS: "enter_lab_results",
  MANAGE_STAFF: "manage_staff",
  MANAGE_BILLING: "manage_billing",
  MANAGE_TENANTS: "manage_tenants",
  VIEW_AUDIT_LOG: "view_audit_log",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.DOCTOR]: [PERMISSIONS.VIEW_PATIENT_RECORDS, PERMISSIONS.CREATE_CLINICAL_NOTES, PERMISSIONS.CREATE_ORDERS],
  [ROLES.NURSE]: [PERMISSIONS.VIEW_PATIENT_RECORDS],
  [ROLES.LAB_TECHNICIAN]: [PERMISSIONS.ENTER_LAB_RESULTS],
  [ROLES.RADIOLOGIST]: [PERMISSIONS.VIEW_PATIENT_RECORDS],
  [ROLES.PHARMACIST]: [PERMISSIONS.DISPENSE_MEDICATION],
  [ROLES.RECEPTIONIST]: [],
  [ROLES.HOSPITAL_ADMIN]: [PERMISSIONS.MANAGE_STAFF, PERMISSIONS.MANAGE_BILLING],
  [ROLES.BILLING_STAFF]: [PERMISSIONS.MANAGE_BILLING],
  [ROLES.PLATFORM_ADMIN]: [PERMISSIONS.MANAGE_TENANTS, PERMISSIONS.VIEW_AUDIT_LOG],
  [ROLES.PATIENT]: [],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
