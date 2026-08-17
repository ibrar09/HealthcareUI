import { CheckCircle2, Clock, Plus, ShieldCheck, XCircle } from "lucide-react";
import { Card, KPICard, Button } from "@shared/design-system/components";
import { authorizationStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import type { PreAuthorizationView, AuthorizationStatus } from "@modules/hospital-admin/api";

interface AuthStats {
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}

interface AuthorizationsPanelProps {
  stats: AuthStats;
  authorizations: PreAuthorizationView[];
  statusFilter: AuthorizationStatus | "all";
  onStatusFilterChange: (status: AuthorizationStatus | "all") => void;
  onRequest: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

/** Module-local — Billing "Authorizations" tab (spec §13): preauthorization requests + dashboard counts. */
export function AuthorizationsPanel({ stats, authorizations, statusFilter, onStatusFilterChange, onRequest, onApprove, onReject }: AuthorizationsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Pending" value={stats.pending} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Approved" value={stats.approved} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Rejected" value={stats.rejected} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Expired" value={stats.expired} icon={<ShieldCheck size={14} />} accentColor="var(--outline)" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected", "expired"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusFilterChange(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "all" ? "All" : authorizationStatusMeta[s].label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={onRequest} icon={<Plus size={14} />}>
          Request Authorization
        </Button>
      </div>

      {authorizations.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No authorization requests match this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {authorizations.map((a) => {
            const meta = authorizationStatusMeta[a.status];
            return (
              <Card key={a.id}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface">
                      {a.serviceName} <span className="text-xs font-normal text-on-surface-variant">{a.authNumber}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {a.patientName} · {a.patientMrn} · {a.payerName}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Requested by {a.requestedBy} on {a.requestedOn}
                      {a.decidedOn ? ` · Decided ${a.decidedOn}` : ""}
                      {a.expiryDate ? ` · Expires ${a.expiryDate}` : ""}
                    </p>
                    {a.decisionNotes && <p className="text-xs text-on-surface-variant mt-1 italic">"{a.decisionNotes}"</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {a.status === "pending" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onReject(a.id)} icon={<XCircle size={13} />}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => onApprove(a.id)} icon={<CheckCircle2 size={13} />}>
                          Approve
                        </Button>
                      </>
                    )}
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
