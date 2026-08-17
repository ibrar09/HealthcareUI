import { BedDouble, Calendar, Clock, Pencil, Power, ReceiptText, UserPlus, Users } from "lucide-react";
import { Drawer, Button, StatusChip } from "@shared/design-system/components";
import type { DepartmentDetail } from "@modules/hospital-admin/api";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value ?? "—"}</p>
    </div>
  );
}

const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DepartmentDetailDrawerProps {
  department: DepartmentDetail | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onAssignStaff: () => void;
  onAssignServices: () => void;
  onAssignAppointmentTypes: () => void;
  onSetWorkingHours: () => void;
}

/** Module-local — Department Detail (spec §2): everything a department admin can assign/configure, in one place, sourced from real joined data (not decorative placeholders). */
export function DepartmentDetailDrawer({
  department,
  onClose,
  onEdit,
  onToggleActive,
  onAssignStaff,
  onAssignServices,
  onAssignAppointmentTypes,
  onSetWorkingHours,
}: DepartmentDetailDrawerProps) {
  return (
    <Drawer
      open={Boolean(department)}
      onClose={onClose}
      title={department ? `${department.name} (${department.code})` : "Department"}
      subtitle={department ? `${department.facilityName}${department.floorName ? ` · ${department.floorName}` : ""}` : undefined}
      footer={
        department && (
          <div className="flex items-center justify-between gap-3">
            <Button variant={department.active ? "danger" : "outline"} onClick={onToggleActive} icon={<Power size={14} />}>
              {department.active ? "Deactivate" : "Activate"}
            </Button>
            <Button onClick={onEdit} icon={<Pencil size={14} />}>
              Edit Details
            </Button>
          </div>
        )
      }
    >
      {department && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-2xl border border-line p-4" style={{ backgroundColor: `color-mix(in srgb, ${department.typeAccentColor} 10%, transparent)` }}>
            <div>
              <p className="text-xs text-on-surface-variant">{department.typeName}</p>
              <p className="text-lg font-bold text-on-surface">{department.name}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusChip tone={department.active ? "success" : "neutral"}>{department.active ? "Active" : "Inactive"}</StatusChip>
              <span className="text-[10px] text-on-surface-variant capitalize">{department.operationalStatus} load</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Facility" value={department.facilityName} />
            <Field label="Floor" value={department.floorName} />
            <Field label="Department Head" value={department.headDoctorName} />
            <Field label="Total Staff" value={department.totalStaffCount} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Users size={12} /> Staff
              </h3>
              <button type="button" onClick={onAssignStaff} className="flex items-center gap-1 text-xs font-semibold text-signal-indigo hover:underline">
                <UserPlus size={12} /> Assign Staff
              </button>
            </div>
            {department.primaryStaff.length === 0 && department.additionalStaff.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No staff assigned yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {department.primaryStaff.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{s.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{s.title}</p>
                    </div>
                    <span className="text-[10px] font-bold text-signal-indigo flex-shrink-0">Primary</span>
                  </div>
                ))}
                {department.additionalStaff.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{s.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{s.title}</p>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant flex-shrink-0">Also assigned</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <ReceiptText size={12} /> Assigned Services
              </h3>
              <button type="button" onClick={onAssignServices} className="text-xs font-semibold text-signal-indigo hover:underline">
                Manage
              </button>
            </div>
            {department.assignedServices.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No billable services assigned.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {department.assignedServices.map((s) => (
                  <div key={s.code} className="flex items-center justify-between text-sm">
                    <span className="text-on-surface">{s.name}</span>
                    <span className="font-semibold text-on-surface">SAR {s.standardPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Calendar size={12} /> Appointment Types
              </h3>
              <button type="button" onClick={onAssignAppointmentTypes} className="text-xs font-semibold text-signal-indigo hover:underline">
                Manage
              </button>
            </div>
            {department.assignedAppointmentTypes.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No appointment types configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {department.assignedAppointmentTypes.map((t) => (
                  <span key={t.id} className="rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface-variant">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Clock size={12} /> Working Hours
              </h3>
              <button type="button" onClick={onSetWorkingHours} className="text-xs font-semibold text-signal-indigo hover:underline">
                {department.workingHours ? "Edit" : "Set Hours"}
              </button>
            </div>
            {department.workingHours ? (
              <p className="text-sm text-on-surface">
                {department.workingHours.workingDays.map((d) => d.slice(0, 3)).join(", ")} · {department.workingHours.startTime} – {department.workingHours.endTime}
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant">No working hours configured.</p>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
              <BedDouble size={12} /> Rooms &amp; Beds
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-line px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-on-surface">{department.bedSummary.wards}</p>
                <p className="text-[10px] uppercase text-on-surface-variant">Wards</p>
              </div>
              <div className="rounded-xl border border-line px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-on-surface">{department.bedSummary.rooms}</p>
                <p className="text-[10px] uppercase text-on-surface-variant">Rooms</p>
              </div>
              <div className="rounded-xl border border-line px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-vital-green">{department.bedSummary.availableBeds}</p>
                <p className="text-[10px] uppercase text-on-surface-variant">Available</p>
              </div>
              <div className="rounded-xl border border-line px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-signal-indigo">{department.bedSummary.occupiedBeds}</p>
                <p className="text-[10px] uppercase text-on-surface-variant">Occupied</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
