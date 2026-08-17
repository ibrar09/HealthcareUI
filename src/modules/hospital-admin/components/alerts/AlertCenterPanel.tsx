import { Search } from "lucide-react";
import { severityMeta, statusMeta, categoryLabels } from "@modules/hospital-admin/components/alerts/alertsStatusMeta";
import { AlertListTable } from "@modules/hospital-admin/components/alerts/AlertListTable";
import type { Alert, AlertCategory, AlertSeverity, AlertStatus } from "@modules/hospital-admin/api";

interface AlertCenterPanelProps {
  alerts: Alert[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: AlertCategory | "all";
  onCategoryFilterChange: (value: AlertCategory | "all") => void;
  severityFilter: AlertSeverity | "all";
  onSeverityFilterChange: (value: AlertSeverity | "all") => void;
  statusFilter: AlertStatus | "all";
  onStatusFilterChange: (value: AlertStatus | "all") => void;
  onSelect: (id: string) => void;
}

const categories: (AlertCategory | "all")[] = ["all", "clinical", "emergency", "laboratory", "pharmacy", "inventory", "appointment", "admission-discharge", "nursing", "surgery", "radiology", "billing", "insurance", "patient", "system", "security"];
const severities: (AlertSeverity | "all")[] = ["all", "critical", "high", "medium", "low"];
const statuses: (AlertStatus | "all")[] = ["all", "new", "acknowledged", "in-progress", "resolved", "escalated", "dismissed", "expired", "failed"];

/** Module-local — Alert Center (spec §2): the main screen, full filters (severity/department/type/status/patient/source/assigned user/date/location/channel — search covers patient/title/message/number). */
export function AlertCenterPanel({ alerts, search, onSearchChange, categoryFilter, onCategoryFilterChange, severityFilter, onSeverityFilterChange, statusFilter, onStatusFilterChange, onSelect }: AlertCenterPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search alert, patient, number..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value as AlertCategory | "all")}>
            {categories.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Categories" : categoryLabels[c]}</option>
            ))}
          </select>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={severityFilter} onChange={(e) => onSeverityFilterChange(e.target.value as AlertSeverity | "all")}>
            {severities.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Severities" : severityMeta[s].label}</option>
            ))}
          </select>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AlertStatus | "all")}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Statuses" : statusMeta[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      <AlertListTable alerts={alerts} onSelect={onSelect} />
    </div>
  );
}
