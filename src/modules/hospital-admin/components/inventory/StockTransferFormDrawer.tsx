import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewTransferInput, InventoryItem, Warehouse } from "@modules/hospital-admin/api";

function emptyValues(fromWarehouseId: string, toWarehouseId: string): NewTransferInput {
  return { fromWarehouseId, toWarehouseId, items: [], requestedBy: "" };
}

interface StockTransferFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewTransferInput) => void;
  items: InventoryItem[];
  warehouses: Warehouse[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — create a Stock Transfer (spec §25): warehouse -> warehouse, single item + quantity. */
export function StockTransferFormDrawer({ open, onClose, onSubmit, items, warehouses, staffOptions }: StockTransferFormDrawerProps) {
  const [values, setValues] = useState<NewTransferInput>(emptyValues(warehouses[0]?.id ?? "", warehouses[1]?.id ?? warehouses[0]?.id ?? ""));
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(warehouses[0]?.id ?? "", warehouses[1]?.id ?? warehouses[0]?.id ?? ""), requestedBy: staffOptions[0]?.id ?? "" });
      setItemId(items[0]?.id ?? "");
      setQuantity(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewTransferInput>(key: K, value: NewTransferInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.fromWarehouseId && values.toWarehouseId && values.fromWarehouseId !== values.toWarehouseId && itemId && quantity > 0 && values.requestedBy;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Stock Transfer"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit({ ...values, items: [{ itemId, quantity }] }); onClose(); }} disabled={!canSubmit}>Submit Transfer</Button>
        </div>
      }
    >
      <FormSection title="Route">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="From Warehouse">
            <select className={formInputClass} value={values.fromWarehouseId} onChange={(e) => set("fromWarehouseId", e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="To Warehouse">
            <select className={formInputClass} value={values.toWarehouseId} onChange={(e) => set("toWarehouseId", e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Item">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Item">
            <select className={formInputClass} value={itemId} onChange={(e) => setItemId(e.target.value)}>
              {items.map((it) => (
                <option key={it.id} value={it.id}>{it.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Quantity">
            <input type="number" min={1} className={formInputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </FormField>
        </div>
        <FormField label="Requested By">
          <select className={formInputClass} value={values.requestedBy} onChange={(e) => set("requestedBy", e.target.value)}>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
