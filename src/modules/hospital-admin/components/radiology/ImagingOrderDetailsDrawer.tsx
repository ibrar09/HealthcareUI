import { CheckCircle2, Circle, ClipboardList, ShieldCheck, AlertTriangle } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { imagingOrderStatusMeta, imagingPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { ImagingOrderDetail } from "@modules/hospital-admin/api";

interface ImagingOrderDetailsDrawerProps {
  order: ImagingOrderDetail | null;
  onClose: () => void;
  onAuthorize: () => void;
  onSchedule: () => void;
  onCheckIn: () => void;
  onStartStudy: () => void;
  onCompleteStudy: () => void;
  onNoShow: () => void;
  onHold: () => void;
  onReleaseHold: () => void;
  onCancel: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="text-xs text-on-surface-variant flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

/** Module-local — Radiology Order Details (spec §8): patient/order/clinical/scheduling/authorization + workflow timeline, plus every administrative (never clinical) action for the current status. */
export function ImagingOrderDetailsDrawer({ order, onClose, onAuthorize, onSchedule, onCheckIn, onStartStudy, onCompleteStudy, onNoShow, onHold, onReleaseHold, onCancel }: ImagingOrderDetailsDrawerProps) {
  const meta = order ? imagingOrderStatusMeta[order.status] : null;
  const priority = order ? imagingPriorityMeta[order.priority] : null;

  const canCancel = Boolean(order) && order?.status !== "completed" && order?.status !== "cancelled" && order?.status !== "no-show";
  const canHold = Boolean(order) && order?.status !== "on-hold" && canCancel;

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title={order?.orderNumber ?? ""}
      subtitle={order ? `${order.patientName} · ${order.studyName}` : undefined}
      footer={
        order && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {canHold && (
                <Button variant="ghost" size="sm" onClick={onHold}>
                  Put On Hold
                </Button>
              )}
              {order.status === "on-hold" && (
                <Button variant="ghost" size="sm" onClick={onReleaseHold}>
                  Release Hold
                </Button>
              )}
              {canCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel Order
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {order.status === "pending-authorization" && <Button onClick={onAuthorize}>Authorize</Button>}
              {(order.status === "authorized" || (order.status === "ordered" && order.authorizationStatus === "not-required")) && <Button onClick={onSchedule}>Schedule</Button>}
              {order.status === "scheduled" && (
                <>
                  <Button variant="outline" onClick={onNoShow}>
                    No-Show
                  </Button>
                  <Button onClick={onCheckIn}>Check In</Button>
                </>
              )}
              {order.status === "checked-in" && <Button onClick={onStartStudy}>Start Study</Button>}
              {order.status === "in-progress" && <Button onClick={onCompleteStudy}>Complete Study</Button>}
            </div>
          </div>
        )
      }
    >
      {order && meta && priority && (
        <>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
              {meta.label}
            </span>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
              {priority.label}
            </span>
            {order.hasCriticalFinding && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pulse-coral/14 text-pulse-coral text-xs font-bold px-2.5 py-1">
                <AlertTriangle size={12} /> Critical finding open
              </span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3 flex items-center gap-2">
              <ClipboardList size={13} /> Order
            </h3>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Study" value={order.studyName} />
              <Row label="Ordering Physician" value={order.orderingPractitionerName} />
              <Row label="Department" value={order.departmentName} />
              <Row label="Reason for Exam" value={order.reasonForExam} />
              {order.clinicalHistory && <Row label="Clinical History" value={order.clinicalHistory} />}
              <Row label="Ordered" value={formatDateTime(order.orderedDateTime)} />
              {order.radiologistName && <Row label="Radiologist" value={order.radiologistName} />}
              {order.cancelledReason && <Row label="Cancelled Reason" value={order.cancelledReason} />}
              {order.onHoldReason && <Row label="On-Hold Reason" value={order.onHoldReason} />}
            </div>
          </div>

          {(order.scheduledDateTime || order.roomNumber) && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Scheduling</h3>
              <div className="rounded-xl border border-line divide-y divide-line">
                {order.scheduledDateTime && <Row label="Appointment" value={formatDateTime(order.scheduledDateTime)} />}
                {order.roomNumber && <Row label="Room" value={order.roomNumber} />}
                {order.technologistName && <Row label="Technologist" value={order.technologistName} />}
                {order.contrastRequired !== undefined && <Row label="Contrast Required" value={order.contrastRequired ? "Yes" : "No"} />}
                {order.fastingRequired !== undefined && <Row label="Fasting Required" value={order.fastingRequired ? "Yes" : "No"} />}
                {order.specialPreparation && <Row label="Special Preparation" value={order.specialPreparation} />}
              </div>
            </div>
          )}

          {order.authorizationStatus !== "not-required" && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3 flex items-center gap-2">
                <ShieldCheck size={13} /> Authorization
              </h3>
              <div className="rounded-xl border border-line divide-y divide-line">
                {order.payerName && <Row label="Insurance" value={order.payerName} />}
                <Row label="Authorization" value={order.authorizationStatus === "approved" ? "Approved" : order.authorizationStatus === "rejected" ? "Rejected" : "Pending"} />
                {order.authorizationNumber && <Row label="Authorization Number" value={order.authorizationNumber} />}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Workflow Timeline</h3>
            <div className="flex flex-col gap-1">
              {order.timeline.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3 py-1.5">
                  {stage.done ? <CheckCircle2 size={16} className="text-vital-green flex-shrink-0" /> : <Circle size={16} className="text-outline-variant flex-shrink-0" />}
                  <span className={`text-sm flex-1 ${stage.done ? "font-medium text-on-surface" : "text-on-surface-variant"}`}>{stage.stage}</span>
                  {stage.at && <span className="text-xs text-on-surface-variant">{formatDateTime(stage.at)}</span>}
                </div>
              ))}
            </div>
          </div>

          {order.lastActionAt && (
            <p className="mt-6 text-xs text-on-surface-variant">
              Last updated by {order.lastActionBy} · {formatDateTime(order.lastActionAt)}
            </p>
          )}
        </>
      )}
    </Drawer>
  );
}
