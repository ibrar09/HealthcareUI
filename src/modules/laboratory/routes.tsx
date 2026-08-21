import { RouteObject } from "react-router-dom";
import { LaboratorySignIn } from "./pages/LaboratorySignIn";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Collection } from "./pages/Collection";
import { Processing } from "./pages/Processing";
import { Worklists } from "./pages/Worklists";
import { CriticalResults } from "./pages/CriticalResults";
import { TestCatalog } from "./pages/TestCatalog";
import { Analyzers } from "./pages/Analyzers";
import { QualityControl } from "./pages/QualityControl";
import { Reports } from "./pages/Reports";
import { Rejected } from "./pages/Rejected";
import { Inventory } from "./pages/Inventory";
import { Billing } from "./pages/Billing";
import { Notifications } from "./pages/Notifications";
import { Analytics } from "./pages/Analytics";
import { Audit } from "./pages/Audit";
import { Configuration } from "./pages/Configuration";

/**
 * Laboratory (LIS) module routes — registered under /laboratory/* in the
 * root router. Same architecture as Doctor/Nursing/Pharmacy/Radiology:
 * routes.tsx, api/ split by domain with a pure barrel, pages/.
 */
export const laboratoryRoutes: RouteObject[] = [
  { path: "sign-in", element: <LaboratorySignIn /> },
  { path: "dashboard", element: <Dashboard /> },
  { path: "orders", element: <Orders /> },
  { path: "collection", element: <Collection /> },
  { path: "processing", element: <Processing /> },
  { path: "worklists", element: <Worklists /> },
  { path: "critical-results", element: <CriticalResults /> },
  { path: "tests", element: <TestCatalog /> },
  { path: "analyzers", element: <Analyzers /> },
  { path: "quality-control", element: <QualityControl /> },
  { path: "reports", element: <Reports /> },
  { path: "rejected", element: <Rejected /> },
  { path: "inventory", element: <Inventory /> },
  { path: "billing", element: <Billing /> },
  { path: "notifications", element: <Notifications /> },
  { path: "analytics", element: <Analytics /> },
  { path: "audit", element: <Audit /> },
  { path: "configuration", element: <Configuration /> },
];
