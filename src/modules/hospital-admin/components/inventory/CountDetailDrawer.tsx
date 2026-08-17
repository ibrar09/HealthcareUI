import { Drawer, Button } from "@shared/design-system/components";
import { countStatusMeta, statusPillStyle } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { CountStatus } from "@modules/hospital-admin/api";

type CountLineRow = { itemId: string; itemName: string; expectedQuantity: number; countedQuantity?: number; varianceReason?: string; variance?: number };
type CountDetail = { id: string; countNumber: string; warehouseName: string; status: CountStatus; scheduledDate: string; lines: CountLineRow[] };

interface CountDetailDrawerProps {
  count: CountDetail | null;
  onClose: () => void;
  onStart: () => void;
  onRecordLine: (itemId: string, countedQuantity: number, varianceReason?: string) => void;
  onSubmitForReview: () => void;
  onApproveAndAdjust: () => void;
}

/** Module-local — Inventory Count detail (spec §28-29): live counted-vs-expected entry, real variance, approval creates real InventoryAdjustment rows, never a silent overwrite. */
export function CountDetailDrawer({ count, onClose, onStart, onRecordLine, onSubmitForReview, onApproveAndAdjust }: CountDetailDrawerProps) {
  const status = count ? countStatusMeta[count.status] : null;
  const canCount = count?.status === "in-progress";

  return (
    <Drawer open={Boolean(count)} onClose={onClose} title={count?.countNumber ?? ""} subtitle={count?.warehouseName}>
      {count && status && (
        <>
          <div className="mb-5">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Lines</h3>
            <div className="flex flex-col divide-y divide-line">
              {count.lines.map((line) => (
                <div key={line.itemId} className="py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-on-surface">{line.itemName}</span>
                    <span className="text-xs text-on-surface-variant">Expected: {line.expectedQuantity}</span>
                  </div>
                  {canCount ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        className={`${formInputClass} w-28`}
                        defaultValue={line.countedQuantity ?? line.expectedQuantity}
                        onBlur={(e) => onRecordLine(line.itemId, Number(e.target.value))}
                      />
                      <span className="text-xs text-on-surface-variant">counted</span>
                    </div>
                  ) : (
                    line.countedQuantity !== undefined && (
                      <p className="text-xs text-on-surface-variant">
                        Counted: {line.countedQuantity}
                        {line.variance !== undefined && line.variance !== 0 && (
                          <span className="ml-1.5 font-bold" style={{ color: line.variance < 0 ? "var(--pulse-coral)" : "var(--caution-amber)" }}>
                            ({line.variance > 0 ? "+" : ""}{line.variance})
                          </span>
                        )}
                      </p>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {count.status === "planned" && <Button size="sm" onClick={onStart}>Start Count (Freeze Stock)</Button>}
            {count.status === "in-progress" && <Button size="sm" onClick={onSubmitForReview}>Submit for Variance Review</Button>}
            {count.status === "variance-review" && <Button size="sm" onClick={onApproveAndAdjust}>Approve & Apply Adjustments</Button>}
          </div>
        </>
      )}
    </Drawer>
  );
}
