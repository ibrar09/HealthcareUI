import { Search } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formatDateTime, statusPillStyle } from "@modules/hospital-admin/components/configuration/configHelpers";
import type { ConfigurationChangeEntry, ConfigurationChangeRequest, ConfigChangeStatus } from "@modules/hospital-admin/api";

interface ConfigHistoryPanelProps {
  history: ConfigurationChangeEntry[];
  search: string;
  onSearchChange: (value: string) => void;
  changeRequests: ConfigurationChangeRequest[];
  onReview: (id: string) => void;
  onApprove: (id: string) => void;
  onPublish: (id: string) => void;
  onReject: (id: string) => void;
}

const statusColor: Record<ConfigChangeStatus, string> = {
  draft: "var(--outline)",
  submitted: "var(--signal-indigo-light)",
  reviewed: "var(--caution-amber)",
  approved: "var(--signal-indigo)",
  published: "var(--vital-green)",
  rejected: "var(--pulse-coral)",
};

/** Module-local — Configuration History (spec §39) + Versioning (spec §40) + Configuration Approval (spec §42): who/what/when/old/new/reason for every change, and the Draft->Submitted->Reviewed->Approved->Published workflow for critical settings. */
export function ConfigHistoryPanel({ history, search, onSearchChange, changeRequests, onReview, onApprove, onPublish, onReject }: ConfigHistoryPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {changeRequests.length > 0 && (
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Pending Change Requests</h2>
          <div className="flex flex-col divide-y divide-line">
            {changeRequests.map((r) => (
              <div key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-on-surface">{r.configLabel}</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={statusPillStyle(statusColor[r.status])}>{r.status}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{r.currentValue} → {r.proposedValue} · {r.reason}</p>
                <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Requested by {r.requestedBy} · {formatDateTime(r.requestedAt)}</p>
                <div className="flex gap-2 mt-2">
                  {r.status === "submitted" && <Button size="sm" variant="outline" onClick={() => onReview(r.id)}>Mark Reviewed</Button>}
                  {r.status === "reviewed" && <Button size="sm" onClick={() => onApprove(r.id)}>Approve</Button>}
                  {r.status === "approved" && <Button size="sm" onClick={() => onPublish(r.id)}>Publish</Button>}
                  {(r.status === "submitted" || r.status === "reviewed") && <Button size="sm" variant="ghost" onClick={() => onReject(r.id)}>Reject</Button>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="relative w-full sm:w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
          placeholder="Search configuration, changed by..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Card hero>
        {history.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No configuration changes recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {history.map((h) => (
              <div key={h.id} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface">{h.configLabel} <span className="text-xs font-normal text-on-surface-variant ml-1">v{h.version}</span></p>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDateTime(h.timestamp)}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  <span className="text-pulse-coral">{h.oldValue}</span> → <span className="text-vital-green">{h.newValue}</span>
                </p>
                <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                  Changed by {h.changedBy}{h.reason && ` — ${h.reason}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
