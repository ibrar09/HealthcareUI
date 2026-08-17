import { AlertTriangle, Ban, Beaker, ClipboardList, FileCheck2, History } from "lucide-react";
import { Drawer, Button, StatusChip } from "@shared/design-system/components";
import { labOrderStatusMeta, labPriorityMeta, specimenStatusMeta, interpretationMeta, formatDateTime } from "@modules/hospital-admin/components/laboratory/labStatusMeta";
import type { LabOrderDetail } from "@modules/hospital-admin/api";

interface LabOrderDetailsDrawerProps {
  order: LabOrderDetail | null;
  onClose: () => void;
  onCancel: () => void;
}

/** Module-local — Laboratory Order Details: the joined ServiceRequest → Specimen → Observation → DiagnosticReport view (HMS_DOMAIN_STANDARDS.md §23-26), view-only + administrative Cancel. */
export function LabOrderDetailsDrawer({ order, onClose, onCancel }: LabOrderDetailsDrawerProps) {
  const meta = order ? labOrderStatusMeta[order.status] : null;
  const priority = order ? labPriorityMeta[order.priority] : null;
  const canCancel = Boolean(order) && order?.status !== "verified" && order?.status !== "cancelled";

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      title={order?.orderNumber ?? ""}
      subtitle={order ? `${order.patientName} · ${order.departmentName}` : undefined}
      footer={
        canCancel ? (
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onCancel} icon={<Ban size={14} />}>
              Cancel Order
            </Button>
          </div>
        ) : undefined
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
        {order.hasCriticalFlag && (
          <span className="inline-flex items-center gap-1 rounded-full bg-pulse-coral/14 text-pulse-coral text-xs font-bold px-2.5 py-1">
            <AlertTriangle size={12} /> Critical result open
          </span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3 flex items-center gap-2">
          <ClipboardList size={13} /> Order
        </h3>
        <div className="rounded-xl border border-line divide-y divide-line">
          <Row label="Ordering Practitioner" value={order.orderingPractitionerName} />
          <Row label="Tests Ordered" value={order.testNames.join(", ")} />
          <Row label="Reason" value={order.reasonForTest} />
          {order.clinicalInformation && <Row label="Clinical Information" value={order.clinicalInformation} />}
          <Row label="Ordered" value={formatDateTime(order.orderedDateTime)} />
          {order.cancelledReason && <Row label="Cancelled Reason" value={order.cancelledReason} />}
        </div>
      </div>

      {order.specimens.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3 flex items-center gap-2">
            <Beaker size={13} /> Specimen
          </h3>
          <div className="flex flex-col gap-3">
            {order.specimens.map((s) => {
              const smeta = specimenStatusMeta[s.processingStatus];
              return (
                <div key={s.id} className="rounded-xl border border-line px-3.5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-on-surface capitalize">{s.type}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${smeta.color} 16%, transparent)`, color: smeta.color }}>
                      {smeta.label}
                    </span>
                  </div>
                  {s.collectionDateTime && (
                    <p className="text-xs text-on-surface-variant">
                      Collected {formatDateTime(s.collectionDateTime)} by {s.collectedBy}
                    </p>
                  )}
                  {s.receivedDateTime && <p className="text-xs text-on-surface-variant">Received {formatDateTime(s.receivedDateTime)}</p>}
                  {s.bodySite && <p className="text-xs text-on-surface-variant">Site: {s.bodySite}</p>}
                  {s.condition && s.condition !== "acceptable" && <p className="text-xs text-pulse-coral font-medium mt-1">Condition: {s.condition}</p>}
                  {s.rejectionReason && <p className="text-xs text-pulse-coral font-medium mt-1">Rejected: {s.rejectionReason}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.observations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3 flex items-center gap-2">
            <FileCheck2 size={13} /> Results {order.report && <span className="normal-case font-normal">— {order.report.name}</span>}
          </h3>
          <div className="flex flex-col gap-2">
            {order.observations.map((o) => {
              const imeta = interpretationMeta[o.interpretation];
              return (
                <div key={o.id} className="rounded-xl border border-line px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-on-surface truncate">{o.testName}</span>
                    {o.interpretation !== "normal" && (
                      <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${imeta.color} 16%, transparent)`, color: imeta.color }}>
                        {imeta.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-3 mt-1">
                    <span className="font-mono font-bold text-on-surface text-sm">
                      {o.value} {o.unit}
                    </span>
                    <span className="text-xs text-on-surface-variant text-right">{o.referenceRangeText}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {order.report?.conclusion && (
            <p className="mt-3 text-sm text-on-surface-variant italic">"{order.report.conclusion}"</p>
          )}
          {order.report && (
            <p className="mt-2 text-xs text-on-surface-variant">
              Report status: <StatusChip tone={order.report.status === "final" ? "success" : "warning"}>{order.report.status === "final" ? "Final" : "Preliminary"}</StatusChip>
              {order.report.issuedDateTime && ` · Issued ${formatDateTime(order.report.issuedDateTime)}`}
            </p>
          )}
        </div>
      )}

      {order.auditTrail.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3 flex items-center gap-2">
            <History size={13} /> Administrative History
          </h3>
          <div className="flex flex-col gap-2">
            {order.auditTrail.map((e) => (
              <div key={e.id} className="text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">{e.action}</span> by {e.actor} {e.detail && `— ${e.detail}`}
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="text-xs text-on-surface-variant flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}
