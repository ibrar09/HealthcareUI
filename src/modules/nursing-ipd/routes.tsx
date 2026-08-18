import { RouteObject } from "react-router-dom";
import { NurseSignIn } from "./pages/NurseSignIn";

/**
 * Nursing / IPD module routes — registered under /nursing/* in the root
 * router. See src/modules/doctor-portal/ for the reference pattern
 * (routes.tsx, pages/, api/, components/).
 */
export const nursingipdRoutes: RouteObject[] = [
  { path: "sign-in", element: <NurseSignIn /> },
  // ...add remaining Nursing Portal screens here as built
];
