import { ClipboardList } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { BedAuditEvent } from "@modules/hospital-admin/api";

interface BedAuditLogProps {
  events: BedAuditEvent[];
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  actionOptions: string[];
}

/** Module-local — Bed Management Phase 3 Audit tab (spec §25): hospital-wide, filterable event trail across every bed. */
export function BedAuditLog({ events, actionFilter, onActionFilterChange, actionOptions }: BedAuditLogProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onActionFilterChange("all")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
            actionFilter === "all" ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          All Actions
        </button>
        {actionOptions.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onActionFilterChange(a)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              actionFilter === a ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <Card hero>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ClipboardList size={28} className="text-on-surface-variant mb-2" />
            <p className="text-sm text-on-surface-variant">No audit events match this filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-on-surface">{e.action}</p>
                    <span className="text-xs font-mono text-on-surface-variant">{e.bedIdentifier}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    {e.actor}
                    {e.patientName ? ` · ${e.patientName}` : ""}
                    {e.detail ? ` · ${e.detail}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-on-surface-variant flex-shrink-0">{e.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
