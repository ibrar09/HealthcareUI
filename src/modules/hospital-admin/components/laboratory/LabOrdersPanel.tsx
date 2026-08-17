import { AlertTriangle, FlaskConical, Plus, Search } from "lucide-react";
import { Button } from "@shared/design-system/components";
import { labOrderStatusMeta, labPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/laboratory/labStatusMeta";
import type { LabOrderRow, LabOrderStatus, LabOrderPriority } from "@modules/hospital-admin/api";

interface LabOrdersPanelProps {
  orders: LabOrderRow[];
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: LabOrderStatus | "all";
  onStatusFilterChange: (v: LabOrderStatus | "all") => void;
  priorityFilter: LabOrderPriority | "all";
  onPriorityFilterChange: (v: LabOrderPriority | "all") => void;
  onSelect: (id: string) => void;
  onCapture: () => void;
}

const statusOptions: (LabOrderStatus | "all")[] = ["all", "ordered", "specimen-collected", "received-in-lab", "in-process", "resulted", "verified", "cancelled"];
const priorityOptions: (LabOrderPriority | "all")[] = ["all", "stat", "urgent", "routine"];

/** Module-local — Laboratory "Orders" tab: ServiceRequest volume/status view (spec-equivalent of HMS_DOMAIN_STANDARDS.md §23). */
export function LabOrdersPanel({ orders, search, onSearchChange, statusFilter, onStatusFilterChange, priorityFilter, onPriorityFilterChange, onSelect, onCapture }: LabOrdersPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by patient or order number..."
            className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
          />
        </div>
        <Button size="sm" onClick={onCapture} icon={<Plus size={14} />}>
          Capture Order
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusFilterChange(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "all" ? "All" : labOrderStatusMeta[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {priorityOptions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPriorityFilterChange(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                priorityFilter === p ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {p === "all" ? "All Priorities" : labPriorityMeta[p].label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No lab orders match your filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => {
            const meta = labOrderStatusMeta[o.status];
            const priority = labPriorityMeta[o.priority];
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelect(o.id)}
                className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: meta.color }} />
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                  <FlaskConical size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-on-surface truncate flex items-center gap-2">
                    {o.orderNumber}
                    {o.hasCriticalFlag && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pulse-coral/14 text-pulse-coral text-[10px] font-bold px-2 py-0.5">
                        <AlertTriangle size={10} /> Critical
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-on-surface-variant truncate">
                    {o.patientName} · {o.testNames.join(", ")}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {o.orderingPractitionerName} · {o.departmentName} · {formatDateTime(o.orderedDateTime)}
                  </p>
                </div>
                <div className="hidden sm:block flex-shrink-0">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                    {priority.label}
                  </span>
                </div>
                <div className="flex-shrink-0 w-32 text-right">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
