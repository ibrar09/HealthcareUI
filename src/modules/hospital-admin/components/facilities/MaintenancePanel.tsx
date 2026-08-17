import { Card, Button, KPICard } from "@shared/design-system/components";
import { ClipboardList, AlertOctagon, Loader, CalendarClock } from "lucide-react";
import type { FacilityWorkOrderRow, FacilityWorkOrderStatus, FacilityMaintenancePriority } from "@modules/hospital-admin/api";

interface MaintenancePanelProps {
  workOrders: FacilityWorkOrderRow[];
  statusFilter: FacilityWorkOrderStatus | "all";
  onStatusFilterChange: (value: FacilityWorkOrderStatus | "all") => void;
  priorityFilter: FacilityMaintenancePriority | "all";
  onPriorityFilterChange: (value: FacilityMaintenancePriority | "all") => void;
  onAdvanceStatus: (id: string, status: FacilityWorkOrderStatus) => void;
}

const statuses: (FacilityWorkOrderStatus | "all")[] = ["all", "new", "assigned", "scheduled", "in-progress", "on-hold", "completed", "verification", "closed", "cancelled"];
const priorities: (FacilityMaintenancePriority | "all")[] = ["all", "critical", "high", "medium", "low"];

const priorityColor: Record<FacilityMaintenancePriority, string> = {
  critical: "var(--pulse-coral)", high: "var(--caution-amber)", medium: "var(--signal-indigo)", low: "var(--outline)",
};
const statusColor: Record<FacilityWorkOrderStatus, string> = {
  new: "var(--signal-indigo)", assigned: "var(--signal-indigo)", scheduled: "var(--caution-amber)",
  "in-progress": "var(--caution-amber)", "on-hold": "var(--outline)", completed: "var(--vital-green)",
  verification: "var(--vital-green)", closed: "var(--outline)", cancelled: "var(--outline)",
};

const nextStatus: Partial<Record<FacilityWorkOrderStatus, { label: string; next: FacilityWorkOrderStatus }>> = {
  new: { label: "Start Work", next: "in-progress" },
  assigned: { label: "Start Work", next: "in-progress" },
  scheduled: { label: "Start Work", next: "in-progress" },
  "in-progress": { label: "Mark Completed", next: "completed" },
  completed: { label: "Close", next: "closed" },
  verification: { label: "Close", next: "closed" },
};

/** Module-local — Maintenance Dashboard (spec §19) + Work Orders (spec §22-23): one real ticket lifecycle from report through closure. */
export function MaintenancePanel({ workOrders, statusFilter, onStatusFilterChange, priorityFilter, onPriorityFilterChange, onAdvanceStatus }: MaintenancePanelProps) {
  const open = workOrders.filter((w) => !["completed", "closed", "cancelled"].includes(w.status));
  const critical = workOrders.filter((w) => w.priority === "critical" && !["closed", "cancelled"].includes(w.status));
  const inProgress = workOrders.filter((w) => w.status === "in-progress");

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Open Requests" value={open.length} icon={<ClipboardList size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Critical" value={critical.length} icon={<AlertOctagon size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="In Progress" value={inProgress.length} icon={<Loader size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Completed" value={workOrders.filter((w) => w.status === "completed" || w.status === "closed").length} icon={<CalendarClock size={14} />} accentColor="var(--vital-green)" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as FacilityWorkOrderStatus | "all")}>
          {statuses.map((s) => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/-/g, " ")}</option>)}
        </select>
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value as FacilityMaintenancePriority | "all")}>
          {priorities.map((p) => <option key={p} value={p}>{p === "all" ? "All Priorities" : p}</option>)}
        </select>
      </div>

      <Card hero>
        {workOrders.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No work orders match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Work Order</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Location</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Category</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Assigned To</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {workOrders.map((w) => {
                  const action = nextStatus[w.status];
                  return (
                    <tr key={w.id}>
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold text-on-surface">{w.problem}</p>
                        <p className="text-xs text-on-surface-variant">{w.workOrderNumber} · {w.facilityName}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{w.location}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{w.category.replace(/-/g, " ")}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priorityColor[w.priority]} 16%, transparent)`, color: priorityColor[w.priority] }}>{w.priority}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{w.assignedToName ?? "Unassigned"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ backgroundColor: `color-mix(in srgb, ${statusColor[w.status]} 16%, transparent)`, color: statusColor[w.status] }}>{w.status.replace(/-/g, " ")}</span>
                      </td>
                      <td className="py-2.5">
                        {action && <Button size="sm" variant="outline" onClick={() => onAdvanceStatus(w.id, action.next)}>{action.label}</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
