import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Siren, LayoutGrid, ClipboardList, Stethoscope, Users, BedDouble, UserCog, HeartPulse,
  FlaskConical, Syringe, Activity, AlertTriangle, Share2, LogOut, Truck, Repeat, BarChart3, FileClock, Settings,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface EmergencyLayoutProps {
  active: string;
  children: ReactNode;
}

/** Same shared AppShell rail-shell every portal uses. Red accent distinguishes Emergency from Doctor (blue), Hospital Admin (indigo), Nursing (teal), Pharmacy (violet), Radiology (cyan), Laboratory (orange). */
export function EmergencyLayout({ active, children }: EmergencyLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <LayoutGrid size={18} />, active: active === "Dashboard", onClick: () => navigate(ROUTES.EMERGENCY.DASHBOARD) },
    { label: "Arrivals & Registration", icon: <ClipboardList size={18} />, active: active === "Arrivals & Registration", onClick: () => navigate(ROUTES.EMERGENCY.ARRIVALS) },
    { label: "Triage", icon: <Stethoscope size={18} />, active: active === "Triage", onClick: () => navigate(ROUTES.EMERGENCY.TRIAGE) },
    { label: "Queue & Waiting Room", icon: <Users size={18} />, active: active === "Queue & Waiting Room", onClick: () => navigate(ROUTES.EMERGENCY.QUEUE) },
    { label: "Bed Management", icon: <BedDouble size={18} />, active: active === "Bed Management", onClick: () => navigate(ROUTES.EMERGENCY.BEDS) },
    { label: "Doctor Workspace", icon: <UserCog size={18} />, active: active === "Doctor Workspace", onClick: () => navigate(ROUTES.EMERGENCY.DOCTOR_WORKSPACE) },
    { label: "Nursing Workspace", icon: <HeartPulse size={18} />, active: active === "Nursing Workspace", onClick: () => navigate(ROUTES.EMERGENCY.NURSING_WORKSPACE) },
    { label: "Orders & Results", icon: <FlaskConical size={18} />, active: active === "Orders & Results", onClick: () => navigate(ROUTES.EMERGENCY.ORDERS) },
    { label: "Procedures", icon: <Syringe size={18} />, active: active === "Procedures", onClick: () => navigate(ROUTES.EMERGENCY.PROCEDURES) },
    { label: "Monitoring", icon: <Activity size={18} />, active: active === "Monitoring", onClick: () => navigate(ROUTES.EMERGENCY.MONITORING) },
    { label: "Critical Results", icon: <AlertTriangle size={18} />, active: active === "Critical Results", onClick: () => navigate(ROUTES.EMERGENCY.CRITICAL_RESULTS) },
    { label: "Consultations", icon: <Share2 size={18} />, active: active === "Consultations", onClick: () => navigate(ROUTES.EMERGENCY.CONSULTATIONS) },
    { label: "Disposition", icon: <LogOut size={18} />, active: active === "Disposition", onClick: () => navigate(ROUTES.EMERGENCY.DISPOSITION) },
    { label: "Ambulance", icon: <Truck size={18} />, active: active === "Ambulance", onClick: () => navigate(ROUTES.EMERGENCY.AMBULANCE) },
    { label: "Handover", icon: <Repeat size={18} />, active: active === "Handover", onClick: () => navigate(ROUTES.EMERGENCY.HANDOVER) },
    { label: "Reports & Analytics", icon: <BarChart3 size={18} />, active: active === "Reports & Analytics", onClick: () => navigate(ROUTES.EMERGENCY.REPORTS) },
    { label: "Audit", icon: <FileClock size={18} />, active: active === "Audit", onClick: () => navigate(ROUTES.EMERGENCY.AUDIT) },
    { label: "Configuration", icon: <Settings size={18} />, active: active === "Configuration", onClick: () => navigate(ROUTES.EMERGENCY.CONFIGURATION) },
  ];

  return (
    <AppShell
      brand="City General"
      accentColor="#DC2626"
      rail
      railIcon={<Siren size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Dr. Sana Riaz"}
      userRole={user?.role === "doctor" ? "Emergency Department" : user?.role ?? "Emergency Department"}
      notificationCount={5}
    >
      {children}
    </AppShell>
  );
}
