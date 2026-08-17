import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { doctorPortalRoutes } from "@modules/doctor-portal/routes";
import { hospitaladminRoutes } from "@modules/hospital-admin/routes";
import { laboratoryRoutes } from "@modules/laboratory/routes";
import { radiologyRoutes } from "@modules/radiology/routes";
import { pharmacyRoutes } from "@modules/pharmacy/routes";
import { nursingipdRoutes } from "@modules/nursing-ipd/routes";
import { emergencyRoutes } from "@modules/emergency/routes";
import { billingRoutes } from "@modules/billing/routes";
import { platformadminRoutes } from "@modules/platform-admin/routes";
import { patientappRoutes } from "@modules/patient-app/routes";
import { authRoutes } from "@modules/auth/routes";

/**
 * THE ONLY FILE THAT KNOWS ABOUT ALL 10 MODULES AT ONCE.
 *
 * Each module owns its own routes.tsx — this file just mounts them
 * under a URL prefix. Adding a module here is a 2-line change
 * (import + spread into children), so two devs working in different
 * module folders essentially never conflict here.
 *
 * Team convention: whoever finishes a module's FIRST screen adds that
 * module's mount point below in its own small PR — don't bundle it
 * into a feature PR that also touches page code.
 */
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/hospital-admin/dashboard" replace /> }, // dev convenience — change freely while building

  { path: "/auth", children: authRoutes },
  { path: "/doctor", children: doctorPortalRoutes },
  { path: "/hospital-admin", children: hospitaladminRoutes },
  { path: "/laboratory", children: laboratoryRoutes },
  { path: "/radiology", children: radiologyRoutes },
  { path: "/pharmacy", children: pharmacyRoutes },
  { path: "/nursing", children: nursingipdRoutes },
  { path: "/emergency", children: emergencyRoutes },
  { path: "/billing", children: billingRoutes },
  { path: "/platform-admin", children: platformadminRoutes },
  { path: "/app", children: patientappRoutes }, // Patient App (web)
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
