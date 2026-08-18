import { RouteObject } from "react-router-dom";
import { DoctorSignIn } from "./pages/DoctorSignIn";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { MyPatients } from "./pages/MyPatients";
import { PatientDetail } from "./pages/PatientDetail";

/**
 * This module's own routes, registered under /doctor/* in the root router.
 * Add every new Doctor Portal screen here as it's built — this file
 * NEVER needs another module's owner to touch it, and the root router
 * only imports this array, so two devs building different modules
 * never conflict in the same file.
 */
export const doctorPortalRoutes: RouteObject[] = [
  { path: "sign-in", element: <DoctorSignIn /> },
  { path: "dashboard", element: <DoctorDashboard /> },
  { path: "patients", element: <MyPatients /> },
  { path: "patients/:id", element: <PatientDetail /> },
  // { path: "encounter/:id", element: <EncounterWorkspace /> },
  // ...add remaining Doctor Portal screens here as built
];
