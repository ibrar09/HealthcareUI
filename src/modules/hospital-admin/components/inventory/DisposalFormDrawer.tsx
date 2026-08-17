import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { DisposalMethod, InventoryItem, InventoryBatch } from "@modules/hospital-admin/api";

const methods: DisposalMethod[] = ["incineration", "return-to-supplier", "landfill", "recycling", "other"];

interface DisposalFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { itemId: string; batchId?: string; quantity: number; reason: string; method: DisposalMethod; authorizedBy: string; witnessedBy?: string }) => void;
  items: InventoryItem[];
  batches: InventoryBatch[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — record a Disposal (spec §41): expired/damaged stock, always with reason/method/authorized personnel. */
export function DisposalFormDrawer({ open, onClose, onSubmit, items, batches, staffOptions }: DisposalFormDrawerProps) {
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [batchId, setBatchId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<DisposalMethod>("incineration");
  const [authorizedBy, setAuthorizedBy] = useState(staffOptions[0]?.id ?? "");
  const [witnessedBy, setWitnessedBy] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setItemId(items[0]?.id ?? "");
      setBatchId(undefined);
      setQuantity(1);
      setReason("");
      setMethod("incineration");
      setAuthorizedBy(staffOptions[0]?.id ?? "");
      setWitnessedBy(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const itemBatches = batches.filter((b) => b.itemId === itemId && b.quantity > 0);
  const canSubmit = itemId && quantity > 0 && reason.trim() && authorizedBy;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Record Disposal"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => { onSubmit({ itemId, batchId, quantity, reason, method, authorizedBy, witnessedBy }); onClose(); }}
            disabled={!canSubmit}
          >
            Confirm Disposal
          </Button>
        </div>
      }
    >
      <FormSection title="Item & Batch">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Item">
            <select className={formInputClass} value={itemId} onChange={(e) => { setItemId(e.target.value); setBatchId(undefined); }}>
              {items.map((it) => (
                <option key={it.id} value={it.id}>{it.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Batch (optional)">
            <select className={formInputClass} value={batchId ?? ""} onChange={(e) => setBatchId(e.target.value || undefined)}>
              <option value="">Not batch-specific</option>
              {itemBatches.map((b) => (
                <option key={b.id} value={b.id}>{b.batchNumber} ({b.quantity} units)</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Quantity">
          <input type="number" min={1} className={formInputClass} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </FormField>
      </FormSection>

      <FormSection title="Disposal">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Method">
            <select className={formInputClass} value={method} onChange={(e) => setMethod(e.target.value as DisposalMethod)}>
              {methods.map((m) => (
                <option key={m} value={m}>{m.replace(/-/g, " ")}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Reason">
            <input className={formInputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Expired, unsellable" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Authorized By">
            <select className={formInputClass} value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)}>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Witnessed By (optional)">
            <select className={formInputClass} value={witnessedBy ?? ""} onChange={(e) => setWitnessedBy(e.target.value || undefined)}>
              <option value="">—</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FormField>
        </div>
      </FormSection>
    </Drawer>
  );
}
