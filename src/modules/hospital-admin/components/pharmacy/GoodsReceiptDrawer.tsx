import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { PurchaseOrderRow, PharmacyLocation } from "@modules/hospital-admin/api";

interface GoodsReceiptDrawerProps {
  purchaseOrder: PurchaseOrderRow | null;
  onClose: () => void;
  onComplete: () => void;
  locations: PharmacyLocation[];
}

/** Module-local — Goods Receiving (spec §16): verify quantity/batch/expiry, then create the real Batch — inventory only ever grows through a receipt like this. */
export function GoodsReceiptDrawer({ purchaseOrder, onClose, onComplete, locations }: GoodsReceiptDrawerProps) {
  const [itemId, setItemId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [storageLocationId, setStorageLocationId] = useState(locations[0]?.id ?? "");

  useEffect(() => {
    if (purchaseOrder) {
      const remaining = purchaseOrder.items[0];
      setItemId(remaining?.id ?? "");
      setBatchNumber("");
      setQuantity(remaining ? remaining.quantity - remaining.quantityReceived : 0);
      setManufacturingDate("");
      setExpiryDate("");
      setStorageLocationId(locations[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder?.id]);

  async function handleSubmit() {
    if (!purchaseOrder || !batchNumber.trim() || quantity <= 0 || !expiryDate || !manufacturingDate) return;
    await api.receiveGoods({ purchaseOrderId: purchaseOrder.id, itemId, batchNumber: batchNumber.trim(), quantity, expiryDate, manufacturingDate, storageLocationId });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(purchaseOrder)}
      onClose={onClose}
      title="Receive Goods"
      subtitle={purchaseOrder ? `${purchaseOrder.poNumber} · ${purchaseOrder.supplierName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!batchNumber.trim() || quantity <= 0 || !expiryDate || !manufacturingDate}>
            Accept & Add to Inventory
          </Button>
        </div>
      }
    >
      <FormSection title="Receipt">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Batch Number">
            <input className={formInputClass} value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="e.g. B-2026-020" />
          </FormField>
          <FormField label="Quantity Received">
            <input type="number" min={1} className={formInputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Manufacturing Date">
            <input type="date" className={formInputClass} value={manufacturingDate} onChange={(e) => setManufacturingDate(e.target.value)} />
          </FormField>
          <FormField label="Expiry Date">
            <input type="date" className={formInputClass} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Storage Location">
          <select className={formInputClass} value={storageLocationId} onChange={(e) => setStorageLocationId(e.target.value)}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
