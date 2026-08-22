import { RouteObject } from "react-router-dom";
import { EmergencySignIn } from "./pages/EmergencySignIn";
import { Dashboard } from "./pages/Dashboard";
import { Arrivals } from "./pages/Arrivals";
import { Triage } from "./pages/Triage";
import { Queue } from "./pages/Queue";
import { Beds } from "./pages/Beds";
import { DoctorWorkspace } from "./pages/DoctorWorkspace";
import { NursingWorkspace } from "./pages/NursingWorkspace";
import { EncounterWorkspace } from "./pages/EncounterWorkspace";
import { Orders } from "./pages/Orders";
import { Procedures } from "./pages/Procedures";
import { Monitoring } from "./pages/Monitoring";
import { CriticalResults } from "./pages/CriticalResults";
import { Consultations } from "./pages/Consultations";
import { Disposition } from "./pages/Disposition";
import { Ambulance } from "./pages/Ambulance";
import { Handover } from "./pages/Handover";
import { ReportsAnalytics } from "./pages/ReportsAnalytics";
import { Audit } from "./pages/Audit";
import { Configuration } from "./pages/Configuration";

/**
 * Emergency Department (EDIS) module routes — registered under
 * /emergency/* in the root router. Same architecture as Doctor/Nursing/
 * Pharmacy/Radiology/Laboratory: routes.tsx, api/ split by domain with a
 * pure barrel, pages/.
 */
export const emergencyRoutes: RouteObject[] = [
  { path: "sign-in", element: <EmergencySignIn /> },
  { path: "dashboard", element: <Dashboard /> },
  { path: "arrivals", element: <Arrivals /> },
  { path: "triage", element: <Triage /> },
  { path: "queue", element: <Queue /> },
  { path: "beds", element: <Beds /> },
  { path: "doctor-workspace", element: <DoctorWorkspace /> },
  { path: "nursing-workspace", element: <NursingWorkspace /> },
  { path: "encounters/:id", element: <EncounterWorkspace /> },
  { path: "orders", element: <Orders /> },
  { path: "procedures", element: <Procedures /> },
  { path: "monitoring", element: <Monitoring /> },
  { path: "critical-results", element: <CriticalResults /> },
  { path: "consultations", element: <Consultations /> },
  { path: "disposition", element: <Disposition /> },
  { path: "ambulance", element: <Ambulance /> },
  { path: "handover", element: <Handover /> },
  { path: "reports", element: <ReportsAnalytics /> },
  { path: "audit", element: <Audit /> },
  { path: "configuration", element: <Configuration /> },
];
