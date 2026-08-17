import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  LayoutGrid,
  Building2,
  Badge,
  UserRound,
  BedDouble,
  CalendarDays,
  Receipt,
  Boxes,
  BarChart3,
  Siren,
  FlaskConical,
  Scan,
  Pill,
  Scissors,
  ShieldCheck,
  Settings,
  Bell,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface HospitalAdminLayoutProps {
  active: string;
  children: ReactNode;
}

export function HospitalAdminLayout({ active, children }: HospitalAdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutGrid size={18} />,
      children: [
        { label: "Admin Dashboard", active: active === "Admin Dashboard", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.DASHBOARD) },
        { label: "Reception Dashboard", active: active === "Reception Dashboard", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.RECEPTION) },
      ],
    },
    {
      label: "Facilities",
      icon: <Building2 size={18} />,
      active: active === "Facilities",
      onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.FACILITIES),
    },
    {
      label: "Staff",
      icon: <Badge size={18} />,
      active: active === "Staff",
      onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.STAFF),
    },
    {
      label: "Patients",
      icon: <UserRound size={18} />,
      active: active === "Patients",
      onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.PATIENTS),
    },
    { label: "Beds", icon: <BedDouble size={18} />, active: active === "Beds", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.BEDS) },
    { label: "Appointments", icon: <CalendarDays size={18} />, active: active === "Appointments", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.APPOINTMENTS) },
    { label: "Emergency", icon: <Siren size={18} />, active: active === "Emergency", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.EMERGENCY) },
    { label: "Laboratory", icon: <FlaskConical size={18} />, active: active === "Laboratory", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.LABORATORY) },
    { label: "Radiology", icon: <Scan size={18} />, active: active === "Radiology", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.RADIOLOGY) },
    { label: "Pharmacy", icon: <Pill size={18} />, active: active === "Pharmacy", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.PHARMACY) },
    { label: "Operation Theatre", icon: <Scissors size={18} />, active: active === "Operation Theatre", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.OPERATION_THEATRE) },
    { label: "Billing", icon: <Receipt size={18} />, active: active === "Billing", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.BILLING) },
    { label: "Inventory", icon: <Boxes size={18} />, active: active === "Inventory", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.INVENTORY) },
    { label: "Reports", icon: <BarChart3 size={18} />, active: active === "Reports", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.REPORTS) },
    { label: "Audit", icon: <ShieldCheck size={18} />, active: active === "Audit", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.AUDIT) },
    { label: "Configuration", icon: <Settings size={18} />, active: active === "Configuration", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.CONFIGURATION) },
    { label: "Alerts", icon: <Bell size={18} />, active: active === "Alerts", onClick: () => navigate(ROUTES.HOSPITAL_ADMIN.ALERTS) },
  ];

  return (
    <AppShell
      brand="HospTal"
      accentColor="var(--signal-indigo)"
      rail
      railIcon={<HeartPulse size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Zainab Qureshi"}
      userRole={user?.role ?? "Hospital Administrator"}
      notificationCount={2}
    >
      {children}
    </AppShell>
  );
}
