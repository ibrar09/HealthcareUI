import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewReservationInput, ReservationReferenceType, InventoryItem } from "@modules/hospital-admin/api";

interface DepartmentOption {
  id: string;
  name: string;
}

function emptyValues(itemId: string): NewReservationInput {
  return { itemId, quantity: 1, reservedFor: "", referenceType: "other" };
}

interface ReservationFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewReservationInput) => void;
  items: InventoryItem[];
  departments: DepartmentOption[];
}

/** Module-local — create a Stock Reservation (spec §30). */
export function ReservationFormDrawer({ open, onClose, onSubmit, items, departments }: ReservationFormDrawerProps) {
  const [values, setValues] = useState<NewReservationInput>(emptyValues(items[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues(emptyValues(items[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewReservationInput>(key: K, value: NewReservationInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.itemId && values.quantity > 0 && values.reservedFor.trim();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Reservation"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Reserve Stock</Button>
        </div>
      }
    >
      <FormSection title="Item">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Item">
            <select className={formInputClass} value={values.itemId} onChange={(e) => set("itemId", e.target.value)}>
              {items.map((it) => (
                <option key={it.id} value={it.id}>{it.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Quantity">
            <input type="number" min={1} className={formInputClass} value={values.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Purpose">
        <div className="mb-4">
          <FormField label="Reserved For">
            <input className={formInputClass} value={values.reservedFor} onChange={(e) => set("reservedFor", e.target.value)} placeholder="e.g. OT Case — Tomorrow's list" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Reference Type">
            <select className={formInputClass} value={values.referenceType} onChange={(e) => set("referenceType", e.target.value as ReservationReferenceType)}>
              <option value="ot-case">OT Case</option>
              <option value="requisition">Requisition</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Department">
            <select className={formInputClass} value={values.departmentId ?? ""} onChange={(e) => set("departmentId", e.target.value || undefined)}>
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Needed By (optional)">
          <input type="date" className={formInputClass} value={values.neededBy ?? ""} onChange={(e) => set("neededBy", e.target.value || undefined)} />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
