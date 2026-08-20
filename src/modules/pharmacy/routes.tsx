import { RouteObject } from "react-router-dom";
import { PharmacySignIn } from "./pages/PharmacySignIn";
import { Dashboard } from "./pages/Dashboard";
import { PrescriptionQueue } from "./pages/PrescriptionQueue";
import { ClinicalVerification } from "./pages/ClinicalVerification";
import { Dispensing } from "./pages/Dispensing";
import { IVCompounding } from "./pages/IVCompounding";
import { PatientMedication360 } from "./pages/PatientMedication360";
import { MedicationReconciliation } from "./pages/MedicationReconciliation";
import { ClinicalInterventions } from "./pages/ClinicalInterventions";
import { AdverseDrugReactions } from "./pages/AdverseDrugReactions";
import { Formulary } from "./pages/Formulary";
import { Inventory } from "./pages/Inventory";
import { ControlledMedications } from "./pages/ControlledMedications";
import { MedicationRecall } from "./pages/MedicationRecall";
import { Procurement } from "./pages/Procurement";
import { Alerts } from "./pages/Alerts";
import { Reports } from "./pages/Reports";
import { Audit } from "./pages/Audit";
import { Configuration } from "./pages/Configuration";

/**
 * Pharmacy Portal routes — registered under /pharmacy/* in the root router.
 * Same architecture as Doctor/Nursing: routes.tsx, pages/, api/ (split by
 * domain, pure barrel), components/.
 */
export const pharmacyRoutes: RouteObject[] = [
  { path: "sign-in", element: <PharmacySignIn /> },
  { path: "dashboard", element: <Dashboard /> },
  { path: "prescription-queue", element: <PrescriptionQueue /> },
  { path: "orders/:id/verify", element: <ClinicalVerification /> },
  { path: "dispensing", element: <Dispensing /> },
  { path: "iv-compounding", element: <IVCompounding /> },
  { path: "patient-360", element: <PatientMedication360 /> },
  { path: "reconciliation", element: <MedicationReconciliation /> },
  { path: "interventions", element: <ClinicalInterventions /> },
  { path: "adverse-reactions", element: <AdverseDrugReactions /> },
  { path: "formulary", element: <Formulary /> },
  { path: "inventory", element: <Inventory /> },
  { path: "controlled-medications", element: <ControlledMedications /> },
  { path: "recalls", element: <MedicationRecall /> },
  { path: "procurement", element: <Procurement /> },
  { path: "alerts", element: <Alerts /> },
  { path: "reports", element: <Reports /> },
  { path: "audit", element: <Audit /> },
  { path: "configuration", element: <Configuration /> },
];
