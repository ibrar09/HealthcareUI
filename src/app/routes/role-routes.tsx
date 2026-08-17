import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/constants/roles";

interface RoleRouteProps {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Gate a screen to specific roles — e.g. Platform Admin screens should
 * only render for ROLES.PLATFORM_ADMIN even if someone is authenticated
 * as a doctor. Frontend-only convenience; real enforcement is the
 * backend Consent/Authorization Service.
 *
 * Usage:
 *   <RoleRoute allow={[ROLES.HOSPITAL_ADMIN]}><HospitalAdminDashboard /></RoleRoute>
 */
export function RoleRoute({ allow, children, fallback = null }: RoleRouteProps) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
