import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewStockTransferInput, BatchRow, PharmacyLocation } from "@modules/hospital-admin/api";

function emptyValues(batchId: string, locationId: string): NewStockTransferInput {
  return { medicationId: "", batchId, quantity: 1, fromLocationId: locationId, toLocationId: "" };
}

interface StockTransferFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewStockTransferInput) => void;
  batches: BatchRow[];
  locations: PharmacyLocation[];
}

/** Module-local — request a Stock Transfer (spec §13). */
export function StockTransferFormDrawer({ open, onClose, onSubmit, batches, locations }: StockTransferFormDrawerProps) {
  const [values, setValues] = useState<NewStockTransferInput>(emptyValues(batches[0]?.id ?? "", locations[0]?.id ?? ""));

  useEffect(() => {
    if (open) {
      const firstBatch = batches[0];
      setValues({ medicationId: firstBatch?.medicationId ?? "", batchId: firstBatch?.id ?? "", quantity: 1, fromLocationId: locations[0]?.id ?? "", toLocationId: locations[1]?.id ?? locations[0]?.id ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof NewStockTransferInput>(key: K, value: NewStockTransferInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function selectBatch(batchId: string) {
    const batch = batches.find((b) => b.id === batchId);
    setValues((v) => ({ ...v, batchId, medicationId: batch?.medicationId ?? v.medicationId }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request Stock Transfer"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(values);
              onClose();
            }}
            disabled={!values.batchId || values.quantity <= 0 || values.fromLocationId === values.toLocationId}
          >
            Request Transfer
          </Button>
        </div>
      }
    >
      <FormSection title="Transfer">
        <div className="mb-4">
          <FormField label="Batch">
            <select className={formInputClass} value={values.batchId} onChange={(e) => selectBatch(e.target.value)}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.medicationName} — {b.batchNumber} ({b.quantity} available)
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Quantity">
            <input type="number" min={1} className={formInputClass} value={values.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="From">
            <select className={formInputClass} value={values.fromLocationId} onChange={(e) => set("fromLocationId", e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="To">
            <select className={formInputClass} value={values.toLocationId} onChange={(e) => set("toLocationId", e.target.value)}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
