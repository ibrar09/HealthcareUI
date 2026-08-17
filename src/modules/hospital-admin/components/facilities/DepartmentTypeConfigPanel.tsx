import { Pencil, Plus, Power } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { DepartmentTypeConfig } from "@modules/hospital-admin/api";

interface DepartmentTypeConfigPanelProps {
  departmentTypes: DepartmentTypeConfig[];
  onAdd: () => void;
  onEdit: (type: DepartmentTypeConfig) => void;
  onToggleActive: (type: DepartmentTypeConfig) => void;
}

/** Module-local — Department Types (spec §5): a configurable classification lookup, not a hardcoded "every department is clinical" assumption. */
export function DepartmentTypeConfigPanel({ departmentTypes, onAdd, onEdit, onToggleActive }: DepartmentTypeConfigPanelProps) {
  return (
    <Card hero>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface">Department Types</h2>
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Type
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {departmentTypes.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-full border border-line pl-3 pr-1.5 py-1.5 ${!t.active ? "opacity-50" : ""}`}
          >
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.accentColor }} />
            <span className="text-xs font-semibold text-on-surface">
              {t.name} {!t.active && <span className="font-normal text-on-surface-variant">(Inactive)</span>}
            </span>
            <button type="button" onClick={() => onEdit(t)} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" title="Edit">
              <Pencil size={11} />
            </button>
            <button
              type="button"
              onClick={() => onToggleActive(t)}
              className={`p-1 rounded-full ${t.active ? "text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral" : "text-vital-green hover:bg-vital-green/10"}`}
              title={t.active ? "Deactivate" : "Activate"}
            >
              <Power size={11} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
