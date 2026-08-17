import { useEffect, useState } from "react";
import { ArrowRightLeft, Ban, Building2, CalendarDays, CheckCircle2, Clock, LogOut, ShieldAlert, ShieldOff, Sparkles, Stethoscope, User, Wrench, XCircle } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { bedStatusMeta } from "@modules/hospital-admin/components/bedStatusMeta";
import type { BedActionMode } from "@modules/hospital-admin/components/beds/BedActionDrawer";
import * as api from "@modules/hospital-admin/api";
import type { BedAuditEvent, BedListRow } from "@modules/hospital-admin/api";

export type BedQuickAction = "release" | "cancel-reservation" | "complete-cleaning" | "complete-maintenance" | "unblock" | "return-to-service" | "clear-isolation";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value || "—"}</p>
    </div>
  );
}

interface BedDetailsDrawerProps {
  bed: BedListRow | null;
  onClose: () => void;
  onViewPatient?: (patientId: string) => void;
  onOpenAction: (mode: BedActionMode) => void;
  onQuickAction: (action: BedQuickAction) => void;
}

/** Bed detail panel (Bed Management spec §9) with contextual actions per status (spec §10-18, Phase 2). */
export function BedDetailsDrawer({ bed, onClose, onViewPatient, onOpenAction, onQuickAction }: BedDetailsDrawerProps) {
  const meta = bed ? bedStatusMeta[bed.status] : null;
  const [history, setHistory] = useState<BedAuditEvent[]>([]);

  useEffect(() => {
    if (!bed) {
      setHistory([]);
      return;
    }
    api.getBedHistory(bed.id).then(setHistory);
  }, [bed]);

  return (
    <Drawer
      open={Boolean(bed)}
      onClose={onClose}
      title={bed ? `Bed ${bed.identifier}` : "Bed"}
      subtitle={bed ? `${bed.wardName} · ${bed.roomName}` : undefined}
      footer={
        bed && (
          <div className="flex flex-col gap-2">
            {bed.status === "available" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => onOpenAction("assign")} icon={<User size={14} />}>
                    Assign Bed
                  </Button>
                  <Button variant="outline" onClick={() => onOpenAction("reserve")} icon={<CalendarDays size={14} />}>
                    Reserve Bed
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onOpenAction("maintenance")} icon={<Wrench size={14} />}>
                    Report Maintenance
                  </Button>
                  <Button variant="danger" onClick={() => onOpenAction("block")} icon={<Ban size={14} />}>
                    Block Bed
                  </Button>
                </div>
              </>
            )}
            {bed.status === "reserved" && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onOpenAction("confirm-admission")} icon={<CheckCircle2 size={14} />}>
                  Confirm Admission
                </Button>
                <Button variant="outline" onClick={() => onQuickAction("cancel-reservation")} icon={<XCircle size={14} />}>
                  Cancel Reservation
                </Button>
              </div>
            )}
            {bed.status === "occupied" && (
              <>
                {bed.patientId && onViewPatient && (
                  <Button onClick={() => onViewPatient(bed.patientId!)} icon={<User size={14} />} fullWidth>
                    View Patient Profile
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onOpenAction("transfer")} icon={<ArrowRightLeft size={14} />}>
                    Transfer Patient
                  </Button>
                  <Button variant="danger" onClick={() => onQuickAction("release")} icon={<LogOut size={14} />}>
                    Release (Discharge)
                  </Button>
                </div>
                {bed.isolationRequired ? (
                  <Button variant="outline" onClick={() => onQuickAction("clear-isolation")} icon={<ShieldOff size={14} />} fullWidth>
                    Clear Isolation
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => onOpenAction("isolation")} icon={<ShieldAlert size={14} />} fullWidth>
                    Set Isolation
                  </Button>
                )}
              </>
            )}
            {bed.status === "cleaning" && (
              <Button onClick={() => onQuickAction("complete-cleaning")} icon={<Sparkles size={14} />} fullWidth>
                Mark Cleaning Complete
              </Button>
            )}
            {bed.status === "maintenance" && (
              <Button onClick={() => onQuickAction("complete-maintenance")} icon={<CheckCircle2 size={14} />} fullWidth>
                Complete Maintenance
              </Button>
            )}
            {bed.status === "blocked" && (
              <Button onClick={() => onQuickAction("unblock")} icon={<CheckCircle2 size={14} />} fullWidth>
                Unblock Bed
              </Button>
            )}
            {bed.status === "out-of-service" && (
              <Button onClick={() => onQuickAction("return-to-service")} icon={<CheckCircle2 size={14} />} fullWidth>
                Return to Service
              </Button>
            )}
          </div>
        )
      }
    >
      {bed && meta && (
        <div className="flex flex-col gap-6">
          <div
            className="flex items-center gap-4 rounded-2xl border border-line p-4"
            style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}
          >
            <span
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm font-bold text-sm"
              style={{ color: meta.color }}
            >
              {bed.identifier.split("-").pop()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-on-surface">{bed.bedTypeName} Bed</p>
              <p className="truncate text-sm text-on-surface-variant">{bed.identifier}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
              <Building2 size={12} /> Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Facility" value={bed.facilityName} />
              <Field label="Floor" value={bed.floorName} />
              <Field label="Ward" value={bed.wardName} />
              <Field label="Room" value={bed.roomName} />
              <Field label="Department" value={bed.departmentName} />
              <Field label="Gender Restriction" value={bed.genderRestriction === "any" ? "None" : bed.genderRestriction === "male" ? "Male only" : "Female only"} />
            </div>
          </div>

          {bed.status === "occupied" && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <User size={12} /> Patient
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Patient" value={bed.patientName} />
                <Field label="MRN" value={bed.patientMrn} />
                <Field label="Attending" value={bed.assignedStaffName} />
                <Field label="Admission" value={bed.admissionDate} />
                <Field label="Expected Discharge" value={bed.expectedDischargeDate} />
              </div>
            </div>
          )}

          {bed.status === "reserved" && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <CalendarDays size={12} /> Reservation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Reserved For" value={bed.reservedForName} />
                <Field label="Expected Admission" value={bed.expectedAdmissionDate} />
              </div>
              <div className="mt-4">
                <Field label="Reason" value={bed.reservationReason} />
              </div>
            </div>
          )}

          {bed.status === "blocked" && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <ShieldAlert size={12} /> Blocked
              </h3>
              <Field label="Reason" value={bed.blockedReason} />
            </div>
          )}

          {bed.status === "maintenance" && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Stethoscope size={12} /> Maintenance
              </h3>
              <Field label="Issue" value={bed.maintenanceIssue} />
            </div>
          )}

          {bed.status === "out-of-service" && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Ban size={12} /> Decommissioned
              </h3>
              <Field label="Reason" value={bed.outOfServiceReason} />
            </div>
          )}

          {(bed.isolationRequired || bed.isolationType) && (
            <div className="rounded-xl border-2 border-dashed border-sunset-coral/50 bg-sunset-coral/[0.06] px-4 py-3">
              <p className="text-xs font-bold text-sunset-coral mb-0.5">Isolation Precaution</p>
              <p className="text-xs text-on-surface-variant capitalize">{bed.isolationType ?? "Required"}</p>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant flex items-center gap-1.5">
                <Clock size={12} /> History
              </h3>
              <div className="flex flex-col gap-2">
                {history.map((e) => (
                  <div key={e.id} className="rounded-xl border border-line px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-on-surface">{e.action}</p>
                      <p className="text-[10px] text-on-surface-variant flex-shrink-0">{e.timestamp}</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {e.actor}
                      {e.patientName ? ` · ${e.patientName}` : ""}
                      {e.detail ? ` · ${e.detail}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-on-surface-variant">Last updated {bed.lastUpdated}</p>
        </div>
      )}
    </Drawer>
  );
}
