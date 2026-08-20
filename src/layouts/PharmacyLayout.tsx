import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill, LayoutGrid, ClipboardList, PackageCheck, FlaskConical, Users, ClipboardCheck,
  Stethoscope, AlertTriangle, BookOpen, Boxes, Lock, PackageX, Truck, Bell, BarChart3, FileClock, Settings,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface PharmacyLayoutProps {
  active: string;
  children: ReactNode;
}

/** Same shared AppShell rail-shell every portal uses. Violet accent distinguishes Pharmacy from Doctor (blue), Hospital Admin (indigo), Nursing (teal). */
export function PharmacyLayout({ active, children }: PharmacyLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <LayoutGrid size={18} />, active: active === "Dashboard", onClick: () => navigate(ROUTES.PHARMACY.DASHBOARD) },
    { label: "Prescription Queue", icon: <ClipboardList size={18} />, active: active === "Prescription Queue", onClick: () => navigate(ROUTES.PHARMACY.PRESCRIPTION_QUEUE) },
    { label: "Dispensing", icon: <PackageCheck size={18} />, active: active === "Dispensing", onClick: () => navigate(ROUTES.PHARMACY.DISPENSING) },
    { label: "IV / Compounding", icon: <FlaskConical size={18} />, active: active === "IV / Compounding", onClick: () => navigate(ROUTES.PHARMACY.IV_COMPOUNDING) },
    { label: "Patient Medication 360", icon: <Users size={18} />, active: active === "Patient Medication 360", onClick: () => navigate(ROUTES.PHARMACY.PATIENT_360) },
    { label: "Medication Reconciliation", icon: <ClipboardCheck size={18} />, active: active === "Medication Reconciliation", onClick: () => navigate(ROUTES.PHARMACY.RECONCILIATION) },
    { label: "Clinical Interventions", icon: <Stethoscope size={18} />, active: active === "Clinical Interventions", onClick: () => navigate(ROUTES.PHARMACY.INTERVENTIONS) },
    { label: "Adverse Drug Reactions", icon: <AlertTriangle size={18} />, active: active === "Adverse Drug Reactions", onClick: () => navigate(ROUTES.PHARMACY.ADVERSE_REACTIONS) },
    { label: "Formulary", icon: <BookOpen size={18} />, active: active === "Formulary", onClick: () => navigate(ROUTES.PHARMACY.FORMULARY) },
    { label: "Inventory", icon: <Boxes size={18} />, active: active === "Inventory", onClick: () => navigate(ROUTES.PHARMACY.INVENTORY) },
    { label: "Controlled Medications", icon: <Lock size={18} />, active: active === "Controlled Medications", onClick: () => navigate(ROUTES.PHARMACY.CONTROLLED_MEDICATIONS) },
    { label: "Medication Recall", icon: <PackageX size={18} />, active: active === "Medication Recall", onClick: () => navigate(ROUTES.PHARMACY.RECALLS) },
    { label: "Procurement", icon: <Truck size={18} />, active: active === "Procurement", onClick: () => navigate(ROUTES.PHARMACY.PROCUREMENT) },
    { label: "Alerts", icon: <Bell size={18} />, active: active === "Alerts", onClick: () => navigate(ROUTES.PHARMACY.ALERTS) },
    { label: "Reports", icon: <BarChart3 size={18} />, active: active === "Reports", onClick: () => navigate(ROUTES.PHARMACY.REPORTS) },
    { label: "Audit", icon: <FileClock size={18} />, active: active === "Audit", onClick: () => navigate(ROUTES.PHARMACY.AUDIT) },
    { label: "Configuration", icon: <Settings size={18} />, active: active === "Configuration", onClick: () => navigate(ROUTES.PHARMACY.CONFIGURATION) },
  ];

  return (
    <AppShell
      brand="City General"
      accentColor="#7C3AED"
      rail
      railIcon={<Pill size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Pharm. Zainab Hussain"}
      userRole={user?.role === "pharmacist" ? "Main Pharmacy" : user?.role ?? "Main Pharmacy"}
      notificationCount={4}
    >
      {children}
    </AppShell>
  );
}
