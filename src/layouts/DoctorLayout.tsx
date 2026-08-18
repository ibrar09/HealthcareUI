import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope, LayoutGrid, CalendarDays, MessageSquare, Users, Clock,
  CreditCard, Package, HelpCircle, Settings, FileText,
} from "lucide-react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import * as api from "@modules/doctor-portal/api";

interface DoctorLayoutProps {
  active: string; // which nav item is active, e.g. "Overview"
  children: ReactNode;
}

/**
 * Same shared AppShell rail-shell Hospital Admin uses — icon rail +
 * expandable panel, search/notifications/profile header, decorative
 * background. Only the accent color (blue, matching the dashboard
 * content's own blue-600) and nav content differ between the two
 * portals, per AppShell's own "only accentColor/nav content change"
 * design intent. Only "Overview" has a real page right now — the rest
 * are visually present but not yet wired to a route, same as every
 * other portal's nav during its own early build-out this session.
 */
export function DoctorLayout({ active, children }: DoctorLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    api.getUnreadCount().then(setUnreadMessages);
  }, [active]);

  const navItems = [
    { label: "Overview", icon: <LayoutGrid size={18} />, active: active === "Overview", onClick: () => navigate(ROUTES.DOCTOR.DASHBOARD) },
    { label: "Appointments", icon: <CalendarDays size={18} />, active: active === "Appointments", onClick: () => navigate(ROUTES.DOCTOR.APPOINTMENTS) },
    { label: "Messages", icon: <MessageSquare size={18} />, active: active === "Messages", badge: unreadMessages || undefined, onClick: () => navigate(ROUTES.DOCTOR.MESSAGES) },
    { label: "Patients", icon: <Users size={18} />, active: active === "Patients", onClick: () => navigate(ROUTES.DOCTOR.PATIENTS) },
    { label: "Schedules", icon: <Clock size={18} />, active: active === "Schedules", onClick: () => navigate(ROUTES.DOCTOR.SCHEDULE) },
    { label: "Payment", icon: <CreditCard size={18} />, active: active === "Payment", onClick: () => navigate(ROUTES.DOCTOR.PAYMENT) },
    { label: "Product & Stock", icon: <Package size={18} />, active: active === "Product & Stock", onClick: () => navigate(ROUTES.DOCTOR.PRODUCT_STOCK) },
    { label: "Help Center", icon: <HelpCircle size={18} />, active: active === "Help Center" },
    { label: "Settings", icon: <Settings size={18} />, active: active === "Settings" },
    { label: "Report", icon: <FileText size={18} />, active: active === "Report" },
  ];

  return (
    <AppShell
      brand="City General"
      accentColor="#2563EB"
      rail
      railIcon={<Stethoscope size={22} />}
      navItems={navItems}
      userName={user?.name ?? "Dr. Ayesha Raza"}
      userRole={user?.role === "doctor" ? "Cardiology" : user?.role ?? "Cardiology"}
      notificationCount={3}
    >
      {children}
    </AppShell>
  );
}
