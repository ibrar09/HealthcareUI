import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewInventoryPurchaseOrderInput, PurchaseOrderItemLine, InventoryItem, InventorySupplier } from "@modules/hospital-admin/api";

function emptyValues(supplierId: string, createdBy: string): NewInventoryPurchaseOrderInput {
  return { supplierId, items: [], createdBy };
}

interface PurchaseOrderFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewInventoryPurchaseOrderInput) => void;
  items: InventoryItem[];
  suppliers: InventorySupplier[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — create a Purchase Order (spec §21): Purchase Request -> Approval -> Purchase Order -> Supplier -> Delivery. */
export function PurchaseOrderFormDrawer({ open, onClose, onSubmit, items, suppliers, staffOptions }: PurchaseOrderFormDrawerProps) {
  const [values, setValues] = useState<NewInventoryPurchaseOrderInput>(emptyValues(suppliers[0]?.id ?? "", staffOptions[0]?.id ?? ""));
  const [lines, setLines] = useState<PurchaseOrderItemLine[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");

  useEffect(() => {
    if (open) {
      setValues(emptyValues(suppliers[0]?.id ?? "", staffOptions[0]?.id ?? ""));
      setLines(items[0] ? [{ itemId: items[0].id, quantityOrdered: 10, quantityReceived: 0, unitPrice: items[0].unitCost }] : []);
      setDeliveryDate("");
      setPaymentTerms("Net 30");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewInventoryPurchaseOrderInput>(key: K, value: NewInventoryPurchaseOrderInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addLine() {
    if (!items[0]) return;
    setLines((l) => [...l, { itemId: items[0].id, quantityOrdered: 10, quantityReceived: 0, unitPrice: items[0].unitCost }]);
  }
  function removeLine(index: number) {
    setLines((l) => l.filter((_, i) => i !== index));
  }
  function updateLine(index: number, patch: Partial<PurchaseOrderItemLine>) {
    setLines((l) => l.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  const total = lines.reduce((sum, l) => sum + l.quantityOrdered * l.unitPrice, 0);
  const canSubmit = values.supplierId && lines.length > 0 && lines.every((l) => l.quantityOrdered > 0);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Purchase Order"
      widthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-on-surface-variant">Subtotal: <span className="font-mono font-bold text-on-surface">${total.toFixed(2)}</span></span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => {
                onSubmit({ ...values, items: lines, deliveryDate: deliveryDate || undefined, paymentTerms });
                onClose();
              }}
              disabled={!canSubmit}
            >
              Create Purchase Order
            </Button>
          </div>
        </div>
      }
    >
      <FormSection title="Order">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Supplier">
            <select className={formInputClass} value={values.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Created By">
            <select className={formInputClass} value={values.createdBy} onChange={(e) => set("createdBy", e.target.value)}>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Delivery Date (optional)">
            <input type="date" className={formInputClass} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </FormField>
          <FormField label="Payment Terms">
            <input className={formInputClass} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g. Net 30" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Line Items">
        <div className="flex flex-col gap-3">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                className={`${formInputClass} flex-1`}
                value={line.itemId}
                onChange={(e) => {
                  const item = items.find((it) => it.id === e.target.value);
                  updateLine(i, { itemId: e.target.value, unitPrice: item?.unitCost ?? line.unitPrice });
                }}
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
              <input type="number" min={1} className={`${formInputClass} w-20`} value={line.quantityOrdered} onChange={(e) => updateLine(i, { quantityOrdered: Number(e.target.value) })} />
              <input type="number" min={0} step={0.01} className={`${formInputClass} w-24`} value={line.unitPrice} onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })} />
              <button type="button" onClick={() => removeLine(i)} className="rounded-lg p-2 text-pulse-coral hover:bg-pulse-coral/10 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLine}>
            <Plus size={14} /> Add Line
          </Button>
        </div>
      </FormSection>
    </Drawer>
  );
}
