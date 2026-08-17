import { Search } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { formatDateTime, statusPillStyle, moduleColors } from "@modules/hospital-admin/components/reports/reportsHelpers";
import type { HospitalAuditRow } from "@modules/hospital-admin/api";

interface HospitalAuditPanelProps {
  entries: HospitalAuditRow[];
  search: string;
  onSearchChange: (value: string) => void;
  moduleFilter: string | "all";
  onModuleFilterChange: (value: string | "all") => void;
  modules: string[];
}

/** Module-local — hospital-wide Audit Reports (spec §47): merges every module's own real audit log into one timeline, tagged by source — never a second audit-writing system. */
export function HospitalAuditPanel({ entries, search, onSearchChange, moduleFilter, onModuleFilterChange, modules }: HospitalAuditPanelProps) {
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
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={moduleFilter} onChange={(e) => onModuleFilterChange(e.target.value)}>
          <option value="all">All Modules</option>
          {modules.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <Card hero>
        {entries.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No audit entries match this filter.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {entries.map((e) => (
              <div key={`${e.module}-${e.id}`} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-on-surface">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold mr-1.5" style={statusPillStyle(moduleColors[e.module] ?? "var(--outline)")}>{e.module}</span>
                    <span className="font-semibold">{e.actor}</span> — {e.action}
                  </p>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDateTime(e.timestamp)}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {e.entityId}
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
