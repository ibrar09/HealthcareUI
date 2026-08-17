import { Search, Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { requisitionStatusMeta, requisitionPriorityMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { RequisitionStatus } from "@modules/hospital-admin/api";

type RequisitionRow = {
  id: string;
  requisitionNumber: string;
  departmentName: string;
  requestedByName: string;
  priority: "routine" | "urgent" | "emergency";
  status: RequisitionStatus;
  reason: string;
  createdAt: string;
  itemCount: number;
};

interface RequisitionsPanelProps {
  requisitions: RequisitionRow[];
  statusFilter: RequisitionStatus | "all";
  onStatusFilterChange: (value: RequisitionStatus | "all") => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const statuses: (RequisitionStatus | "all")[] = ["all", "draft", "submitted", "under-review", "approved", "picking", "issued", "received", "partially-fulfilled", "rejected", "cancelled"];

/** Module-local — Department Requisition (spec §17-19): Department -> Approval -> Issue, with the full state machine. */
export function RequisitionsPanel({ requisitions, statusFilter, onStatusFilterChange, search, onSearchChange, onSelect, onAdd }: RequisitionsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search requisition # or department..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as RequisitionStatus | "all")}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Statuses" : requisitionStatusMeta[s].label}</option>
            ))}
          </select>
          <Button onClick={onAdd}><Plus size={14} /> New Requisition</Button>
        </div>
      </div>

      <Card hero>
        {requisitions.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No requisitions match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requisition #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requested By</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Items</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requisitions.map((r) => {
                  const status = requisitionStatusMeta[r.status];
                  const priority = requisitionPriorityMeta[r.priority];
                  return (
                    <tr key={r.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(r.id)}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{r.requisitionNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.departmentName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.requestedByName}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(priority.color)}>{priority.label}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{r.itemCount}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
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
