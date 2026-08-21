import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Radiation, LayoutGrid, ClipboardList, Users, UserCheck, AlertTriangle, Eye, Share2,
  BookOpen, Cpu, Receipt, BarChart3, Bell, FileClock, Settings,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface RadiologyLayoutProps {
  active: string;
  children: ReactNode;
}

/** Same shared AppShell rail-shell every portal uses. Cyan accent distinguishes Radiology from Doctor (blue), Hospital Admin (indigo), Nursing (teal), Pharmacy (violet). */
export function RadiologyLayout({ active, children }: RadiologyLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <LayoutGrid size={18} />, active: active === "Dashboard", onClick: () => navigate(ROUTES.RADIOLOGY.DASHBOARD) },
    { label: "Orders", icon: <ClipboardList size={18} />, active: active === "Orders", onClick: () => navigate(ROUTES.RADIOLOGY.ORDERS) },
    { label: "Technician Worklist", icon: <Users size={18} />, active: active === "Technician Worklist", onClick: () => navigate(ROUTES.RADIOLOGY.TECHNICIAN_WORKLIST) },
    { label: "Radiologist Worklist", icon: <UserCheck size={18} />, active: active === "Radiologist Worklist", onClick: () => navigate(ROUTES.RADIOLOGY.RADIOLOGIST_WORKLIST) },
    { label: "Critical Findings", icon: <AlertTriangle size={18} />, active: active === "Critical Findings", onClick: () => navigate(ROUTES.RADIOLOGY.CRITICAL_FINDINGS) },
    { label: "Peer Review", icon: <Eye size={18} />, active: active === "Peer Review", onClick: () => navigate(ROUTES.RADIOLOGY.PEER_REVIEW) },
    { label: "Referrals", icon: <Share2 size={18} />, active: active === "Referrals", onClick: () => navigate(ROUTES.RADIOLOGY.REFERRALS) },
    { label: "Procedures", icon: <BookOpen size={18} />, active: active === "Procedures", onClick: () => navigate(ROUTES.RADIOLOGY.PROCEDURES) },
    { label: "Equipment", icon: <Cpu size={18} />, active: active === "Equipment", onClick: () => navigate(ROUTES.RADIOLOGY.EQUIPMENT) },
    { label: "Billing", icon: <Receipt size={18} />, active: active === "Billing", onClick: () => navigate(ROUTES.RADIOLOGY.BILLING) },
    { label: "Reports & Analytics", icon: <BarChart3 size={18} />, active: active === "Reports & Analytics", onClick: () => navigate(ROUTES.RADIOLOGY.REPORTS_ANALYTICS) },
    { label: "Notifications", icon: <Bell size={18} />, active: active === "Notifications", onClick: () => navigate(ROUTES.RADIOLOGY.NOTIFICATIONS) },
    { label: "Audit", icon: <FileClock size={18} />, active: active === "Audit", onClick: () => navigate(ROUTES.RADIOLOGY.AUDIT) },
    { label: "Configuration", icon: <Settings size={18} />, active: active === "Configuration", onClick: () => navigate(ROUTES.RADIOLOGY.CONFIGURATION) },
  ];

  return (
    <AppShell
      brand="City General"
      accentColor="#0891B2"
      rail
      railIcon={<Radiation size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Dr. Radiologist Iqra Sheikh"}
      userRole={user?.role === "radiologist" ? "Radiology Department" : user?.role ?? "Radiology Department"}
      notificationCount={3}
    >
      {children}
    </AppShell>
  );
}
