import { RouteObject } from "react-router-dom";
import { NurseSignIn } from "./pages/NurseSignIn";
import { NurseDashboard } from "./pages/NurseDashboard";
import { MyPatients } from "./pages/MyPatients";
import { NurseBedsideWorkspace } from "./pages/NurseBedsideWorkspace";
import { WardView } from "./pages/WardView";
import { MedicationAdministration } from "./pages/MedicationAdministration";
import { Assessments } from "./pages/Assessments";
import { NursingAssessmentForm } from "./pages/NursingAssessmentForm";
import { Tasks } from "./pages/Tasks";
import { NursingNotes } from "./pages/NursingNotes";
import { PatientNotesForm } from "./pages/PatientNotesForm";
import { CarePlans } from "./pages/CarePlans";
import { PatientCarePlansForm } from "./pages/PatientCarePlansForm";
import { Alerts } from "./pages/Alerts";
import { ShiftHandover } from "./pages/ShiftHandover";
import { Discharge } from "./pages/Discharge";
import { Rounds } from "./pages/Rounds";
import { Vitals } from "./pages/Vitals";
import { OrdersResults } from "./pages/OrdersResults";
import { SpecimenCollection } from "./pages/SpecimenCollection";
import { Safety } from "./pages/Safety";
import { Procedures } from "./pages/Procedures";
import { BedManagement } from "./pages/BedManagement";
import { Transfers } from "./pages/Transfers";
import { CareTeam } from "./pages/CareTeam";
import { Documents } from "./pages/Documents";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

/**
 * Nursing / IPD module routes — registered under /nursing/* in the root
 * router. See src/modules/doctor-portal/ for the reference pattern
 * (routes.tsx, pages/, api/, components/).
 */
export const nursingipdRoutes: RouteObject[] = [
  { path: "sign-in", element: <NurseSignIn /> },
  { path: "dashboard", element: <NurseDashboard /> },
  { path: "patients", element: <MyPatients /> },
  { path: "patients/:id", element: <NurseBedsideWorkspace /> },
  { path: "ward", element: <WardView /> },
  { path: "medication-administration", element: <MedicationAdministration /> },
  { path: "assessments", element: <Assessments /> },
  { path: "patients/:id/assessment", element: <NursingAssessmentForm /> },
  { path: "tasks", element: <Tasks /> },
  { path: "notes", element: <NursingNotes /> },
  { path: "patients/:id/notes", element: <PatientNotesForm /> },
  { path: "care-plans", element: <CarePlans /> },
  { path: "patients/:id/care-plans", element: <PatientCarePlansForm /> },
  { path: "alerts", element: <Alerts /> },
  { path: "shift-handover", element: <ShiftHandover /> },
  { path: "discharge", element: <Discharge /> },
  { path: "rounds", element: <Rounds /> },
  { path: "vitals", element: <Vitals /> },
  { path: "orders-results", element: <OrdersResults /> },
  { path: "specimen-collection", element: <SpecimenCollection /> },
  { path: "safety", element: <Safety /> },
  { path: "procedures", element: <Procedures /> },
  { path: "bed-management", element: <BedManagement /> },
  { path: "transfers", element: <Transfers /> },
  { path: "care-team", element: <CareTeam /> },
  { path: "documents", element: <Documents /> },
  { path: "messages", element: <Messages /> },
  { path: "notifications", element: <Notifications /> },
  { path: "reports", element: <Reports /> },
  { path: "settings", element: <Settings /> },
];
