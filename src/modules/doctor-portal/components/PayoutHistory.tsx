import type { PayoutRecord, PayoutStatus } from "@modules/doctor-portal/api";

interface PayoutHistoryProps {
  payouts: PayoutRecord[];
}

const STATUS_STYLE: Record<PayoutStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Processing: "bg-amber-50 text-amber-700 border-amber-100",
};

function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

/** Module-local — past payout periods. This month's not-yet-paid earnings intentionally aren't a row here — they're the live "Pending Payout" stat instead. */
export function PayoutHistory({ payouts }: PayoutHistoryProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Payout History</h2>
      </div>

      {payouts.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No past payouts on record.</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {[...payouts].reverse().map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-bold text-slate-800">{p.period}</p>
                <p className="text-[11px] text-slate-400">{p.consultationCount} consultations{p.paidOn ? ` · Paid ${p.paidOn}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-slate-700">{formatPKR(p.amount)}</p>
                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${STATUS_STYLE[p.status]}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
