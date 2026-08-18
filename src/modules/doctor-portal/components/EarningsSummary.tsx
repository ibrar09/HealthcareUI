import type { PayoutRecord } from "@modules/doctor-portal/api";

interface EarningsSummaryProps {
  thisMonthEarnings: number;
  thisMonthConsultations: number;
  lastPayout: PayoutRecord | null;
}

function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

/** Module-local — the Earnings header stat row. "This Month" figures are live, computed from actual completed appointments, not stored. */
export function EarningsSummary({ thisMonthEarnings, thisMonthConsultations, lastPayout }: EarningsSummaryProps) {
  const stats = [
    { label: "This Month's Earnings", value: formatPKR(thisMonthEarnings) },
    { label: "Consultations This Month", value: String(thisMonthConsultations) },
    { label: "Pending Payout", value: formatPKR(thisMonthEarnings), tone: "warning" as const },
    { label: "Last Payout", value: lastPayout ? formatPKR(lastPayout.amount) : "—", sub: lastPayout?.paidOn },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[180px]">
          <p className={`text-xl font-bold ${s.tone === "warning" ? "text-amber-600" : "text-slate-800"}`}>{s.value}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          {s.sub && <p className="text-[10px] text-slate-400 mt-0.5">Paid {s.sub}</p>}
        </div>
      ))}
    </div>
  );
}
