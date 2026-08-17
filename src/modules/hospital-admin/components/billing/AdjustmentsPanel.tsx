import { Check, FileMinus, FilePlus, X } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { writeOffStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { AdjustmentView, WriteOffView } from "@modules/hospital-admin/api";

interface AdjustmentsPanelProps {
  adjustments: AdjustmentView[];
  writeOffs: WriteOffView[];
  onApproveWriteOff: (id: string) => void;
  onRejectWriteOff: (writeOff: WriteOffView) => void;
}

/** Module-local — Billing "Adjustments" tab: Credit Notes / Debit Adjustments (spec §21) and Write-Off Management (spec §51), both created from Invoice Details, reviewed here. */
export function AdjustmentsPanel({ adjustments, writeOffs, onApproveWriteOff, onRejectWriteOff }: AdjustmentsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Credit Notes &amp; Debit Adjustments</h2>
        {adjustments.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No adjustments recorded yet — add one from an invoice's details.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {adjustments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${a.type === "credit" ? "bg-vital-green/15 text-vital-green" : "bg-pulse-coral/15 text-pulse-coral"}`}>
                    {a.type === "credit" ? <FileMinus size={14} /> : <FilePlus size={14} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {a.adjustmentNumber} · {a.patientName}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {a.invoiceNumber} · {a.createdBy} · {a.createdOn}
                    </p>
                    <p className="text-xs text-on-surface-variant italic mt-0.5">"{a.reason}"</p>
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${a.type === "credit" ? "text-vital-green" : "text-pulse-coral"}`}>
                  {a.type === "credit" ? "−" : "+"}
                  {formatSAR(a.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Write-Off Requests</h2>
        {writeOffs.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No write-offs requested yet — request one from an invoice's details.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {writeOffs.map((w) => {
              const meta = writeOffStatusMeta[w.status];
              return (
                <div key={w.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {w.writeOffNumber} · {w.patientName}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {w.invoiceNumber} · {formatSAR(w.amount)} · Requested by {w.requestedBy} on {w.requestedOn}
                    </p>
                    <p className="text-xs text-on-surface-variant italic mt-0.5">"{w.reason}"</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {w.status === "requested" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onRejectWriteOff(w)} icon={<X size={12} />}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => onApproveWriteOff(w.id)} icon={<Check size={12} />}>
                          Approve
                        </Button>
                      </>
                    )}
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
