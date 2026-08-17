import { ReactNode } from "react";

interface PatientLayoutProps {
  activeTab?: "Home" | "Records" | "Appointments" | "Profile";
  showTabBar?: boolean;
  children: ReactNode;
}

/**
 * Mobile-width shell for the Patient App module. Bottom tab bar shown
 * on top-level screens; detail/flow screens set showTabBar={false} and
 * render their own back-arrow header instead (see the Patient App
 * Stitch prompts — most screens use back-arrow nav, only Home/Records/
 * Appointments/Profile show the tab bar).
 */
export function PatientLayout({ activeTab, showTabBar = true, children }: PatientLayoutProps) {
  const tabs = ["Home", "Records", "Appointments", "Profile"] as const;

  return (
    <div className="min-h-screen bg-paper flex flex-col max-w-[430px] mx-auto border-x border-line">
      <div className="flex-1 overflow-auto">{children}</div>
      {showTabBar && (
        <nav className="h-[76px] bg-white border-t border-line flex items-center justify-around flex-shrink-0">
          {tabs.map((tab) => (
            <div key={tab} className="flex flex-col items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: tab === activeTab ? "var(--signal-indigo)" : "var(--line)" }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: tab === activeTab ? "var(--signal-indigo)" : "var(--ink-navy)66" }}
              >
                {tab}
              </span>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
