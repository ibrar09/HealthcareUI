import { ReactNode } from "react";
import { AppShell } from "@shared/design-system/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";

interface DoctorLayoutProps {
  active: string; // which nav item is active, e.g. "Dashboard"
  children: ReactNode;
}

/**
 * Pins Doctor Portal's AppShell config (accent color, nav items) in
 * one place so every Doctor Portal page just does:
 *
 *   <DoctorLayout active="Dashboard">...</DoctorLayout>
 *
 * instead of repeating navItems/accentColor/userName on every page.
 */
export function DoctorLayout({ active, children }: DoctorLayoutProps) {
  const { user } = useAuth();

  return (
    <AppShell
      brand="City General Hospital"
      accentColor="var(--signal-indigo)"
      navItems={["Dashboard", "Patients", "Appointments", "Orders", "Reports"].map((label) => ({
        label,
        active: label === active,
      }))}
      userName={user?.name ?? "Dr. Ayesha Raza"}
      userRole={user?.role ?? "Cardiology"}
    >
      {children}
    </AppShell>
  );
}
