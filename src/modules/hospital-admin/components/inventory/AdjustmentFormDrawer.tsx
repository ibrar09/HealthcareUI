import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewInventoryAdjustmentInput, AdjustmentReason, InventoryItem, Warehouse } from "@modules/hospital-admin/api";

const reasons: AdjustmentReason[] = ["count-variance", "damage", "expiry", "theft-loss", "correction", "other"];

function emptyValues(itemId: string, warehouseId: string, requestedBy: string): NewInventoryAdjustmentInput {
  return { itemId, warehouseId, quantityChange: 0, reason: "correction", requestedBy };
}

interface AdjustmentFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewInventoryAdjustmentInput) => void;
  items: InventoryItem[];
  warehouses: Warehouse[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — request a Stock Adjustment (spec §27): reason + quantity + user always required; large changes route to approval before applying. */
export function AdjustmentFormDrawer({ open, onClose, onSubmit, items, warehouses, staffOptions }: AdjustmentFormDrawerProps) {
  const [values, setValues] = useState<NewInventoryAdjustmentInput>(emptyValues(items[0]?.id ?? "", warehouses[0]?.id ?? "", staffOptions[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(items[0]?.id ?? "", warehouses[0]?.id ?? "", staffOptions[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewInventoryAdjustmentInput>(key: K, value: NewInventoryAdjustmentInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.itemId && values.warehouseId && values.quantityChange !== 0 && values.requestedBy;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Submit Adjustment</Button>
        </div>
      }
    >
      <FormSection title="Item & Location">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Item">
            <select className={formInputClass} value={values.itemId} onChange={(e) => set("itemId", e.target.value)}>
              {items.map((it) => (
                <option key={it.id} value={it.id}>{it.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Warehouse">
            <select className={formInputClass} value={values.warehouseId} onChange={(e) => set("warehouseId", e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Adjustment">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Quantity Change (+/-)">
            <input type="number" className={formInputClass} value={values.quantityChange} onChange={(e) => set("quantityChange", Number(e.target.value))} placeholder="e.g. -5" />
          </FormField>
          <FormField label="Reason">
            <select className={formInputClass} value={values.reason} onChange={(e) => set("reason", e.target.value as AdjustmentReason)}>
              {reasons.map((r) => (
                <option key={r} value={r}>{r.replace(/-/g, " ")}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Note">
          <textarea className={formInputClass} rows={2} value={values.note ?? ""} onChange={(e) => set("note", e.target.value || undefined)} placeholder="Explain the discrepancy..." />
        </FormField>
        {Math.abs(values.quantityChange) >= 20 && (
          <p className="mt-3 text-xs text-caution-amber font-semibold">Adjustments of 20 or more units require a second approver before they apply.</p>
        )}
      </FormSection>
    </Drawer>
  );
}
