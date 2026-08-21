import { RouteObject } from "react-router-dom";
import { RadiologySignIn } from "./pages/RadiologySignIn";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { TechnicianWorklist } from "./pages/TechnicianWorklist";
import { RadiologistWorklist } from "./pages/RadiologistWorklist";
import { StudyWorkspace } from "./pages/StudyWorkspace";
import { CriticalFindings } from "./pages/CriticalFindings";
import { PeerReview } from "./pages/PeerReview";
import { Referrals } from "./pages/Referrals";
import { Procedures } from "./pages/Procedures";
import { Equipment } from "./pages/Equipment";
import { Billing } from "./pages/Billing";
import { ReportsAnalytics } from "./pages/ReportsAnalytics";
import { Notifications } from "./pages/Notifications";
import { Audit } from "./pages/Audit";
import { Configuration } from "./pages/Configuration";

/**
 * Radiology (RIS) module routes — registered under /radiology/* in the
 * root router. Same architecture as Doctor/Nursing/Pharmacy: routes.tsx,
 * pages/, api/ (split by domain, pure barrel).
 */
export const radiologyRoutes: RouteObject[] = [
  { path: "sign-in", element: <RadiologySignIn /> },
  { path: "dashboard", element: <Dashboard /> },
  { path: "orders", element: <Orders /> },
  { path: "technician-worklist", element: <TechnicianWorklist /> },
  { path: "radiologist-worklist", element: <RadiologistWorklist /> },
  { path: "orders/:orderId/workspace", element: <StudyWorkspace /> },
  { path: "critical-findings", element: <CriticalFindings /> },
  { path: "peer-review", element: <PeerReview /> },
  { path: "referrals", element: <Referrals /> },
  { path: "procedures", element: <Procedures /> },
  { path: "equipment", element: <Equipment /> },
  { path: "billing", element: <Billing /> },
  { path: "reports-analytics", element: <ReportsAnalytics /> },
  { path: "notifications", element: <Notifications /> },
  { path: "audit", element: <Audit /> },
  { path: "configuration", element: <Configuration /> },
];
