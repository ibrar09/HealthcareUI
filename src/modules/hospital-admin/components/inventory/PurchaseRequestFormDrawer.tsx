import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewPurchaseRequestInput, RequisitionPriority, InventoryItem } from "@modules/hospital-admin/api";

interface DepartmentOption {
  id: string;
  name: string;
}

function emptyValues(departmentId: string): NewPurchaseRequestInput {
  return { departmentId, requestedBy: "", items: [], reason: "", priority: "routine" };
}

interface PurchaseRequestFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewPurchaseRequestInput) => void;
  items: InventoryItem[];
  departments: DepartmentOption[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — create a Purchase Request (spec §20): Low Stock -> Reorder Alert -> Purchase Request -> Approval. */
export function PurchaseRequestFormDrawer({ open, onClose, onSubmit, items, departments, staffOptions }: PurchaseRequestFormDrawerProps) {
  const [values, setValues] = useState<NewPurchaseRequestInput>(emptyValues(departments[0]?.id ?? ""));
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(departments[0]?.id ?? ""), requestedBy: staffOptions[0]?.id ?? "" });
      setItemId(items[0]?.id ?? "");
      setQuantity(10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewPurchaseRequestInput>(key: K, value: NewPurchaseRequestInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const selectedItem = items.find((i) => i.id === itemId);
  const canSubmit = values.departmentId && values.requestedBy && values.reason.trim() && itemId && quantity > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Purchase Request"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmit({ ...values, items: [{ itemId, quantity, estimatedCost: selectedItem ? Math.round(selectedItem.unitCost * quantity * 100) / 100 : undefined }] });
              onClose();
            }}
            disabled={!canSubmit}
          >
            Submit Request
          </Button>
        </div>
      }
    >
      <FormSection title="Request">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Department">
            <select className={formInputClass} value={values.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Requested By">
            <select className={formInputClass} value={values.requestedBy} onChange={(e) => set("requestedBy", e.target.value)}>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Priority">
            <select className={formInputClass} value={values.priority} onChange={(e) => set("priority", e.target.value as RequisitionPriority)}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={2} value={values.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. Reorder alert triggered" />
        </FormField>
      </FormSection>

      <FormSection title="Item">
        <div className="grid grid-cols-2 gap-4">
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
      </FormSection>
    </Drawer>
  );
}
