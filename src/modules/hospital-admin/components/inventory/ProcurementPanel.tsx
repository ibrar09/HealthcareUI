import { Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { purchaseRequestStatusMeta, purchaseOrderStatusMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/inventory/inventoryStatusMeta";
import type { PurchaseRequestStatus, InventoryPurchaseOrderStatus } from "@modules/hospital-admin/api";

type PurchaseRequestRow = { id: string; requestNumber: string; departmentName: string; requestedByName: string; reason: string; status: PurchaseRequestStatus; createdAt: string };
type PurchaseOrderRow = { id: string; poNumber: string; supplierName: string; total: number; status: InventoryPurchaseOrderStatus; createdAt: string; deliveryDate?: string };
type SupplierRow = { id: string; name: string; contactName: string; phone: string; paymentTerms: string; status: "active" | "inactive"; onTimeDeliveryRate: number };

interface ProcurementPanelProps {
  purchaseRequests: PurchaseRequestRow[];
  purchaseOrders: PurchaseOrderRow[];
  suppliers: SupplierRow[];
  onNewPR: () => void;
  onApprovePR: (pr: PurchaseRequestRow) => void;
  onRejectPR: (pr: PurchaseRequestRow) => void;
  onNewPO: () => void;
  onSendPO: (po: PurchaseOrderRow) => void;
  onReceiveGoods: (po: PurchaseOrderRow) => void;
  onAddSupplier: () => void;
}

/** Module-local — Procurement (spec §20-24): Purchase Requests → Purchase Orders → Goods Receiving, plus the Supplier registry — one tab, matching this project's established consolidation pattern for a tightly-related pipeline. */
export function ProcurementPanel({ purchaseRequests, purchaseOrders, suppliers, onNewPR, onApprovePR, onRejectPR, onNewPO, onSendPO, onReceiveGoods, onAddSupplier }: ProcurementPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface">Purchase Requests</h2>
          <Button size="sm" onClick={onNewPR}><Plus size={14} /> New Request</Button>
        </div>
        {purchaseRequests.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No purchase requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Request #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {purchaseRequests.map((pr) => {
                  const meta = purchaseRequestStatusMeta[pr.status];
                  return (
                    <tr key={pr.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{pr.requestNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{pr.departmentName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant max-w-xs truncate">{pr.reason}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(pr.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        {pr.status === "submitted" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => onApprovePR(pr)}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={() => onRejectPR(pr)}>Reject</Button>
                          </div>
                        )}
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
          <h2 className="text-lg font-bold text-on-surface">Purchase Orders</h2>
          <Button size="sm" onClick={onNewPO}><Plus size={14} /> New Purchase Order</Button>
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
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Total</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Delivery</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {purchaseOrders.map((po) => {
                  const meta = purchaseOrderStatusMeta[po.status];
                  return (
                    <tr key={po.id}>
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-on-surface">{po.poNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{po.supplierName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant font-mono">${po.total.toFixed(2)}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{po.deliveryDate ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {po.status === "draft" && <Button size="sm" variant="outline" onClick={() => onSendPO(po)}>Send to Supplier</Button>}
                          {(po.status === "sent" || po.status === "acknowledged" || po.status === "partially-received") && (
                            <Button size="sm" onClick={() => onReceiveGoods(po)}>Receive Goods</Button>
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
          <Button size="sm" variant="outline" onClick={onAddSupplier}><Plus size={14} /> Add Supplier</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Name</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Contact</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Phone</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Payment Terms</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">On-Time %</th>
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
                  <td className="py-2.5 pr-3 text-on-surface-variant font-mono">{s.onTimeDeliveryRate}%</td>
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
