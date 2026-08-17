import { UserPlus } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { denialStageLabel } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { DenialView, DenialStage } from "@modules/hospital-admin/api";

const stageOptions = Object.keys(denialStageLabel) as DenialStage[];

interface DenialsPanelProps {
  denials: DenialView[];
  stageFilter: DenialStage | "all";
  onStageFilterChange: (stage: DenialStage | "all") => void;
  onAdvanceStage: (denialId: string, stage: DenialStage) => void;
  onAssign: (denial: DenialView) => void;
}

/** Module-local — Billing "Denials" tab (spec §28): a genuinely separate multi-stage workflow from a plain Rejected-claims filter. */
export function DenialsPanel({ denials, stageFilter, onStageFilterChange, onAdvanceStage, onAssign }: DenialsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex gap-2 flex-wrap">
        {(["all", ...stageOptions] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStageFilterChange(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              stageFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {s === "all" ? "All" : denialStageLabel[s]}
          </button>
        ))}
      </div>

      {denials.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No denials match this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {denials.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-bold text-on-surface">
                    {d.claimNumber} <span className="text-xs font-normal text-on-surface-variant">{formatSAR(d.amount)}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {d.patientName} · {d.payerName}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 italic">"{d.reason}"</p>
                  <p className="text-xs text-on-surface-variant mt-1">Assigned to {d.assignedTo ?? "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" onClick={() => onAssign(d)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface" title="Assign">
                    <UserPlus size={14} />
                  </button>
                  <select
                    value={d.stage}
                    onChange={(e) => onAdvanceStage(d.id, e.target.value as DenialStage)}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant outline-none focus:border-signal-indigo"
                  >
                    {stageOptions.map((s) => (
                      <option key={s} value={s}>
                        {denialStageLabel[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
