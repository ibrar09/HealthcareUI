import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { StockStatusBadge } from "@modules/doctor-portal/components/StockStatusBadge";
import * as api from "@modules/doctor-portal/api";
import type { MedicationStock, StockStatus } from "@modules/doctor-portal/api";

type StatusFilter = "all" | StockStatus;

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "In Stock", label: "In Stock" },
  { key: "Low Stock", label: "Low Stock" },
  { key: "Out of Stock", label: "Out of Stock" },
];

export function ProductStock() {
  const [formulary, setFormulary] = useState<MedicationStock[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    api.getFormulary().then(setFormulary);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return formulary.filter((m) => {
      if (statusFilter !== "all" && m.stockStatus !== statusFilter) return false;
      if (!query) return true;
      return m.name.toLowerCase().includes(query) || m.genericName.toLowerCase().includes(query) || m.category.toLowerCase().includes(query);
    });
  }, [formulary, search, statusFilter]);

  return (
    <DoctorLayout active="Product & Stock">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Product & Stock</h1>
        <p className="text-xs text-slate-500 mt-0.5">Check medication availability at the hospital pharmacy before prescribing.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by medication name, generic name, or category…"
            aria-label="Search medications"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((chip) => {
            const isActive = chip.key === statusFilter;
            const count = chip.key === "all" ? formulary.length : formulary.filter((m) => m.stockStatus === chip.key).length;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setStatusFilter(chip.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {chip.label}
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No medications match your search.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3">Medication</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Form</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Alternatives</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-slate-800">{m.name} {m.strength}</p>
                    <p className="text-[11px] text-slate-400">{m.genericName}</p>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-slate-600">{m.category}</td>
                  <td className="px-3 py-3.5 text-xs text-slate-600">{m.form}</td>
                  <td className="px-3 py-3.5"><StockStatusBadge status={m.stockStatus} /></td>
                  <td className="px-3 py-3.5 text-[11px] text-slate-500">{m.alternatives?.join(", ") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DoctorLayout>
  );
}
