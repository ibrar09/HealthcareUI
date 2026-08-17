import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wrap any route group that requires sign-in. Usage in a module's
 * routes.tsx once real auth is wired up:
 *
 *   { element: <ProtectedRoute />, children: [
 *     { path: "dashboard", element: <DoctorDashboard /> },
 *   ]}
 *
 * Currently permissive (no redirect) since mock auth doesn't persist
 * a session — flip the commented logic on once AuthProvider does.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  void isAuthenticated; // not yet enforced — see comment above
  // if (!isAuthenticated) return <Navigate to="/doctor/sign-in" replace />;
  return <Outlet />;
}
