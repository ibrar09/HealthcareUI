import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { orderStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyOrderType, EmergencyOrderStatus } from "@modules/hospital-admin/api";

type OrderRow = {
  id: string;
  orderNumber: string;
  queueNumber: string;
  patientName: string;
  orderType: EmergencyOrderType;
  description: string;
  priority: "routine" | "urgent" | "stat";
  status: EmergencyOrderStatus;
  orderedByName: string;
  orderedAt: string;
};

interface OrdersPanelProps {
  orders: OrderRow[];
  typeFilter: EmergencyOrderType | "all";
  onTypeFilterChange: (value: EmergencyOrderType | "all") => void;
  onAdd: () => void;
  onAdvance: (order: OrderRow) => void;
}

const types: (EmergencyOrderType | "all")[] = ["all", "laboratory", "radiology", "medication", "procedure", "consultation", "monitoring"];
const nextStatus: Partial<Record<EmergencyOrderStatus, EmergencyOrderStatus>> = {
  ordered: "accepted",
  accepted: "in-progress",
  "in-progress": "completed",
  completed: "result-available",
  "result-available": "reviewed",
};

/** Module-local — Emergency Orders (spec §9): a unified cross-type tracker, Ordered -> Accepted -> In Progress -> Completed -> Result Available -> Reviewed. */
export function OrdersPanel({ orders, typeFilter, onTypeFilterChange, onAdd, onAdvance }: OrdersPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value as EmergencyOrderType | "all")}>
          {types.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Order Types" : t}</option>
          ))}
        </select>
        <Button onClick={onAdd}><Plus size={14} /> New Order</Button>
      </div>

      <Card hero>
        {orders.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No orders match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Order #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Type</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Description</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Ordered</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => {
                  const status = orderStatusMeta[o.status];
                  const next = nextStatus[o.status];
                  return (
                    <tr key={o.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{o.orderNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.queueNumber} · {o.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{o.orderType}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant max-w-[220px] truncate">{o.description}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant capitalize">{o.priority}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(o.orderedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        {next && <Button size="sm" variant="outline" onClick={() => onAdvance(o)}>{orderStatusMeta[next].label}</Button>}
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
