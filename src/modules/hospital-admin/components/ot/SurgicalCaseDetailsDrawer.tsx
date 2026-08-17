import { CheckCircle2, Circle } from "lucide-react";
import { Drawer, Button, StatusChip } from "@shared/design-system/components";
import { surgicalCaseStatusMeta, surgeryPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseDetail } from "@modules/hospital-admin/api";

interface DetailRowProps {
  label: string;
  value?: string | number | null;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value ?? "—"}</p>
    </div>
  );
}

interface SurgicalCaseDetailsDrawerProps {
  caseDetail: SurgicalCaseDetail | null;
  onClose: () => void;
  onApprove: () => void;
  onSchedule: () => void;
  onReschedule: () => void;
  onDelay: () => void;
  onCancel: () => void;
  onPostpone: () => void;
  onNoShow: () => void;
}

const modifiableStatuses = new Set(["requested", "approved", "scheduled", "pre-op-pending", "pre-op-cleared", "ready-for-ot"]);

/** Module-local — Surgery Case Details (spec §36's non-clinical-tab subset, appropriate for Phase 1): full request/team/requirement fields, the standardized lifecycle (spec §8), and case-level actions. Intra-op/Pre-Op/Consent/Anesthesia sub-tabs are Phase 2. */
export function SurgicalCaseDetailsDrawer({ caseDetail, onClose, onApprove, onSchedule, onReschedule, onDelay, onCancel, onPostpone, onNoShow }: SurgicalCaseDetailsDrawerProps) {
  const status = caseDetail ? surgicalCaseStatusMeta[caseDetail.status] : null;
  const priority = caseDetail ? surgeryPriorityMeta[caseDetail.priority] : null;

  const canApprove = caseDetail?.status === "requested";
  const canSchedule = caseDetail?.status === "approved";
  const canModify = Boolean(caseDetail) && modifiableStatuses.has(caseDetail!.status);
  const canNoShow = caseDetail?.status === "scheduled" || caseDetail?.status === "ready-for-ot";

  return (
    <Drawer
      open={Boolean(caseDetail)}
      onClose={onClose}
      title={caseDetail?.caseNumber ?? ""}
      footer={
        caseDetail && (
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {canApprove && <Button onClick={onApprove}>Approve</Button>}
            {canSchedule && <Button onClick={onSchedule}>Schedule</Button>}
            {canModify && caseDetail.scheduledDateTime && (
              <Button variant="outline" onClick={onDelay}>
                Delay
              </Button>
            )}
            {canModify && caseDetail.scheduledDateTime && (
              <Button variant="outline" onClick={onReschedule}>
                Reschedule
              </Button>
            )}
            {canNoShow && (
              <Button variant="outline" onClick={onNoShow}>
                No-Show
              </Button>
            )}
            {canModify && (
              <Button variant="outline" onClick={onPostpone}>
                Postpone
              </Button>
            )}
            {canModify && (
              <Button variant="danger" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        )
      }
    >
      {caseDetail && status && priority && (
        <>
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-on-surface">{caseDetail.patientName}</h3>
              <p className="text-sm text-on-surface-variant">{caseDetail.procedureName}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                {priority.label}
              </span>
              <StatusChip tone="neutral">
                <span style={{ color: status.color }}>{status.label}</span>
              </StatusChip>
            </div>
          </div>

          {(caseDetail.cancelledReason || caseDetail.postponedReason || caseDetail.delayReason) && (
            <div className="mb-6 rounded-xl border border-pulse-coral/30 bg-pulse-coral/5 px-4 py-3">
              {caseDetail.cancelledReason && (
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Cancelled:</span> {caseDetail.cancelledReason}
                </p>
              )}
              {caseDetail.postponedReason && (
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Postponed:</span> {caseDetail.postponedReason}
                </p>
              )}
              {caseDetail.delayReason && (
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Delayed {caseDetail.delayMinutes} min:</span> {caseDetail.delayReason}
                </p>
              )}
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Case Lifecycle</h4>
            <div className="flex flex-col gap-1.5">
              {caseDetail.lifecycle.map((stage) => (
                <div key={stage.status} className="flex items-center gap-2.5">
                  {stage.done ? <CheckCircle2 size={15} className="text-vital-green flex-shrink-0" /> : <Circle size={15} className="text-outline-variant flex-shrink-0" />}
                  <span className={`text-sm ${stage.current ? "font-bold text-on-surface" : stage.done ? "text-on-surface" : "text-on-surface-variant"}`}>{stage.stage}</span>
                  {stage.current && <span className="text-[10px] font-bold text-signal-indigo uppercase">Current</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Procedure</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Surgical Site" value={caseDetail.surgicalSite} />
              <DetailRow label="Laterality" value={caseDetail.laterality?.replace("-", " ")} />
              <DetailRow label="Clinical Indication" value={caseDetail.clinicalIndication} />
              <DetailRow label="Diagnosis" value={caseDetail.diagnosis} />
              <DetailRow label="Estimated Duration" value={`${caseDetail.estimatedDurationMinutes} min`} />
              <DetailRow label="Encounter" value={caseDetail.encounterId} />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Surgical Team</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Primary Surgeon" value={caseDetail.surgeonName} />
              <DetailRow label="Assistant Surgeon" value={caseDetail.assistantSurgeonName} />
              <DetailRow label="Anesthesiologist" value={caseDetail.anesthesiologistName} />
              <DetailRow label="Anesthesia Type" value={caseDetail.anesthesiaType} />
              <DetailRow label="Scrub Nurse" value={caseDetail.scrubNurseName} />
              <DetailRow label="Circulating Nurse" value={caseDetail.circulatingNurseName} />
              <DetailRow label="Technician" value={caseDetail.technicianName} />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Scheduling</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Scheduled" value={caseDetail.scheduledDateTime ? formatDateTime(caseDetail.scheduledDateTime) : undefined} />
              <DetailRow label="OT Room" value={caseDetail.roomNumber} />
              <DetailRow label="Requested" value={formatDateTime(caseDetail.requestedAt)} />
              <DetailRow label="Approved" value={caseDetail.approvedAt ? formatDateTime(caseDetail.approvedAt) : undefined} />
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Required OT Type" value={caseDetail.requiredOtType} />
              <DetailRow label="Required Equipment" value={caseDetail.requiredEquipment} />
              <DetailRow label="Blood Requirement" value={caseDetail.bloodRequirement} />
              <DetailRow label="Implant Required" value={caseDetail.implantRequirement ? "Yes" : "No"} />
              <DetailRow label="Isolation Required" value={caseDetail.isolationRequirement ? "Yes" : "No"} />
              <DetailRow label="ICU Bed Required" value={caseDetail.icuBedRequirement ? "Yes" : "No"} />
              <DetailRow label="PACU Required" value={caseDetail.pacuRequirement ? "Yes" : "No"} />
            </div>
            {caseDetail.specialInstructions && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Special Instructions</p>
                <p className="text-sm text-on-surface">{caseDetail.specialInstructions}</p>
              </div>
            )}
          </div>

          {(caseDetail.roomEntryAt || caseDetail.anesthesiaStartAt || caseDetail.procedureStartAt || caseDetail.procedureEndAt || caseDetail.roomExitAt) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Time Tracking</h4>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Room Entry" value={caseDetail.roomEntryAt ? formatDateTime(caseDetail.roomEntryAt) : undefined} />
                <DetailRow label="Anesthesia Start" value={caseDetail.anesthesiaStartAt ? formatDateTime(caseDetail.anesthesiaStartAt) : undefined} />
                <DetailRow label="Procedure Start" value={caseDetail.procedureStartAt ? formatDateTime(caseDetail.procedureStartAt) : undefined} />
                <DetailRow label="Procedure End" value={caseDetail.procedureEndAt ? formatDateTime(caseDetail.procedureEndAt) : undefined} />
                <DetailRow label="Room Exit" value={caseDetail.roomExitAt ? formatDateTime(caseDetail.roomExitAt) : undefined} />
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
