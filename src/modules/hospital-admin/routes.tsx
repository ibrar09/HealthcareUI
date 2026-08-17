import { RouteObject } from "react-router-dom";
import { HospitalAdminSignIn } from "./pages/HospitalAdminSignIn";
import { HospitalAdminDashboard } from "./pages/dashboard/HospitalAdminDashboard";
import { ReceptionDashboard } from "./pages/dashboard/ReceptionDashboard";
import { FacilityList } from "./pages/facilities/FacilityList";
import { StaffDirectory } from "./pages/staff/StaffDirectory";
import { StaffDetail } from "./pages/staff/StaffDetail";
import { PatientAdministration } from "./pages/patients/PatientAdministration";
import { PatientDetail } from "./pages/patients/PatientDetail";
import { MpiDuplicateReview } from "./pages/patients/MpiDuplicateReview";
import { MpiPairReview } from "./pages/patients/MpiPairReview";
import { BedManagement } from "./pages/beds/BedManagement";
import { Appointments } from "./pages/appointments/Appointments";
import { BillingManagement } from "./pages/billing/BillingManagement";
import { EmergencyManagement } from "./pages/emergency/EmergencyManagement";
import { LaboratoryManagement } from "./pages/laboratory/LaboratoryManagement";
import { RadiologyManagement } from "./pages/radiology/RadiologyManagement";
import { PharmacyManagement } from "./pages/pharmacy/PharmacyManagement";
import { OTManagement } from "./pages/operationTheatre/OTManagement";
import { InventoryManagement } from "./pages/inventory/InventoryManagement";
import { ReportsManagement } from "./pages/reports/ReportsManagement";
import { AuditManagement } from "./pages/audit/AuditManagement";
import { ConfigurationManagement } from "./pages/configuration/ConfigurationManagement";
import { AlertsManagement } from "./pages/alerts/AlertsManagement";

/**
 * Hospital Admin module routes — registered under /hospital-admin/* in the root router.
 * Add every new Hospital Admin screen here as it's built.
 */
export const hospitaladminRoutes: RouteObject[] = [
  { path: "sign-in", element: <HospitalAdminSignIn /> },
  { path: "dashboard", element: <HospitalAdminDashboard /> },
  { path: "reception", element: <ReceptionDashboard /> },
  { path: "facilities", element: <FacilityList /> },
  { path: "staff", element: <StaffDirectory /> },
  { path: "staff/:staffId", element: <StaffDetail /> },
  { path: "patients", element: <PatientAdministration /> },
  { path: "patients/mpi-review", element: <MpiDuplicateReview /> },
  { path: "patients/mpi-review/:patientId", element: <MpiPairReview /> },
  { path: "patients/:patientId", element: <PatientDetail /> },
  { path: "beds", element: <BedManagement /> },
  { path: "appointments", element: <Appointments /> },
  { path: "billing", element: <BillingManagement /> },
  { path: "emergency", element: <EmergencyManagement /> },
  { path: "laboratory", element: <LaboratoryManagement /> },
  { path: "radiology", element: <RadiologyManagement /> },
  { path: "pharmacy", element: <PharmacyManagement /> },
  { path: "operation-theatre", element: <OTManagement /> },
  { path: "inventory", element: <InventoryManagement /> },
  { path: "reports", element: <ReportsManagement /> },
  { path: "audit", element: <AuditManagement /> },
  { path: "configuration", element: <ConfigurationManagement /> },
  { path: "alerts", element: <AlertsManagement /> },
  // ...add remaining Hospital Admin screens here as built — see HOSPITAL_ADMIN_MODULE_MAP.md
];
