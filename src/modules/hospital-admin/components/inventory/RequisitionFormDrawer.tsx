import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewRequisitionInput, RequisitionPriority, InventoryItem } from "@modules/hospital-admin/api";

interface DepartmentOption {
  id: string;
  name: string;
}

function emptyValues(departmentId: string): NewRequisitionInput {
  return { departmentId, requestedBy: "", priority: "routine", items: [], reason: "" };
}

interface RequisitionFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewRequisitionInput) => void;
  items: InventoryItem[];
  departments: DepartmentOption[];
  staffOptions: { id: string; name: string }[];
}

const priorities: RequisitionPriority[] = ["routine", "urgent", "emergency"];

/** Module-local — create a Requisition (spec §18): department -> items -> reason, multi-line. */
export function RequisitionFormDrawer({ open, onClose, onSubmit, items, departments, staffOptions }: RequisitionFormDrawerProps) {
  const [values, setValues] = useState<NewRequisitionInput>(emptyValues(departments[0]?.id ?? ""));

  useEffect(() => {
    if (open) setValues({ ...emptyValues(departments[0]?.id ?? ""), requestedBy: staffOptions[0]?.id ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewRequisitionInput>(key: K, value: NewRequisitionInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addLine() {
    if (!items[0]) return;
    setValues((v) => ({ ...v, items: [...v.items, { itemId: items[0].id, quantityRequested: 1 }] }));
  }
  function removeLine(index: number) {
    setValues((v) => ({ ...v, items: v.items.filter((_, i) => i !== index) }));
  }
  function updateLine(index: number, patch: Partial<{ itemId: string; quantityRequested: number }>) {
    setValues((v) => ({ ...v, items: v.items.map((line, i) => (i === index ? { ...line, ...patch } : line)) }));
  }

  const canSubmit = values.departmentId && values.requestedBy && values.reason.trim() && values.items.length > 0 && values.items.every((l) => l.quantityRequested > 0);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Requisition"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSubmit(values); onClose(); }} disabled={!canSubmit}>Submit Requisition</Button>
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
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={2} value={values.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. Weekly ward restock" />
        </FormField>
      </FormSection>

      <FormSection title="Items">
        <div className="flex flex-col gap-3">
          {values.items.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <select className={`${formInputClass} flex-1`} value={line.itemId} onChange={(e) => updateLine(i, { itemId: e.target.value })}>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
              <input type="number" min={1} className={`${formInputClass} w-24`} value={line.quantityRequested} onChange={(e) => updateLine(i, { quantityRequested: Number(e.target.value) })} />
              <button type="button" onClick={() => removeLine(i)} className="rounded-lg p-2 text-pulse-coral hover:bg-pulse-coral/10 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLine}>
            <Plus size={14} /> Add Item
          </Button>
        </div>
      </FormSection>
    </Drawer>
  );
}
