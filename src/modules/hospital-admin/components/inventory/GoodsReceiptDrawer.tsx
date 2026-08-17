import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { InventoryPurchaseOrderStatus, PurchaseOrderItemLine, Warehouse, GoodsReceiptLine } from "@modules/hospital-admin/api";

type PurchaseOrderDetail = {
  id: string;
  poNumber: string;
  supplierName: string;
  status: InventoryPurchaseOrderStatus;
  items: (PurchaseOrderItemLine & { itemName: string })[];
};

interface GoodsReceiptDrawerProps {
  purchaseOrder: PurchaseOrderDetail | null;
  onClose: () => void;
  onSubmit: (lines: GoodsReceiptLine[], warehouseId: string) => void;
  warehouses: Warehouse[];
}

/** Module-local — Goods Receiving + Partial Receiving (spec §23-24): verify item/qty/batch/expiry/damaged per line, Accept/Reject, never assumes full delivery. */
export function GoodsReceiptDrawer({ purchaseOrder, onClose, onSubmit, warehouses }: GoodsReceiptDrawerProps) {
  const [lines, setLines] = useState<GoodsReceiptLine[]>([]);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");

  useEffect(() => {
    if (purchaseOrder) {
      setLines(
        purchaseOrder.items
          .filter((l) => l.quantityReceived < l.quantityOrdered)
          .map((l) => ({ itemId: l.itemId, quantityOrdered: l.quantityOrdered - l.quantityReceived, quantityReceived: l.quantityOrdered - l.quantityReceived, quantityDamaged: 0, batchNumber: "", expiryDate: "", accepted: true }))
      );
      setWarehouseId(warehouses[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder?.id]);

  function updateLine(index: number, patch: Partial<GoodsReceiptLine>) {
    setLines((l) => l.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  const canSubmit = warehouseId && lines.length > 0 && lines.every((l) => l.quantityReceived >= 0);

  return (
    <Drawer
      open={Boolean(purchaseOrder)}
      onClose={onClose}
      title="Receive Goods"
      subtitle={purchaseOrder ? `${purchaseOrder.poNumber} · ${purchaseOrder.supplierName}` : undefined}
      widthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(lines, warehouseId); onClose(); }} disabled={!canSubmit}>
            Accept & Add to Inventory
          </Button>
        </div>
      }
    >
      <FormSection title="Receiving Warehouse">
        <FormField label="Warehouse">
          <select className={formInputClass} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Lines">
        <div className="flex flex-col gap-5">
          {purchaseOrder?.items.map((poLine, i) => {
            const line = lines[i];
            if (!line) return null;
            return (
              <div key={poLine.itemId} className="rounded-card border border-line p-3.5">
                <p className="text-sm font-bold text-on-surface mb-2">{poLine.itemName} <span className="text-xs font-normal text-on-surface-variant">(ordered {poLine.quantityOrdered - poLine.quantityReceived} more)</span></p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <FormField label="Quantity Received">
                    <input type="number" min={0} className={formInputClass} value={line.quantityReceived} onChange={(e) => updateLine(i, { quantityReceived: Number(e.target.value) })} />
                  </FormField>
                  <FormField label="Quantity Damaged">
                    <input type="number" min={0} className={formInputClass} value={line.quantityDamaged} onChange={(e) => updateLine(i, { quantityDamaged: Number(e.target.value) })} />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <FormField label="Batch Number (optional)">
                    <input className={formInputClass} value={line.batchNumber ?? ""} onChange={(e) => updateLine(i, { batchNumber: e.target.value || undefined })} />
                  </FormField>
                  <FormField label="Expiry Date (optional)">
                    <input type="date" className={formInputClass} value={line.expiryDate ?? ""} onChange={(e) => updateLine(i, { expiryDate: e.target.value || undefined })} />
                  </FormField>
                </div>
                <label className="flex items-center gap-2 text-sm text-on-surface">
                  <input type="checkbox" className="accent-signal-indigo" checked={line.accepted} onChange={(e) => updateLine(i, { accepted: e.target.checked })} />
                  Accept into inventory
                </label>
              </div>
            );
          })}
          {lines.length === 0 && <p className="text-sm text-on-surface-variant">This purchase order is already fully received.</p>}
        </div>
      </FormSection>
    </Drawer>
  );
}
