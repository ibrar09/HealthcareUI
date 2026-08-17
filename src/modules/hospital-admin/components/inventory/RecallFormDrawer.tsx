import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { InventoryItem, InventoryBatch } from "@modules/hospital-admin/api";

interface RecallFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { itemId: string; affectedBatchIds: string[]; manufacturer: string; reason: string }) => void;
  items: InventoryItem[];
  batches: InventoryBatch[];
}

/** Module-local — initiate a Recall (spec §39): Manufacturer Recall -> Affected Batch -> Quarantine Stock, immediately, no delay. */
export function RecallFormDrawer({ open, onClose, onSubmit, items, batches }: RecallFormDrawerProps) {
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [manufacturer, setManufacturer] = useState("");
  const [reason, setReason] = useState("");
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setItemId(items[0]?.id ?? "");
      setManufacturer("");
      setReason("");
      setSelectedBatchIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const itemBatches = batches.filter((b) => b.itemId === itemId && b.status !== "expired" && b.status !== "disposed");

  function toggleBatch(id: string) {
    setSelectedBatchIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  const canSubmit = itemId && manufacturer.trim() && reason.trim() && selectedBatchIds.length > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Initiate Recall"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => { onSubmit({ itemId, affectedBatchIds: selectedBatchIds, manufacturer, reason }); onClose(); }}
            disabled={!canSubmit}
          >
            Initiate Recall & Quarantine
          </Button>
        </div>
      }
    >
      <FormSection title="Recall">
        <div className="mb-4">
          <FormField label="Item">
            <select className={formInputClass} value={itemId} onChange={(e) => { setItemId(e.target.value); setSelectedBatchIds([]); }}>
              {items.map((it) => (
                <option key={it.id} value={it.id}>{it.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Manufacturer">
            <input className={formInputClass} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Recall Reason">
          <textarea className={formInputClass} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Sterility concern identified by manufacturer" />
        </FormField>
      </FormSection>

      <FormSection title="Affected Batches">
        <div className="flex flex-col gap-1.5">
          {itemBatches.length === 0 && <p className="text-sm text-on-surface-variant">No active batches for this item.</p>}
          {itemBatches.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm text-on-surface py-1">
              <input type="checkbox" className="accent-signal-indigo" checked={selectedBatchIds.includes(b.id)} onChange={() => toggleBatch(b.id)} />
              {b.batchNumber} <span className="text-xs text-on-surface-variant">({b.quantity} units)</span>
            </label>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
