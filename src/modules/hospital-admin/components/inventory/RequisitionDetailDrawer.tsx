import { Drawer, Button } from "@shared/design-system/components";
import { requisitionStatusMeta, requisitionPriorityMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { RequisitionItemLine, RequisitionStatus, RequisitionPriority } from "@modules/hospital-admin/api";

type RequisitionDetail = {
  id: string;
  requisitionNumber: string;
  departmentName: string;
  requestedByName: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  reason: string;
  createdAt: string;
  rejectionReason?: string;
  items: (RequisitionItemLine & { itemName: string; unit?: string })[];
};

interface RequisitionDetailDrawerProps {
  requisition: RequisitionDetail | null;
  onClose: () => void;
  onStartReview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onStartPicking: () => void;
  onIssue: () => void;
  onReceive: () => void;
  onCancel: () => void;
}

/** Module-local — Requisition detail: full state machine (spec §19), never a silent status jump. */
export function RequisitionDetailDrawer({ requisition, onClose, onStartReview, onApprove, onReject, onStartPicking, onIssue, onReceive, onCancel }: RequisitionDetailDrawerProps) {
  const status = requisition ? requisitionStatusMeta[requisition.status] : null;
  const priority = requisition ? requisitionPriorityMeta[requisition.priority] : null;

  return (
    <Drawer open={Boolean(requisition)} onClose={onClose} title={requisition?.requisitionNumber ?? ""} subtitle={requisition?.departmentName}>
      {requisition && status && priority && (
        <>
          <div className="flex items-center gap-2 mb-5">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(priority.color)}>{priority.label}</span>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Requested By</h3>
            <p className="text-sm text-on-surface">{requisition.requestedByName} · {formatDateTime(requisition.createdAt)}</p>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Reason</h3>
            <p className="text-sm text-on-surface">{requisition.reason}</p>
          </div>

          {requisition.rejectionReason && (
            <div className="mb-5 rounded-card bg-pulse-coral/5 border border-pulse-coral/20 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-pulse-coral mb-1">Rejection Reason</h3>
              <p className="text-sm text-on-surface">{requisition.rejectionReason}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Items</h3>
            <div className="flex flex-col divide-y divide-line">
              {requisition.items.map((line) => (
                <div key={line.itemId} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-on-surface font-semibold">{line.itemName}</span>
                  <span className="text-on-surface-variant text-xs">
                    Req: {line.quantityRequested}{line.quantityApproved !== undefined && ` · Appr: ${line.quantityApproved}`}{line.quantityIssued !== undefined && ` · Issued: ${line.quantityIssued}`} {line.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {requisition.status === "submitted" && <Button size="sm" onClick={onStartReview}>Start Review</Button>}
            {requisition.status === "under-review" && (
              <>
                <Button size="sm" onClick={onApprove}>Approve</Button>
                <Button size="sm" variant="danger" onClick={onReject}>Reject</Button>
              </>
            )}
            {requisition.status === "approved" && <Button size="sm" onClick={onStartPicking}>Start Picking</Button>}
            {requisition.status === "picking" && <Button size="sm" onClick={onIssue}>Issue Stock</Button>}
            {(requisition.status === "issued" || requisition.status === "partially-fulfilled") && <Button size="sm" onClick={onReceive}>Confirm Receipt</Button>}
            {["submitted", "under-review", "approved"].includes(requisition.status) && (
              <Button size="sm" variant="ghost" onClick={onCancel}>Cancel Requisition</Button>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
