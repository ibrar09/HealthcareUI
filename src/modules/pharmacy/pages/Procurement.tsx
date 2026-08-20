import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { Supplier, PurchaseOrder } from "@modules/pharmacy/api";

type Tab = "orders" | "suppliers";

export function Procurement() {
  const [tab, setTab] = useState<Tab>("orders");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  function refresh() {
    api.getSuppliers().then(setSuppliers);
    api.getPurchaseOrders().then(setOrders);
  }
  useEffect(refresh, []);

  return (
    <PharmacyLayout active="Procurement">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Procurement</h1>
        <p className="text-xs text-slate-500 mt-0.5">Purchase orders and supplier directory.</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button type="button" onClick={() => setTab("orders")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "orders" ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Purchase Orders</button>
        <button type="button" onClick={() => setTab("suppliers")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${tab === "suppliers" ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}>Suppliers</button>
      </div>

      {tab === "orders" ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {orders.map((po) => {
            const supplier = suppliers.find((s) => s.id === po.supplierId);
            return (
              <div key={po.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{po.medicationName} — Qty {po.quantity}</p><p className="text-[11px] text-slate-400">{supplier?.name ?? "—"} · Requested {po.requestedAt}</p></div>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-1 flex-shrink-0">{po.status}</span>
                {po.status !== "Received" && (
                  <button type="button" onClick={() => api.advancePurchaseOrder(po.id).then(refresh)} className="text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-2.5 py-1.5 flex-shrink-0">
                    Advance to {po.status === "Requested" ? "Approved" : po.status === "Approved" ? "Ordered" : "Received"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {suppliers.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{s.name}</p><p className="text-[11px] text-slate-400">{s.contact} · Lead time {s.leadTimeDays} days</p></div>
              <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 flex-shrink-0 ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{s.active ? "Active" : "Inactive"}</span>
            </div>
          ))}
        </div>
      )}
    </PharmacyLayout>
  );
}
