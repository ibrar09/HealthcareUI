import { Search, Wallet } from "lucide-react";
import type { PatientAccountView } from "@modules/hospital-admin/api";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";

const coverageLabel: Record<PatientAccountView["coverageType"], string> = {
  insurance: "Insurance",
  "self-pay": "Self-Pay",
  corporate: "Corporate",
};

interface PatientAccountListProps {
  accounts: PatientAccountView[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (patientId: string) => void;
}

/** Module-local — Billing "Patient Accounts" tab (spec §4). */
export function PatientAccountList({ accounts, search, onSearchChange, onSelect }: PatientAccountListProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by patient name, MRN, or account #..."
          className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
        />
      </div>

      {accounts.length === 0 ? (
        <p className="text-center text-sm text-on-surface-variant py-12">No patient financial accounts with activity yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.patientId)}
              className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-signal-indigo" />
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                <Wallet size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-on-surface truncate">{a.patientName}</h3>
                  <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant flex-shrink-0">
                    {coverageLabel[a.coverageType]}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant truncate">
                  {a.accountNumber} · {a.patientMrn}
                  {a.payerName ? ` · ${a.payerName}` : ""}
                </p>
              </div>
              <div className="hidden md:block text-right flex-shrink-0 w-32">
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Current Balance</p>
                <p className={`text-sm font-bold ${a.currentBalance > 0 ? "text-pulse-coral" : "text-on-surface"}`}>{formatSAR(a.currentBalance)}</p>
              </div>
              {a.coverageType === "insurance" && (
                <div className="hidden lg:block text-right flex-shrink-0 w-32">
                  <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Insurance Pending</p>
                  <p className="text-sm font-semibold text-on-surface">{formatSAR(a.insurancePending)}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
