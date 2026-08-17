import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, CreditCard, Pencil, CalendarDays } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { Card, StatusChip, StatusTone } from "@shared/design-system/components";
import { StaffFormDrawer, StaffFormValues, roleMeta } from "@modules/hospital-admin/components/staff/StaffFormDrawer";
import * as api from "@modules/hospital-admin/api";
import type { AttendanceDay, AttendanceStatus, StaffMember } from "@modules/hospital-admin/api";

type Staff = StaffMember | null;

const statusTone: Record<StaffMember["status"], StatusTone> = {
  active: "success",
  "on-leave": "warning",
  inactive: "neutral",
};

const statusLabel: Record<StaffMember["status"], string> = {
  active: "Active",
  "on-leave": "On Leave",
  inactive: "Inactive",
};

const attendanceMeta: Record<AttendanceStatus, { label: string; color: string }> = {
  present: { label: "Present", color: "var(--vital-green)" },
  absent: { label: "Absent", color: "var(--pulse-coral)" },
  leave: { label: "Leave", color: "var(--caution-amber)" },
  off: { label: "Off", color: "var(--outline-variant)" },
};

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

export function StaffDetail() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();

  const [staff, setStaff] = useState<Staff>(null);
  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [departmentNames, setDepartmentNames] = useState<string[]>([]);

  useEffect(() => {
    if (!staffId) return;
    api.getStaffMember(staffId).then(setStaff);
    api.getStaffAttendance(staffId).then(setAttendance);
  }, [staffId]);

  useEffect(() => {
    api.getDepartmentConfigs().then((depts) => setDepartmentNames(depts.map((d) => d.name)));
  }, []);

  if (!staff) {
    return (
      <HospitalAdminLayout active="Staff">
        <p className="text-sm text-on-surface-variant">Staff member not found.</p>
      </HospitalAdminLayout>
    );
  }

  const meta = roleMeta[staff.role];
  const presentDays = attendance.filter((d) => d.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;

  return (
    <HospitalAdminLayout active="Staff">
      <button
        type="button"
        onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.STAFF)}
        className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-signal-indigo transition-colors mb-2"
      >
        <ArrowLeft size={14} /> Back to Staff Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero className="lg:col-span-1 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold border-2"
              style={{
                backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${meta.accentColor} 18%, white), color-mix(in srgb, ${meta.accentColor} 8%, white))`,
                color: meta.accentColor,
                borderColor: `color-mix(in srgb, ${meta.accentColor} 35%, transparent)`,
              }}
            >
              {initials(staff.name)}
            </span>
            <span
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-line shadow-sm"
              style={{ color: meta.accentColor }}
            >
              <meta.icon size={14} />
            </span>
          </div>
          <h1 className="text-xl font-bold text-on-surface">{staff.name}</h1>
          <p className="text-sm text-on-surface-variant mb-3">
            {staff.specialty} · {staff.title}
          </p>
          <StatusChip tone={statusTone[staff.status]}>{statusLabel[staff.status]}</StatusChip>

          <div className="w-full mt-6 pt-5 border-t border-line flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <Mail size={14} className="text-on-surface-variant flex-shrink-0" />
              <span className="truncate">{staff.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <Phone size={14} className="text-on-surface-variant flex-shrink-0" />
              {staff.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <CreditCard size={14} className="text-on-surface-variant flex-shrink-0" />
              <span className="font-mono text-xs">{staff.nationalId}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mt-6 w-full flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-semibold text-signal-indigo hover:bg-signal-indigo-tint transition-colors"
          >
            <Pencil size={14} /> Edit Staff Member
          </button>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">License</p>
              <p className="font-mono text-sm font-bold text-on-surface">{staff.licenseNumber}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">Department</p>
              <p className="text-sm font-bold text-on-surface">{staff.department}</p>
            </Card>
            <Card accentColor={attendanceMeta.present.color}>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1">14-Day Attendance</p>
              <p className="text-sm font-bold text-on-surface">{attendanceRate}%</p>
            </Card>
          </div>

          <Card hero>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-signal-indigo" /> Weekly Schedule
            </h2>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const active = staff.schedule.includes(day);
                return (
                  <span
                    key={day}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                      active ? "border-vital-green bg-vital-green/10 text-vital-green" : "border-line text-on-surface-variant"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </Card>

          <Card hero>
            <h2 className="text-lg font-bold text-on-surface mb-4">Attendance — Last 14 Days</h2>
            <div className="grid grid-cols-7 gap-2">
              {attendance.map((day) => {
                const dm = attendanceMeta[day.status];
                const label = new Date(day.date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-line py-3"
                    style={{ backgroundColor: `color-mix(in srgb, ${dm.color} 8%, transparent)` }}
                  >
                    <span className="text-[10px] text-on-surface-variant">{label}</span>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dm.color }} />
                    <span className="text-[10px] font-semibold" style={{ color: dm.color }}>
                      {dm.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <StaffFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={(values) => setStaff((prev) => (prev ? { ...prev, ...values, id: prev.id } : prev))}
        initialValues={staff}
        departmentOptions={departmentNames}
      />
    </HospitalAdminLayout>
  );
}
