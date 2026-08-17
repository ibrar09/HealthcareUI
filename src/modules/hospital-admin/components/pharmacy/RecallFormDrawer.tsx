import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewRecallInput, Medication, BatchRow } from "@modules/hospital-admin/api";

interface RecallFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewRecallInput) => void;
  medications: Medication[];
  batches: BatchRow[];
}

/** Module-local — initiate a Medication Recall (spec §24): selecting the affected batches immediately quarantines them on submit — no window where recalled stock could still be dispensed. */
export function RecallFormDrawer({ open, onClose, onSubmit, medications, batches }: RecallFormDrawerProps) {
  const [medicationId, setMedicationId] = useState(medications[0]?.id ?? "");
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [manufacturer, setManufacturer] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setMedicationId(medications[0]?.id ?? "");
      setBatchIds([]);
      setManufacturer("");
      setReason("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const relevantBatches = batches.filter((b) => b.medicationId === medicationId);

  function toggleBatch(id: string) {
    setBatchIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Initiate Recall"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onSubmit({ medicationId, batchIds, manufacturer, reason });
              onClose();
            }}
            disabled={!medicationId || batchIds.length === 0 || !manufacturer.trim() || !reason.trim()}
          >
            Initiate Recall & Quarantine
          </Button>
        </div>
      }
    >
      <FormSection title="Recall">
        <div className="mb-4">
          <FormField label="Medication">
            <select
              className={formInputClass}
              value={medicationId}
              onChange={(e) => {
                setMedicationId(e.target.value);
                setBatchIds([]);
              }}
            >
              {medications.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.genericName} {m.strength}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Manufacturer">
            <input className={formInputClass} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g. GSK" />
          </FormField>
        </div>
        <div className="mb-4">
          <p className="mb-1.5 block text-xs font-semibold text-on-surface-variant">Affected Batches</p>
          {relevantBatches.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No batches on file for this medication.</p>
          ) : (
            <div className="rounded-xl border border-line divide-y divide-line">
              {relevantBatches.map((b) => (
                <label key={b.id} className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:bg-surface-container-low">
                  <input type="checkbox" className="accent-signal-indigo" checked={batchIds.includes(b.id)} onChange={() => toggleBatch(b.id)} />
                  <span className="text-sm text-on-surface">
                    {b.batchNumber} — {b.quantity} units, expires {b.expiryDate}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <FormField label="Reason">
          <textarea className={formInputClass} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Manufacturer-identified contamination risk" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
