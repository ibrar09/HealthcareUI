import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { BlockedTime } from "@modules/doctor-portal/api";

interface BlockedTimeCardProps {
  blockedTimes: BlockedTime[];
  onAdd: (input: { startDate: string; endDate: string; label: string }) => void;
  onRemove: (id: string) => void;
}

/** Module-local — blocked time / leave list, distinct from breaks: whole-day-or-multi-day ranges with a reason, rather than a recurring daily window. */
export function BlockedTimeCard({ blockedTimes, onAdd, onRemove }: BlockedTimeCardProps) {
  const [adding, setAdding] = useState(false);
  const [startDate, setStartDate] = useState("2026-08-19");
  const [endDate, setEndDate] = useState("2026-08-19");
  const [label, setLabel] = useState("");

  function handleAdd() {
    if (!label.trim()) return;
    onAdd({ startDate, endDate: endDate < startDate ? startDate : endDate, label: label.trim() });
    setLabel("");
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800">Blocked Time / Leave</h2>
        <button type="button" onClick={() => setAdding((v) => !v)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {adding && (
        <div className="flex flex-wrap items-end gap-2 mb-4 bg-slate-50 rounded-xl p-3">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] text-slate-500 mb-1">Reason</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Conference" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
          </div>
          <button type="button" onClick={handleAdd} disabled={!label.trim()} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg px-3 py-1.5">
            Save
          </button>
        </div>
      )}

      {blockedTimes.length === 0 ? (
        <p className="text-xs text-slate-400">No blocked time or leave scheduled.</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-50">
          {blockedTimes.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  {b.startDate === b.endDate ? b.startDate : `${b.startDate} – ${b.endDate}`}
                </p>
                <p className="text-[11px] text-slate-400">{b.label}</p>
              </div>
              <button type="button" onClick={() => onRemove(b.id)} aria-label={`Remove ${b.label}`} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
