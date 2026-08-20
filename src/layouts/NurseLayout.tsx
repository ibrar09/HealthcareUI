import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope, LayoutGrid, Users, BedDouble, RotateCw, HeartPulse, Activity, ClipboardList,
  Pill, FileText, ClipboardCheck, CheckSquare, FlaskConical, Syringe, TestTube, AlertTriangle,
  ShieldAlert, ArrowLeftRight, LogOut, Repeat, Users2, Folder, MessageSquare, Bell, BarChart3, Settings,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface NurseLayoutProps {
  active: string;
  children: ReactNode;
}

/**
 * Same shared AppShell rail-shell every portal in this app uses — icon
 * rail + expandable panel, search/notifications/profile header. Teal
 * accent distinguishes Nursing from Doctor Portal's blue and Hospital
 * Admin's indigo. "Patient Care" deliberately routes to the same screen
 * as "My Patients" — the Bedside Workspace it leads to already is the
 * patient-care hub (vitals/meds/assessment/notes/care plans/tasks), so a
 * second, separate landing page would just duplicate it.
 */
export function NurseLayout({ active, children }: NurseLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: <LayoutGrid size={18} />, active: active === "Dashboard", onClick: () => navigate(ROUTES.NURSING.DASHBOARD) },
    { label: "My Patients", icon: <Users size={18} />, active: active === "My Patients", onClick: () => navigate(ROUTES.NURSING.PATIENTS) },
    { label: "Ward", icon: <BedDouble size={18} />, active: active === "Ward", onClick: () => navigate(ROUTES.NURSING.WARD) },
    { label: "Rounds", icon: <RotateCw size={18} />, active: active === "Rounds", onClick: () => navigate(ROUTES.NURSING.ROUNDS) },
    { label: "Patient Care", icon: <HeartPulse size={18} />, active: active === "Patient Care", onClick: () => navigate(ROUTES.NURSING.PATIENTS) },
    { label: "Vitals", icon: <Activity size={18} />, active: active === "Vitals", onClick: () => navigate(ROUTES.NURSING.VITALS) },
    { label: "Assessments", icon: <ClipboardList size={18} />, active: active === "Assessments", onClick: () => navigate(ROUTES.NURSING.ASSESSMENTS) },
    { label: "Medications", icon: <Pill size={18} />, active: active === "Medications", onClick: () => navigate(ROUTES.NURSING.MEDICATION_ADMINISTRATION) },
    { label: "Nursing Notes", icon: <FileText size={18} />, active: active === "Nursing Notes", onClick: () => navigate(ROUTES.NURSING.NURSING_NOTES) },
    { label: "Care Plans", icon: <ClipboardCheck size={18} />, active: active === "Care Plans", onClick: () => navigate(ROUTES.NURSING.CARE_PLANS) },
    { label: "Tasks", icon: <CheckSquare size={18} />, active: active === "Tasks", onClick: () => navigate(ROUTES.NURSING.TASKS) },
    { label: "Orders & Results", icon: <FlaskConical size={18} />, active: active === "Orders & Results", onClick: () => navigate(ROUTES.NURSING.ORDERS_RESULTS) },
    { label: "Procedures", icon: <Syringe size={18} />, active: active === "Procedures", onClick: () => navigate(ROUTES.NURSING.PROCEDURES) },
    { label: "Specimen Collection", icon: <TestTube size={18} />, active: active === "Specimen Collection", onClick: () => navigate(ROUTES.NURSING.SPECIMEN_COLLECTION) },
    { label: "Alerts", icon: <AlertTriangle size={18} />, active: active === "Alerts", onClick: () => navigate(ROUTES.NURSING.ALERTS) },
    { label: "Safety", icon: <ShieldAlert size={18} />, active: active === "Safety", onClick: () => navigate(ROUTES.NURSING.SAFETY) },
    { label: "Bed Management", icon: <BedDouble size={18} />, active: active === "Bed Management", onClick: () => navigate(ROUTES.NURSING.BED_MANAGEMENT) },
    { label: "Transfers", icon: <ArrowLeftRight size={18} />, active: active === "Transfers", onClick: () => navigate(ROUTES.NURSING.TRANSFERS) },
    { label: "Discharge", icon: <LogOut size={18} />, active: active === "Discharge", onClick: () => navigate(ROUTES.NURSING.DISCHARGE) },
    { label: "Shift Handover", icon: <Repeat size={18} />, active: active === "Shift Handover", onClick: () => navigate(ROUTES.NURSING.SHIFT_HANDOVER) },
    { label: "Care Team", icon: <Users2 size={18} />, active: active === "Care Team", onClick: () => navigate(ROUTES.NURSING.CARE_TEAM) },
    { label: "Documents", icon: <Folder size={18} />, active: active === "Documents", onClick: () => navigate(ROUTES.NURSING.DOCUMENTS) },
    { label: "Messages", icon: <MessageSquare size={18} />, active: active === "Messages", onClick: () => navigate(ROUTES.NURSING.MESSAGES) },
    { label: "Notifications", icon: <Bell size={18} />, active: active === "Notifications", onClick: () => navigate(ROUTES.NURSING.NOTIFICATIONS) },
    { label: "Reports", icon: <BarChart3 size={18} />, active: active === "Reports", onClick: () => navigate(ROUTES.NURSING.REPORTS) },
    { label: "Settings", icon: <Settings size={18} />, active: active === "Settings", onClick: () => navigate(ROUTES.NURSING.SETTINGS) },
  ];

  return (
    <AppShell
      brand="City General"
      accentColor="#0D9488"
      rail
      railIcon={<Stethoscope size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Nurse Fatima Khalid"}
      userRole={user?.role === "nurse" ? "Medical Ward A" : user?.role ?? "Medical Ward A"}
      notificationCount={3}
    >
      {children}
    </AppShell>
  );
}
