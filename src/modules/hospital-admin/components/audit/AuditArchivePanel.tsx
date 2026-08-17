import { Card, Button } from "@shared/design-system/components";
import { severityMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { AuditEvent } from "@modules/hospital-admin/api";

type AuditEventRow = AuditEvent & { departmentName?: string; patientName?: string };

interface AuditArchivePanelProps {
  activeEvents: AuditEventRow[];
  archivedEvents: AuditEventRow[];
  showArchived: boolean;
  onToggleView: (archived: boolean) => void;
  onArchive: (id: string) => void;
}

/** Module-local — Audit Archive (spec §34): Active Audit -> Archive -> Long-Term Storage. */
export function AuditArchivePanel({ activeEvents, archivedEvents, showArchived, onToggleView, onArchive }: AuditArchivePanelProps) {
  const rows = showArchived ? archivedEvents : activeEvents;
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex gap-2">
        <button type="button" onClick={() => onToggleView(false)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${!showArchived ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant bg-white border border-line"}`}>
          Current Events ({activeEvents.length})
        </button>
        <button type="button" onClick={() => onToggleView(true)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${showArchived ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant bg-white border border-line"}`}>
          Archived Events ({archivedEvents.length})
        </button>
      </div>

      <Card hero>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">Nothing here yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {rows.map((e) => {
              const severity = severityMeta[e.severity];
              return (
                <div key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{e.eventName} <span className="font-mono text-xs text-on-surface-variant ml-1">{e.auditId}</span></p>
                    <p className="text-xs text-on-surface-variant">{e.actorName} · {formatDateTime(e.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(severity.color)}>{severity.label}</span>
                    {!showArchived && <Button size="sm" variant="ghost" onClick={() => onArchive(e.id)}>Archive</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
