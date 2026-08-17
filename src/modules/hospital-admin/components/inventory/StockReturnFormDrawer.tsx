import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewStockReturnInput, ReturnDirection, ReturnReason, InventoryItem, Warehouse, InventorySupplier } from "@modules/hospital-admin/api";

interface DepartmentOption {
  id: string;
  name: string;
}

const reasons: ReturnReason[] = ["excess", "wrong-item", "damaged", "recall", "expiry", "quality-issue"];

function emptyValues(): NewStockReturnInput {
  return { direction: "department-to-store", items: [], reason: "excess", requestedBy: "" };
}

interface StockReturnFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewStockReturnInput) => void;
  items: InventoryItem[];
  warehouses: Warehouse[];
  departments: DepartmentOption[];
  suppliers: InventorySupplier[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — create a Stock Return (spec §26): Department->Store or Store->Supplier, single item + reason. */
export function StockReturnFormDrawer({ open, onClose, onSubmit, items, warehouses, departments, suppliers, staffOptions }: StockReturnFormDrawerProps) {
  const [values, setValues] = useState<NewStockReturnInput>(emptyValues());
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(), fromDepartmentId: departments[0]?.id, toWarehouseId: warehouses[0]?.id, requestedBy: staffOptions[0]?.id ?? "" });
      setItemId(items[0]?.id ?? "");
      setQuantity(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewStockReturnInput>(key: K, value: NewStockReturnInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = itemId && quantity > 0 && values.requestedBy && (values.direction === "department-to-store" ? values.fromDepartmentId && values.toWarehouseId : values.supplierId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Stock Return"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit({ ...values, items: [{ itemId, quantity }] }); onClose(); }} disabled={!canSubmit}>Submit Return</Button>
        </div>
      }
    >
      <FormSection title="Direction">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Return Type">
            <select className={formInputClass} value={values.direction} onChange={(e) => set("direction", e.target.value as ReturnDirection)}>
              <option value="department-to-store">Department → Store</option>
              <option value="store-to-supplier">Store → Supplier</option>
            </select>
          </FormField>
          <FormField label="Reason">
            <select className={formInputClass} value={values.reason} onChange={(e) => set("reason", e.target.value as ReturnReason)}>
              {reasons.map((r) => (
                <option key={r} value={r}>{r.replace(/-/g, " ")}</option>
              ))}
            </select>
          </FormField>
        </div>
        {values.direction === "department-to-store" ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="From Department">
              <select className={formInputClass} value={values.fromDepartmentId ?? ""} onChange={(e) => set("fromDepartmentId", e.target.value)}>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="To Warehouse">
              <select className={formInputClass} value={values.toWarehouseId ?? ""} onChange={(e) => set("toWarehouseId", e.target.value)}>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        ) : (
          <FormField label="Supplier">
            <select className={formInputClass} value={values.supplierId ?? ""} onChange={(e) => set("supplierId", e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
        )}
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
