import { useEffect, useState } from "react";
import { PharmacyLayout } from "@/layouts/PharmacyLayout";
import * as api from "@modules/pharmacy/api";
import type { AuditEntry } from "@modules/pharmacy/api";

export function Audit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  useEffect(() => { api.getAuditLog().then(setEntries); }, []);

  return (
    <PharmacyLayout active="Audit">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Audit Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">Read-only view. The backend is the authoritative, tamper-evident audit source.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {entries.map((e) => (
          <div key={e.id} className="px-5 py-3 text-xs text-slate-600 flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-800">{e.user}</span> {e.action} — {e.target}
            <span className="text-slate-400 ml-auto">{e.at}</span>
          </div>
        ))}
      </div>
    </PharmacyLayout>
  );
}
