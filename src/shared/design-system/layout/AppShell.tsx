import { CSSProperties, ReactNode, useState } from "react";
import clsx from "clsx";
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Search, Settings } from "lucide-react";

interface NavChildItem {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface NavItem {
  label: string;
  active?: boolean;
  icon?: ReactNode;
  href?: string;
  badge?: string | number;
  children?: NavChildItem[];
  onClick?: () => void;
}

interface AppShellProps {
  brand: string;
  brandSub?: string;
  accentColor: string;
  navItems: NavItem[];
  userName: string;
  userRole: string;
  sidebar?: boolean;
  dark?: boolean;
  /** Opt into the two-tier icon-rail + expandable panel sidebar, with a search/notifications header. */
  rail?: boolean;
  railIcon?: ReactNode;
  onSearchChange?: (value: string) => void;
  notificationCount?: number;
  children: ReactNode;
}

/**
 * The shared shell every staff-facing module builds on top of.
 * Only `accentColor`, `dark`/`sidebar`/`rail`, and the nav content change between
 * modules — this is what keeps every portal feeling like one product family.
 * DO NOT fork this component per-module — extend its props instead,
 * and raise it in a shared/ PR if a module needs a genuinely new layout capability.
 */
export function AppShell(props: AppShellProps) {
  return props.rail ? <RailShell {...props} /> : <ClassicShell {...props} />;
}

function ClassicShell({
  brand,
  brandSub,
  accentColor,
  navItems,
  userName,
  userRole,
  sidebar = false,
  dark = false,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper flex flex-col relative isolate">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07]"
        style={{ backgroundImage: `radial-gradient(700px circle at 100% 0%, ${accentColor}, transparent 60%)` }}
      />
      <header className="h-16 bg-white border-b border-line flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-xl"
            style={{
              backgroundImage: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 67%, transparent))`,
              boxShadow: `0 4px 12px -3px color-mix(in srgb, ${accentColor} 50%, transparent)`,
            }}
          />
          <div>
            <div className="font-display font-bold text-[15px] text-ink-navy leading-tight">{brand}</div>
            {brandSub && <div className="text-[11px] text-ink-navy/45 leading-tight">{brandSub}</div>}
          </div>
          {!sidebar && (
            <nav className="ml-8 flex items-center gap-6">
              {navItems.map((item) => (
                <span
                  key={item.label}
                  className="text-sm font-body cursor-pointer pb-1"
                  style={
                    item.active
                      ? { color: "var(--ink-navy)", borderBottom: `2px solid var(--pulse-coral)` }
                      : { color: "var(--ink-navy)", opacity: 0.5 }
                  }
                >
                  {item.label}
                </span>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 20%, white)` }} />
          <div className="leading-tight">
            <div className="text-[13px] font-display font-semibold text-ink-navy">{userName}</div>
            <div className="text-[11px] text-ink-navy/45">{userRole}</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {sidebar && (
          <aside
            className="w-[220px] flex-shrink-0 py-6 px-3"
            style={{
              backgroundColor: dark ? "var(--ink-navy)" : "var(--paper)",
              borderRight: dark ? "none" : "1px solid var(--line)",
            }}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={clsx(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-body cursor-pointer transition-all duration-150 text-left",
                    item.active
                      ? "text-white font-semibold shadow-[0_8px_18px_-6px_var(--nav-glow)]"
                      : dark
                      ? "hover:bg-white/5"
                      : "hover:bg-surface-container-low"
                  )}
                  style={
                    item.active
                      ? ({
                          backgroundImage: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 80%, transparent))`,
                          "--nav-glow": `color-mix(in srgb, ${accentColor} 44%, transparent)`,
                        } as CSSProperties)
                      : { color: dark ? "#FFFFFF99" : "var(--on-surface-variant)" }
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        )}
        <main className="flex-1 overflow-auto px-8 py-7">{children}</main>
      </div>
    </div>
  );
}

/** Two-tier sidebar: a dark icon rail plus an expandable white panel with grouped nav. */
function RailShell({
  brand,
  accentColor,
  navItems,
  userName,
  userRole,
  railIcon,
  onSearchChange,
  notificationCount = 0,
  children,
}: AppShellProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navItems.map((item) => [item.label, item.children?.some((c) => c.active) ?? false]))
  );
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden flex relative bg-paper">
      <aside
        className="w-16 flex flex-col items-center py-5 shadow-xl z-30 flex-shrink-0"
        style={{ backgroundColor: "var(--ink-navy)" }}
      >
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center mb-8 shadow-lg" style={{ color: accentColor }}>
          {railIcon}
        </div>
        <nav className="flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              <button
                type="button"
                onClick={item.onClick ?? (item.children ? () => setOpenGroups((s) => ({ ...s, [item.label]: true })) : undefined)}
                className={clsx(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                  item.active || item.children?.some((c) => c.active)
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                {item.icon}
              </button>
              <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--on-surface)] px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-50">
                {item.label}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <aside
        className={clsx(
          "bg-white border-r border-line flex flex-col h-full flex-shrink-0 z-20 shadow-soft overflow-hidden transition-[width] duration-200 ease-in-out",
          panelOpen ? "w-64" : "w-0"
        )}
      >
        <div className="h-20 flex items-center px-6 flex-shrink-0 w-64">
          <span className="text-xl font-display font-bold text-on-surface tracking-tight">{brand}</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-3 w-64">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="mb-1">
                <button
                  type="button"
                  onClick={() => setOpenGroups((s) => ({ ...s, [item.label]: !s[item.label] }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-on-surface text-sm font-medium rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span style={{ color: accentColor }}>{item.icon}</span>
                    {item.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={clsx("text-on-surface-variant transition-transform", openGroups[item.label] && "rotate-180")}
                  />
                </button>
                {openGroups[item.label] && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-line space-y-1">
                    {item.children.map((child) => (
                      <div key={child.label} className="relative">
                        {child.active && (
                          <div
                            className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                            style={{ backgroundColor: accentColor }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={child.onClick}
                          className={clsx(
                            "w-full text-left block px-3 py-2 text-sm rounded-lg transition-colors",
                            child.active
                              ? "font-semibold border"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent"
                          )}
                          style={
                            child.active
                              ? {
                                  color: accentColor,
                                  backgroundColor: "var(--signal-indigo-tint)",
                                  borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                                }
                              : undefined
                          }
                        >
                          {child.label}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={item.label}
                type="button"
                title={item.label}
                onClick={item.onClick}
                className={clsx(
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors mt-1",
                  item.active
                    ? "font-semibold"
                    : "font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
                style={item.active ? { backgroundColor: "var(--signal-indigo-tint)", color: accentColor } : undefined}
              >
                <span className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined ? (
                  <span className="bg-surface-container-low text-on-surface-variant text-xs py-0.5 px-2 rounded-full flex-shrink-0">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight size={12} className={clsx("flex-shrink-0", !item.active && "text-outline-variant")} style={item.active ? { color: accentColor } : undefined} />
                )}
              </button>
            )
          )}
        </nav>
      </aside>

      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={panelOpen ? "Collapse sidebar" : "Expand sidebar"}
        title={panelOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute top-8 z-30 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-line shadow-soft text-on-surface-variant hover:text-signal-indigo transition-all duration-200 ease-in-out"
        style={{ left: panelOpen ? "19.25rem" : "3.25rem" }}
      >
        {panelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <main className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
        <header className="h-20 flex items-center justify-between px-8 border-b border-line bg-white/70 backdrop-blur-md z-20 flex-shrink-0">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search here..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:ring-2 transition-all shadow-sm"
              style={{ "--tw-ring-color": `color-mix(in srgb, ${accentColor} 20%, transparent)` } as CSSProperties}
            />
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Notifications">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: "var(--pulse-coral)" }}
                />
              )}
            </button>
            <button type="button" className="p-2 text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Settings">
              <Settings size={20} />
            </button>
            <button
              type="button"
              className="ml-2 flex items-center gap-2 text-white pl-1.5 pr-4 py-1.5 rounded-full transition-all shadow-md"
              style={{ backgroundImage: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, black))` }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {userName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown size={12} className="opacity-80" />
            </button>
          </div>
        </header>
        <div
          className="flex-1 overflow-y-auto p-8"
          style={{
            backgroundColor: "var(--paper)",
            backgroundAttachment: "fixed",
            backgroundImage: [
              "radial-gradient(900px circle at 10% -10%, color-mix(in srgb, var(--signal-indigo) 12%, transparent), transparent 55%)",
              "radial-gradient(700px circle at 100% 0%, color-mix(in srgb, var(--sunset-coral) 11%, transparent), transparent 50%)",
              "radial-gradient(800px circle at 45% 110%, color-mix(in srgb, var(--vital-green) 9%, transparent), transparent 55%)",
              "radial-gradient(650px circle at 100% 65%, color-mix(in srgb, var(--caution-amber) 7%, transparent), transparent 50%)",
            ].join(", "),
          }}
        >
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </div>
      </main>
      <span className="sr-only">{userRole}</span>
    </div>
  );
}
