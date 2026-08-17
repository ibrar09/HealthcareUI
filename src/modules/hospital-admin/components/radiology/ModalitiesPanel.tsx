import { Pencil, Plus, Power, Wrench } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { modalityStatusMeta } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { ModalityRow, ModalityStatus } from "@modules/hospital-admin/api";

interface ModalitiesPanelProps {
  modalities: ModalityRow[];
  onAdd: () => void;
  onEdit: (modality: ModalityRow) => void;
  onSetStatus: (modality: ModalityRow, status: ModalityStatus) => void;
}

const statusCycle: ModalityStatus[] = ["operational", "limited", "maintenance", "offline"];

/** Module-local — Radiology "Modalities" tab (spec §12-13): a configurable equipment registry, never a static dropdown. */
export function ModalitiesPanel({ modalities, onAdd, onEdit, onSetStatus }: ModalitiesPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Modality
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modalities.map((m) => {
          const meta = modalityStatusMeta[m.status];
          return (
            <Card key={m.id} hero accentColor={meta.color}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span>{meta.dot}</span> {m.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {m.manufacturer} {m.model}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => onEdit(m)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                    <Pencil size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Status</p>
                  <p className="text-sm font-semibold" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Today's Studies</p>
                  <p className="text-sm font-semibold text-on-surface">{m.studiesToday}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Utilization</p>
                  <p className="text-sm font-semibold text-on-surface">{m.utilizationPercent}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4">
                <span>Room {m.roomNumber ?? "—"}</span>
                <span>
                  Next Maintenance: <span className="font-medium text-on-surface">{m.nextMaintenance}</span>
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {statusCycle
                  .filter((s) => s !== m.status)
                  .map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => onSetStatus(m, s)} icon={s === "maintenance" ? <Wrench size={12} /> : <Power size={12} />}>
                      Set {modalityStatusMeta[s].label}
                    </Button>
                  ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
