import { Plus, ShieldAlert } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { recallStatusMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { MedicationRecallRow } from "@modules/hospital-admin/api";

interface RecallsPanelProps {
  recalls: MedicationRecallRow[];
  onAdd: () => void;
  onClose: (recall: MedicationRecallRow) => void;
}

/** Module-local — Medication Recall (spec §24): Manufacturer → Recall → affected medication/batch → quarantine, and flags any prior dispensing records of the recalled medication for review. */
export function RecallsPanel({ recalls, onAdd, onClose }: RecallsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Initiate Recall
        </Button>
      </div>
      {recalls.length === 0 ? (
        <Card hero>
          <p className="text-center text-sm text-on-surface-variant py-12">No active or past recalls.</p>
        </Card>
      ) : (
        recalls.map((r) => {
          const meta = recallStatusMeta[r.status];
          return (
            <Card key={r.id} hero accentColor={meta.color}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-pulse-coral flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{r.medicationName}</h3>
                    <p className="text-xs text-on-surface-variant">{r.manufacturer}</p>
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-sm text-on-surface mb-3">{r.reason}</p>
              <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Affected Batches</p>
                  <p className="font-semibold text-on-surface">{r.batchIds.length}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Prior Dispensing</p>
                  <p className="font-semibold text-pulse-coral">{r.affectedDispensedCount} flagged</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Initiated</p>
                  <p className="font-semibold text-on-surface">{formatDateTime(r.initiatedAt)}</p>
                </div>
              </div>
              {r.status !== "closed" && (
                <Button size="sm" variant="outline" onClick={() => onClose(r)}>
                  Close Recall
                </Button>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
