import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { purchaseOrderStatusMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { PurchaseOrderRow, Supplier } from "@modules/hospital-admin/api";

interface ProcurementPanelProps {
  purchaseOrders: PurchaseOrderRow[];
  suppliers: Supplier[];
  onNewPO: () => void;
  onApprovePO: (po: PurchaseOrderRow) => void;
  onReceiveGoods: (po: PurchaseOrderRow) => void;
  onAddSupplier: () => void;
}

/** Module-local — Procurement (spec §14-16): Purchase Requests → Purchase Orders → Goods Receiving, plus the Supplier registry that feeds them — combined into one tab since they're a natural pipeline, matching this project's established consolidation pattern for tightly-related sections. */
export function ProcurementPanel({ purchaseOrders, suppliers, onNewPO, onApprovePO, onReceiveGoods, onAddSupplier }: ProcurementPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface">Purchase Orders</h2>
          <Button size="sm" onClick={onNewPO} icon={<Plus size={14} />}>
            New Purchase Order
          </Button>
        </div>
        {purchaseOrders.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No purchase orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">PO #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Supplier</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Value</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Requested</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {purchaseOrders.map((po) => {
                  const meta = purchaseOrderStatusMeta[po.status];
                  return (
                    <tr key={po.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{po.poNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{po.supplierName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">${po.totalValue.toFixed(2)}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(po.requestedAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          {po.status === "requested" && (
                            <Button size="sm" variant="outline" onClick={() => onApprovePO(po)}>
                              Approve
                            </Button>
                          )}
                          {(po.status === "approved" || po.status === "ordered" || po.status === "partially-received") && (
                            <Button size="sm" onClick={() => onReceiveGoods(po)}>
                              Receive Goods
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card hero>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface">Suppliers</h2>
          <Button size="sm" variant="outline" onClick={onAddSupplier} icon={<Plus size={14} />}>
            Add Supplier
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Name</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Contact</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Phone</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Payment Terms</th>
                <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{s.name}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{s.contactName}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{s.phone}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{s.paymentTerms}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.status === "active" ? "bg-vital-green/14 text-vital-green" : "bg-outline/14 text-on-surface-variant"} capitalize`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
