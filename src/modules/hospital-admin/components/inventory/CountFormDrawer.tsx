import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewCountInput, InventoryItem, Warehouse } from "@modules/hospital-admin/api";

interface CountFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewCountInput) => void;
  items: InventoryItem[];
  warehouses: Warehouse[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — schedule a Physical Stock Count (spec §28): pick warehouse, items in scope, and date. */
export function CountFormDrawer({ open, onClose, onSubmit, items, warehouses, staffOptions }: CountFormDrawerProps) {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [scheduledDate, setScheduledDate] = useState("");
  const [createdBy, setCreatedBy] = useState(staffOptions[0]?.id ?? "");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setWarehouseId(warehouses[0]?.id ?? "");
      setScheduledDate("");
      setCreatedBy(staffOptions[0]?.id ?? "");
      setSelectedItemIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleItem(id: string) {
    setSelectedItemIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  const canSubmit = warehouseId && scheduledDate && createdBy && selectedItemIds.length > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Schedule Inventory Count"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit({ warehouseId, scheduledDate, createdBy, itemIds: selectedItemIds }); onClose(); }} disabled={!canSubmit}>
            Schedule Count
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Warehouse">
            <select className={formInputClass} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Scheduled Date">
            <input type="date" className={formInputClass} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Created By">
          <select className={formInputClass} value={createdBy} onChange={(e) => setCreatedBy(e.target.value)}>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Items in Scope">
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {items.map((it) => (
            <label key={it.id} className="flex items-center gap-2 text-sm text-on-surface py-1">
              <input type="checkbox" className="accent-signal-indigo" checked={selectedItemIds.includes(it.id)} onChange={() => toggleItem(it.id)} />
              {it.name}
            </label>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
