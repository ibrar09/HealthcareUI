import { Pencil, Plus, Power, ListTree } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { ImagingProcedure, RadiologyProtocolRow } from "@modules/hospital-admin/api";

const modalityLabels: Record<string, string> = {
  ct: "CT",
  mri: "MRI",
  xr: "X-Ray",
  us: "Ultrasound",
  mammography: "Mammography",
  fluoroscopy: "Fluoroscopy",
  pet: "PET",
  spect: "SPECT",
  dexa: "DEXA",
};

interface ProceduresPanelProps {
  procedures: ImagingProcedure[];
  protocols: RadiologyProtocolRow[];
  onAdd: () => void;
  onEdit: (procedure: ImagingProcedure) => void;
  onToggleActive: (procedure: ImagingProcedure) => void;
  onAddProtocol: () => void;
}

/** Module-local — Radiology "Procedures" tab (spec §26-27): a configurable coded catalog, never hardcoded clinical terminology; Protocols (sub-options per procedure) shown as a second section since they're inherently procedure-scoped, not a standalone concept. */
export function ProceduresPanel({ procedures, protocols, onAdd, onEdit, onToggleActive, onAddProtocol }: ProceduresPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface">Procedure Catalog</h2>
          <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
            Add Procedure
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Code</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Name</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Modality</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Body Site</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Duration</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Contrast</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Price</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {procedures.map((p) => (
                <tr key={p.code} className={p.active ? undefined : "opacity-50"}>
                  <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{p.code}</td>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{p.name}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{modalityLabels[p.modality] ?? p.modality}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{p.bodySite}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{p.durationMinutes} min</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{p.contrastRequired ? "Required" : "—"}</td>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">${p.price}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.active ? "bg-vital-green/14 text-vital-green" : "bg-outline/14 text-on-surface-variant"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => onToggleActive(p)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title={p.active ? "Deactivate" : "Activate"}>
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

      <Card hero>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <ListTree size={16} className="text-signal-indigo" /> Protocols
          </h2>
          <Button size="sm" variant="outline" onClick={onAddProtocol} icon={<Plus size={14} />}>
            Add Protocol
          </Button>
        </div>
        {protocols.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No protocols configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {procedures
              .filter((p) => protocols.some((proto) => proto.procedureCode === p.code))
              .map((p) => (
                <div key={p.code} className="rounded-xl border border-line px-4 py-3">
                  <p className="text-sm font-bold text-on-surface mb-2">{p.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {protocols
                      .filter((proto) => proto.procedureCode === p.code)
                      .map((proto) => (
                        <span key={proto.id} className="rounded-full px-2.5 py-1 text-xs font-semibold bg-signal-indigo-tint text-signal-indigo" title={proto.description}>
                          {proto.name}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
