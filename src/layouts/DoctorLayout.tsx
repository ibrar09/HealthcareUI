import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, CalendarDays, MessageSquare, Users, Clock, CreditCard, Package,
  HelpCircle, Settings, FileText, Search, Bell, Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

interface DoctorLayoutProps {
  active: string; // which nav item is active, e.g. "Overview"
  children: ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutGrid;
  route?: string;
  badge?: boolean;
}

const mainMenus: NavItem[] = [
  { id: "Overview", label: "Overview", icon: LayoutGrid, route: ROUTES.DOCTOR.DASHBOARD },
  { id: "Appointments", label: "Appointments", icon: CalendarDays },
  { id: "Messages", label: "Messages", icon: MessageSquare, badge: true },
  { id: "Patients", label: "Patients", icon: Users },
];

const otherMenus: NavItem[] = [
  { id: "Schedules", label: "Schedules", icon: Clock },
  { id: "Payment", label: "Payment", icon: CreditCard },
  { id: "Product", label: "Product & Stock", icon: Package },
];

const helpMenus: NavItem[] = [
  { id: "Help", label: "Help Center", icon: HelpCircle },
  { id: "Settings", label: "Settings", icon: Settings },
  { id: "Report", label: "Report", icon: FileText },
];

function NavButton({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: (route?: string) => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.route)}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
        active ? "bg-[#2E3750] text-white shadow-sm font-semibold" : "text-slate-400 hover:text-slate-200 hover:bg-[#252E45]"
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-slate-400"}`} />
        <span>{item.label}</span>
      </div>
      {item.badge && <span className="w-2 h-2 rounded-full bg-rose-500" />}
    </button>
  );
}

/**
 * Bespoke Doctor Portal shell — deliberately NOT built on the shared
 * AppShell. The nav here (three grouped sections + a bottom-fixed user
 * card + a dark navy palette) is structurally different from AppShell's
 * flat-list/one-level-expandable nav, not just a color swap, so forcing
 * it through AppShell's props would mean growing a shared component for
 * a pattern only this one portal uses. Per README's shared-vs-module-local
 * rule: this stays local until a second portal genuinely wants the same
 * grouped-sidebar pattern — that's when it's worth promoting.
 *
 * Only "Overview" has a real page right now — every other nav item is
 * visually present but not yet wired to a route, same as every other
 * portal's nav during its own early build-out this session.
 */
export function DoctorLayout({ active, children }: DoctorLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleNavigate(route?: string) {
    if (route) navigate(route);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1E2538] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 overflow-y-auto">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              M+
            </div>
            <div>
              <h1 className="text-white font-bold text-base tracking-wide">City General</h1>
              <p className="text-xs text-slate-400">Doctor Portal</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
            <nav className="space-y-1">
              {mainMenus.map((item) => (
                <NavButton key={item.id} item={item} active={active === item.id} onNavigate={handleNavigate} />
              ))}
            </nav>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Other Menu</p>
            <nav className="space-y-1">
              {otherMenus.map((item) => (
                <NavButton key={item.id} item={item} active={active === item.id} onNavigate={handleNavigate} />
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Help & Settings</p>
            <nav className="space-y-1">
              {helpMenus.map((item) => (
                <NavButton key={item.id} item={item} active={active === item.id} onNavigate={handleNavigate} />
              ))}
            </nav>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="p-4 border-t border-slate-800/80 bg-[#191F30] flex items-center space-x-3 text-left hover:bg-[#20263a] transition-colors"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-blue-300 text-xs font-bold border border-slate-600 flex-shrink-0">
            {(user?.name ?? "Dr. Ayesha Raza")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Dr. Ayesha Raza"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.role === "doctor" ? "Cardiology" : user?.role ?? "Cardiology"}</p>
          </div>
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between px-4 lg:px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients, appointments, reports..."
                className="pl-9 pr-4 py-2 w-64 lg:w-80 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button type="button" className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center space-x-2.5 pl-1">
              <span className="text-xs font-medium text-slate-600 hidden sm:inline-block">Today, Aug 18, 2026</span>
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-600 rounded-full border border-blue-100">On Duty</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
