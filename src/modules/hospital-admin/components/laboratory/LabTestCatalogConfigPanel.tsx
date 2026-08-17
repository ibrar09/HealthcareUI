import { Pencil, Plus, Power } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { LabTestCatalogEntry } from "@modules/hospital-admin/api";

interface LabTestCatalogConfigPanelProps {
  catalog: LabTestCatalogEntry[];
  onAdd: () => void;
  onEdit: (entry: LabTestCatalogEntry) => void;
  onToggleActive: (entry: LabTestCatalogEntry) => void;
}

/** Module-local — Laboratory "Test Catalog" tab: a configurable lookup (LOINC-coded), never hardcoded — same pattern as Bed Types/Department Types. */
export function LabTestCatalogConfigPanel({ catalog, onAdd, onEdit, onToggleActive }: LabTestCatalogConfigPanelProps) {
  return (
    <Card hero>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface">Test Catalog</h2>
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Test
        </Button>
      </div>
      <div className="rounded-xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="text-left px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Code</th>
              <th className="text-left px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Name</th>
              <th className="text-left px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Category</th>
              <th className="text-left px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Specimen</th>
              <th className="text-left px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reference Range</th>
              <th className="text-left px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">TAT</th>
              <th className="text-right px-3.5 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {catalog.map((t) => (
              <tr key={t.id} className={!t.active ? "opacity-50" : ""}>
                <td className="px-3.5 py-2.5 font-mono text-xs font-bold text-on-surface">{t.code}</td>
                <td className="px-3.5 py-2.5 font-medium text-on-surface">
                  {t.name} {!t.active && <span className="text-xs font-normal text-on-surface-variant">(Inactive)</span>}
                  {t.panelComponents && <span className="ml-1.5 text-[10px] font-bold text-signal-indigo">PANEL</span>}
                </td>
                <td className="px-3.5 py-2.5 text-on-surface-variant capitalize">{t.category}</td>
                <td className="px-3.5 py-2.5 text-on-surface-variant capitalize">{t.specimenType}</td>
                <td className="px-3.5 py-2.5 text-on-surface-variant">{t.referenceRangeText}</td>
                <td className="px-3.5 py-2.5 text-on-surface-variant">{t.turnaroundTimeHours}h</td>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => onEdit(t)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(t)}
                      className={`p-1.5 rounded-lg transition-all ${t.active ? "text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral" : "text-vital-green hover:bg-vital-green/10"}`}
                      title={t.active ? "Deactivate" : "Activate"}
                    >
                      <Power size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
