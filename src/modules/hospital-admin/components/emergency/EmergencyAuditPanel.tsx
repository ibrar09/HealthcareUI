import { Search } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyAuditEntry, EmergencyAuditEntityType } from "@modules/hospital-admin/api";

interface EmergencyAuditPanelProps {
  entries: EmergencyAuditEntry[];
  search: string;
  onSearchChange: (value: string) => void;
  entityFilter: EmergencyAuditEntityType | "all";
  onEntityFilterChange: (value: EmergencyAuditEntityType | "all") => void;
}

const entityTypes: (EmergencyAuditEntityType | "all")[] = ["all", "visit", "order", "disposition", "observation", "medication", "assessment", "bay", "config"];

/** Module-local — Audit Trail (spec §26): every sensitive operation traceable, logged from day one. */
export function EmergencyAuditPanel({ entries, search, onSearchChange, entityFilter, onEntityFilterChange }: EmergencyAuditPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search entity, actor, action..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={entityFilter} onChange={(e) => onEntityFilterChange(e.target.value as EmergencyAuditEntityType | "all")}>
          {entityTypes.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Entity Types" : t}</option>
          ))}
        </select>
      </div>

      <Card hero>
        {entries.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No audit entries match this filter.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {entries.map((e) => (
              <div key={e.id} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-on-surface"><span className="font-semibold">{e.actor}</span> — {e.action}</p>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDateTime(e.timestamp)}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  <span className="font-mono">{e.entityType}</span> · {e.entityId}
                  {e.detail && <span> — {e.detail}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
