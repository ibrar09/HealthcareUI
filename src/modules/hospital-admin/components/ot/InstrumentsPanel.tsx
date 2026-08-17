import { Pencil, Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { instrumentStatusMeta } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { InstrumentSet, InstrumentStatus } from "@modules/hospital-admin/api";

interface InstrumentsPanelProps {
  sets: InstrumentSet[];
  onAdd: () => void;
  onEdit: (set: InstrumentSet) => void;
  onSetStatus: (set: InstrumentSet, status: InstrumentStatus) => void;
}

const statusCycle: InstrumentStatus[] = ["available", "sterilization", "in-use", "contaminated", "damaged", "maintenance"];

/** Module-local — Instrument Set registry (spec §22): sterilization status/validity tracked separately from overall availability status. */
export function InstrumentsPanel({ sets, onAdd, onEdit, onSetStatus }: InstrumentsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Instrument Set
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sets.map((s) => {
          const meta = instrumentStatusMeta[s.status];
          return (
            <Card key={s.id} hero accentColor={meta.color}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-on-surface">{s.name}</h3>
                  <p className="text-xs text-on-surface-variant">{s.setId}</p>
                </div>
                <button type="button" onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Status</p>
                  <p className="font-semibold" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Sterilization</p>
                  <p className="font-semibold text-on-surface capitalize">{s.sterilizationStatus.replace("-", " ")}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-on-surface-variant">Valid Until</p>
                  <p className="font-semibold text-on-surface">{s.sterilizationExpiry}</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">{s.location}</p>
              <div className="flex gap-1.5 flex-wrap">
                {statusCycle
                  .filter((st) => st !== s.status)
                  .map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onSetStatus(s, st)}
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold border border-line text-on-surface-variant hover:bg-surface-container-low transition-all"
                    >
                      {instrumentStatusMeta[st].label}
                    </button>
                  ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
