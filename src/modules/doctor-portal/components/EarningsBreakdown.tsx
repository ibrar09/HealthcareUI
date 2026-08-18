import type { VisitType } from "@modules/doctor-portal/api";

interface BreakdownRow {
  visitType: VisitType;
  count: number;
  rate: number;
}

interface EarningsBreakdownProps {
  rows: BreakdownRow[];
}

function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

/** Module-local — this month's earnings broken down by visit type (count x rate = subtotal), so the doctor can see where the total comes from. */
export function EarningsBreakdown({ rows }: EarningsBreakdownProps) {
  const active = rows.filter((r) => r.count > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-1">This Month's Breakdown</h2>
      <p className="text-[11px] text-slate-400 mb-4">Rates are set by City General Hospital.</p>

      {active.length === 0 ? (
        <p className="text-xs text-slate-400">No completed consultations this month yet.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th className="py-2">Visit Type</th>
              <th className="py-2 text-right">Count</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {active.map((r) => (
              <tr key={r.visitType} className="border-b border-slate-50 last:border-0">
                <td className="py-2.5 text-xs text-slate-700">{r.visitType}</td>
                <td className="py-2.5 text-xs text-slate-600 text-right">{r.count}</td>
                <td className="py-2.5 text-xs text-slate-600 text-right">{formatPKR(r.rate)}</td>
                <td className="py-2.5 text-xs font-semibold text-slate-800 text-right">{formatPKR(r.count * r.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
