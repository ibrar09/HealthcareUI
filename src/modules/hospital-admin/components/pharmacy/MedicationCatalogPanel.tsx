import { Pencil, Plus, Power, ShieldAlert, Search } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { Medication } from "@modules/hospital-admin/api";

interface MedicationCatalogPanelProps {
  medications: Medication[];
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  onEdit: (medication: Medication) => void;
  onToggleActive: (medication: Medication) => void;
}

/** Module-local — Medication Catalog (spec §6-8): structured fields (generic/brand/strength/form/route), standardized forms/routes rather than free text, never invented clinical terminology. */
export function MedicationCatalogPanel({ medications, search, onSearchChange, onAdd, onEdit, onToggleActive }: MedicationCatalogPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search generic/brand name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
          Add Medication
        </Button>
      </div>

      <Card hero>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Code</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Generic Name</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Brand</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Strength</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Form</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Route</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Price</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {medications.map((m) => (
                <tr key={m.id} className={m.status !== "active" ? "opacity-50" : undefined}>
                  <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{m.medicationCode}</td>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">
                    <div className="flex items-center gap-1.5">
                      {m.genericName}
                      {m.controlledSubstance && (
                        <span title="Controlled substance">
                          <ShieldAlert size={12} className="text-pulse-coral" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{m.brandName ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{m.strength}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{m.form}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{m.route}</td>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">${m.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.status === "active" ? "bg-vital-green/14 text-vital-green" : "bg-outline/14 text-on-surface-variant"}`}>{m.status}</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => onEdit(m)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleActive(m)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
                        title={m.status === "active" ? "Deactivate" : "Activate"}
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
