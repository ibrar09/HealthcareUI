import { Drawer, Button } from "@shared/design-system/components";
import { recallStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { InventoryRecallStatus, InventoryBatch } from "@modules/hospital-admin/api";

type TraceMovement = { id: string; timestamp: string; quantityChange: number; departmentName?: string; referenceId?: string };
type TraceImplantUsage = { id: string; patientName: string; procedureName: string; dateUsed: string };

interface RecallTraceData {
  recall: { id: string; recallNumber: string; manufacturer: string; reason: string; status: InventoryRecallStatus; initiatedAt: string };
  itemName: string;
  affectedBatches: InventoryBatch[];
  issuedMovements: TraceMovement[];
  implantUsages: TraceImplantUsage[];
}

interface RecallTraceDrawerProps {
  data: RecallTraceData | null;
  onClose: () => void;
  onCloseRecall: () => void;
}

/** Module-local — Recall trace view (spec §39): Find Locations -> Find Issued Items -> Trace Usage, so a recall is actionable, not just a status flag. */
export function RecallTraceDrawer({ data, onClose, onCloseRecall }: RecallTraceDrawerProps) {
  const status = data ? recallStatusMeta[data.recall.status] : null;

  return (
    <Drawer open={Boolean(data)} onClose={onClose} title={data?.recall.recallNumber ?? ""} subtitle={data?.itemName}>
      {data && status && (
        <>
          <div className="flex items-center gap-2 mb-5">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Manufacturer & Reason</h3>
            <p className="text-sm text-on-surface">{data.recall.manufacturer} — {data.recall.reason}</p>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Affected Batches (Quarantined)</h3>
            <div className="flex flex-col divide-y divide-line">
              {data.affectedBatches.map((b) => (
                <div key={b.id} className="py-1.5 flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-on-surface-variant">{b.batchNumber}</span>
                  <span className="font-semibold text-on-surface">{b.quantity} units remaining</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Issued Before Recall</h3>
            {data.issuedMovements.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No prior issuance found for these batches.</p>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {data.issuedMovements.map((m) => (
                  <div key={m.id} className="py-1.5 flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">{m.departmentName ?? "Unknown"} · {formatDateTime(m.timestamp)}</span>
                    <span className="font-mono font-bold text-on-surface">{Math.abs(m.quantityChange)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.implantUsages.length > 0 && (
            <div className="mb-6 rounded-card bg-pulse-coral/5 border border-pulse-coral/20 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-pulse-coral mb-2">Patient Traceability</h3>
              <div className="flex flex-col divide-y divide-pulse-coral/10">
                {data.implantUsages.map((u) => (
                  <div key={u.id} className="py-1.5 text-sm">
                    <span className="font-semibold text-on-surface">{u.patientName}</span> — {u.procedureName} ({formatDateTime(u.dateUsed)})
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recall.status !== "closed" && (
            <Button size="sm" onClick={onCloseRecall}>Close Recall</Button>
          )}
        </>
      )}
    </Drawer>
  );
}
