import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical, LayoutGrid, ClipboardList, TestTube, Microscope, ListChecks, AlertTriangle,
  BookOpen, Cpu, ShieldCheck, FileText, PackageX, Boxes, Receipt, Bell, BarChart3, FileClock, Settings,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface LaboratoryLayoutProps {
  active: string;
  children: ReactNode;
}

/** Same shared AppShell rail-shell every portal uses. Orange accent distinguishes Laboratory from Doctor (blue), Hospital Admin (indigo), Nursing (teal), Pharmacy (violet), Radiology (cyan). */
export function LaboratoryLayout({ active, children }: LaboratoryLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <LayoutGrid size={18} />, active: active === "Dashboard", onClick: () => navigate(ROUTES.LABORATORY.DASHBOARD) },
    { label: "Orders", icon: <ClipboardList size={18} />, active: active === "Orders", onClick: () => navigate(ROUTES.LABORATORY.ORDERS) },
    { label: "Specimen Collection", icon: <TestTube size={18} />, active: active === "Specimen Collection", onClick: () => navigate(ROUTES.LABORATORY.COLLECTION) },
    { label: "Processing & Aliquots", icon: <Microscope size={18} />, active: active === "Processing & Aliquots", onClick: () => navigate(ROUTES.LABORATORY.PROCESSING) },
    { label: "Worklists", icon: <ListChecks size={18} />, active: active === "Worklists", onClick: () => navigate(ROUTES.LABORATORY.WORKLISTS) },
    { label: "Critical Results", icon: <AlertTriangle size={18} />, active: active === "Critical Results", onClick: () => navigate(ROUTES.LABORATORY.CRITICAL_RESULTS) },
    { label: "Test Catalog", icon: <BookOpen size={18} />, active: active === "Test Catalog", onClick: () => navigate(ROUTES.LABORATORY.TEST_CATALOG) },
    { label: "Analyzers", icon: <Cpu size={18} />, active: active === "Analyzers", onClick: () => navigate(ROUTES.LABORATORY.ANALYZERS) },
    { label: "Quality Control", icon: <ShieldCheck size={18} />, active: active === "Quality Control", onClick: () => navigate(ROUTES.LABORATORY.QUALITY_CONTROL) },
    { label: "Reports", icon: <FileText size={18} />, active: active === "Reports", onClick: () => navigate(ROUTES.LABORATORY.REPORTS) },
    { label: "Rejected & Recollection", icon: <PackageX size={18} />, active: active === "Rejected & Recollection", onClick: () => navigate(ROUTES.LABORATORY.REJECTED) },
    { label: "Inventory", icon: <Boxes size={18} />, active: active === "Inventory", onClick: () => navigate(ROUTES.LABORATORY.INVENTORY) },
    { label: "Billing", icon: <Receipt size={18} />, active: active === "Billing", onClick: () => navigate(ROUTES.LABORATORY.BILLING) },
    { label: "Notifications", icon: <Bell size={18} />, active: active === "Notifications", onClick: () => navigate(ROUTES.LABORATORY.NOTIFICATIONS) },
    { label: "Analytics", icon: <BarChart3 size={18} />, active: active === "Analytics", onClick: () => navigate(ROUTES.LABORATORY.ANALYTICS) },
    { label: "Audit", icon: <FileClock size={18} />, active: active === "Audit", onClick: () => navigate(ROUTES.LABORATORY.AUDIT) },
    { label: "Configuration", icon: <Settings size={18} />, active: active === "Configuration", onClick: () => navigate(ROUTES.LABORATORY.CONFIGURATION) },
  ];

  return (
    <AppShell
      brand="City General"
      accentColor="#EA580C"
      rail
      railIcon={<FlaskConical size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Sr. MLS Fatima Zahra"}
      userRole={user?.role === "lab_technician" ? "Main Laboratory" : user?.role ?? "Main Laboratory"}
      notificationCount={4}
    >
      {children}
    </AppShell>
  );
}
