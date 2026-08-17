import { useAuth } from "./useAuth";
import { roleHasPermission, type Permission } from "@/constants/permissions";

/** Usage: const { can } = usePermissions(); if (can(PERMISSIONS.DISPENSE_MEDICATION)) ... */
export function usePermissions() {
  const { user } = useAuth();

  function can(permission: Permission): boolean {
    if (!user) return false;
    return roleHasPermission(user.role, permission);
  }

  return { can };
}
