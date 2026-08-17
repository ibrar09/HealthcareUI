import { Pencil, Plus, Power } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { BedTypeConfig } from "@modules/hospital-admin/api";

interface BedTypeConfigPanelProps {
  bedTypes: BedTypeConfig[];
  onAdd: () => void;
  onEdit: (bedType: BedTypeConfig) => void;
  onToggleActive: (bedType: BedTypeConfig) => void;
}

/** Module-local — Bed Management Phase 4 Configuration tab, Bed Types section (spec §5, §26). */
export function BedTypeConfigPanel({ bedTypes, onAdd, onEdit, onToggleActive }: BedTypeConfigPanelProps) {
  return (
    <Card hero>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface">Bed Types</h2>
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Bed Type
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {bedTypes.map((t) => (
          <div key={t.id} className={`flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 ${!t.active ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: t.accentColor }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {t.name} {!t.active && <span className="text-xs font-normal text-on-surface-variant">(Inactive)</span>}
                </p>
                {t.description && <p className="text-xs text-on-surface-variant truncate">{t.description}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => onEdit(t)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onToggleActive(t)}
                className={`p-2 rounded-lg transition-all ${t.active ? "text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral" : "text-vital-green hover:bg-vital-green/10"}`}
                title={t.active ? "Deactivate" : "Activate"}
              >
                <Power size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
