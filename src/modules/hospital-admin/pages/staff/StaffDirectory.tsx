import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarCheck, Download, Moon, Plus, Search, Umbrella } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { Card, KPICard, StatusTone } from "@shared/design-system/components";
import { StaffFormDrawer, StaffFormValues, roleMeta } from "@modules/hospital-admin/components/staff/StaffFormDrawer";
import { StaffRow } from "@modules/hospital-admin/components/staff/StaffRow";
import { RosterGrid } from "@modules/hospital-admin/components/staff/RosterGrid";
import { AssignShiftDrawer, ShiftFormValues } from "@modules/hospital-admin/components/staff/AssignShiftDrawer";
import * as api from "@modules/hospital-admin/api";
import type { StaffRosterRow } from "@modules/hospital-admin/api";

type Staff = Awaited<ReturnType<typeof api.getStaffMembers>>[number];
type RoleFilter = "all" | Staff["role"];
type Tab = "directory" | "roster";

const statusTone: Record<Staff["status"], StatusTone> = {
  active: "success",
  "on-leave": "warning",
  inactive: "neutral",
};

const statusLabel: Record<Staff["status"], string> = {
  active: "Active",
  "on-leave": "On Leave",
  inactive: "Inactive",
};

const roleFilters: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "doctor", label: "Doctors" },
  { value: "nurse", label: "Nurses" },
  { value: "technician", label: "Technicians" },
  { value: "admin", label: "Admin" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Matches the fixed "today" (Aug 14, 2026) shown elsewhere in this module, e.g. the Hospital Overview date. */
const TODAY_LABEL = new Date(2026, 7, 14).toLocaleDateString("en-US", { weekday: "short" });

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function downloadCsv(staff: Staff[], roster: StaffRosterRow[]) {
  const header = ["Staff Member", ...weekDays];
  const rows = staff.map((s) => {
    const row = roster.find((r) => r.staffId === s.id);
    const cells = weekDays.map((d) => {
      const shift = row?.shifts.find((sh) => sh.day === d);
      if (!shift || shift.type === "gap") return "Unassigned";
      if (shift.type === "leave") return "On Leave";
      return `${shift.type === "night" ? "Night Shift" : shift.time}`;
    });
    return [s.name, ...cells];
  });
  const csv = [header, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "roster-aug-10-16-2026.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function StaffDirectory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("directory");

  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [roster, setRoster] = useState<StaffRosterRow[]>([]);
  const [shiftDrawerOpen, setShiftDrawerOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftFormValues | undefined>(undefined);

  const [departmentNames, setDepartmentNames] = useState<string[]>([]);

  useEffect(() => {
    api.getStaffMembers().then(setStaff);
    api.getRosterWeek().then(setRoster);
    api.getDepartmentConfigs().then((depts) => setDepartmentNames(depts.map((d) => d.name)));
  }, []);

  function openAdd() {
    setEditingIndex(null);
    setDrawerOpen(true);
  }

  function openManage(index: number) {
    setEditingIndex(index);
    setDrawerOpen(true);
  }

  function handleSubmit(values: StaffFormValues) {
    if (editingIndex !== null) {
      setStaff((prev) => prev.map((s, i) => (i === editingIndex ? { ...s, ...values, id: s.id } : s)));
    } else {
      const id = values.name.toLowerCase().replace(/^dr\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setStaff((prev) => [...prev, { ...values, id }]);
    }
  }

  function openAssignShift(staffId?: string, day?: string) {
    if (staffId && day) {
      const existing = roster.find((r) => r.staffId === staffId)?.shifts.find((s) => s.day === day);
      setEditingShift({ staffId, day, type: existing?.type ?? "standard", time: existing?.time ?? "9 AM–5 PM" });
    } else {
      setEditingShift(undefined);
    }
    setShiftDrawerOpen(true);
  }

  function handleShiftSubmit(values: ShiftFormValues) {
    setRoster((prev) => {
      const existingRow = prev.find((r) => r.staffId === values.staffId);
      const newCell = { day: values.day, type: values.type, time: values.time };
      if (!existingRow) {
        return [...prev, { staffId: values.staffId, shifts: [newCell] }];
      }
      return prev.map((r) =>
        r.staffId === values.staffId
          ? { ...r, shifts: [...r.shifts.filter((s) => s.day !== values.day), newCell] }
          : r
      );
    });
  }

  const editingStaff = editingIndex !== null ? staff[editingIndex] : undefined;

  const filteredStaff = staff.filter((s) => {
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.specialty.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <HospitalAdminLayout active="Staff">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Staff Directory</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage doctors, nurses, technicians, and admin staff.{" "}
            <span className="text-vital-green font-semibold">
              {staff.filter((s) => s.schedule.includes(TODAY_LABEL)).length} of {staff.length} on duty today
            </span>
          </p>
        </div>
        {tab === "directory" ? (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
          >
            <Plus size={16} /> Add Staff Member
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadCsv(staff, roster)}
              className="flex items-center gap-1.5 border border-line bg-white text-on-surface text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-all"
            >
              <Download size={16} /> Export Roster
            </button>
            <button
              type="button"
              onClick={() => openAssignShift()}
              className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
            >
              <Plus size={16} /> Assign Shift
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-2">
        {(["directory", "roster"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {t === "directory" ? "Directory" : "Roster"}
          </button>
        ))}
      </div>

      {tab === "directory" ? (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff..."
                className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
              />
            </div>
            <div className="flex gap-2">
              {roleFilters.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRoleFilter(r.value)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    roleFilter === r.value
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-8">
            {filteredStaff.map((s) => {
              const meta = roleMeta[s.role];
              const globalIndex = staff.indexOf(s);
              return (
                <StaffRow
                  key={s.id}
                  name={s.name}
                  initials={initials(s.name)}
                  specialty={s.specialty}
                  title={s.title}
                  licenseNumber={s.licenseNumber}
                  statusTone={statusTone[s.status]}
                  statusLabel={statusLabel[s.status]}
                  roleIcon={<meta.icon size={11} />}
                  accentColor={meta.accentColor}
                  onDutyToday={s.schedule.includes(TODAY_LABEL)}
                  onView={() => navigate(ROUTES.HOSPITAL_ADMIN.STAFF_DETAIL(s.id))}
                  onManage={() => openManage(globalIndex)}
                />
              );
            })}
            {filteredStaff.length === 0 && (
              <p className="text-center text-sm text-on-surface-variant py-12">No staff match your search.</p>
            )}
          </div>
        </>
      ) : (
        <div className="pb-8">
          {(() => {
            const allShifts = roster.flatMap((r) => r.shifts);
            const gaps = allShifts.filter((s) => s.type === "gap").length;
            const nights = allShifts.filter((s) => s.type === "night").length;
            const standard = allShifts.filter((s) => s.type === "standard").length;
            const onLeave = allShifts.filter((s) => s.type === "leave").length;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                <KPICard label="Coverage Gaps" value={gaps} icon={<AlertTriangle size={14} />} accentColor="var(--pulse-coral)" />
                <KPICard label="Standard Shifts" value={standard} icon={<CalendarCheck size={14} />} accentColor="var(--signal-indigo)" />
                <KPICard label="Night Shifts" value={nights} icon={<Moon size={14} />} accentColor="var(--ink-navy)" />
                <KPICard label="On Leave" value={onLeave} icon={<Umbrella size={14} />} accentColor="var(--caution-amber)" />
              </div>
            );
          })()}

          <Card hero>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Weekly Roster</h2>
                <p className="text-sm text-on-surface-variant mt-0.5">Week of Aug 10–16, 2026 · All Departments</p>
              </div>
            </div>

            <RosterGrid
              staffList={staff.map((s) => {
                const RoleIcon = roleMeta[s.role].icon;
                return {
                  id: s.id,
                  name: s.name,
                  title: s.title,
                  accentColor: roleMeta[s.role].accentColor,
                  initials: initials(s.name),
                  roleIcon: <RoleIcon size={9} />,
                };
              })}
              rosterRows={roster}
              days={weekDays}
              todayLabel={TODAY_LABEL}
              onCellClick={(staffId, day) => openAssignShift(staffId, day)}
            />

            <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-line">
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundImage: "linear-gradient(135deg, var(--signal-indigo), color-mix(in srgb, var(--signal-indigo) 70%, black))" }}>
                Standard Shift
              </span>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundImage: "linear-gradient(135deg, var(--ink-navy), color-mix(in srgb, var(--ink-navy) 70%, black))" }}>
                <Moon size={11} /> Night Shift
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant border border-line"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--surface-container-low), var(--surface-container-low) 4px, var(--surface-container) 4px, var(--surface-container) 8px)" }}
              >
                On Leave
              </span>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-pulse-coral border-2 border-dashed border-pulse-coral/50 bg-pulse-coral/[0.06]">
                <AlertTriangle size={11} /> Coverage Gap
              </span>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white bg-gradient-brand ml-auto">
                Today · {TODAY_LABEL}
              </span>
            </div>
          </Card>
        </div>
      )}

      <StaffFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingStaff}
        departmentOptions={departmentNames}
      />

      <AssignShiftDrawer
        open={shiftDrawerOpen}
        onClose={() => setShiftDrawerOpen(false)}
        onSubmit={handleShiftSubmit}
        staffOptions={staff.map((s) => ({ value: s.id, label: s.name }))}
        initialValues={editingShift}
      />
    </HospitalAdminLayout>
  );
}
