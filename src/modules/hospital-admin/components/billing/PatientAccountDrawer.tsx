import { useEffect, useState } from "react";
import { Plus, ShieldCheck, XCircle } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { invoiceStatusMeta } from "@modules/hospital-admin/components/billing/billingStatusMeta";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import * as api from "@modules/hospital-admin/api";
import type { PatientAccountView, InvoiceView, PatientCoverageView, EligibilityCheck } from "@modules/hospital-admin/api";

const coverageLabel: Record<PatientAccountView["coverageType"], string> = {
  insurance: "Insurance",
  "self-pay": "Self-Pay",
  corporate: "Corporate",
};

function Field({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-on-surface ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

interface PatientAccountDrawerProps {
  account: PatientAccountView | null;
  invoices: InvoiceView[];
  onClose: () => void;
  onOpenInvoice: (invoiceId: string) => void;
  onAddCoverage: () => void;
}

/** Module-local — Patient Financial Account detail (spec §4), plus Coverage (spec §11) and Eligibility (spec §12). */
export function PatientAccountDrawer({ account, invoices, onClose, onOpenInvoice, onAddCoverage }: PatientAccountDrawerProps) {
  const [coverages, setCoverages] = useState<PatientCoverageView[]>([]);
  const [eligibility, setEligibility] = useState<Record<string, EligibilityCheck | null>>({});
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    if (!account) {
      setCoverages([]);
      setEligibility({});
      return;
    }
    api.getPatientCoverage(account.patientId).then((rows) => {
      setCoverages(rows);
      rows.forEach((c) => {
        api.getLatestEligibilityCheck(c.id).then((check) => setEligibility((e) => ({ ...e, [c.id]: check })));
      });
    });
  }, [account]);

  async function handleCheckEligibility(coverageId: string) {
    setCheckingId(coverageId);
    const check = await api.runEligibilityCheck(coverageId);
    setEligibility((e) => ({ ...e, [coverageId]: check }));
    setCheckingId(null);
  }

  async function handleCancelCoverage(coverageId: string) {
    await api.cancelCoverage(coverageId);
    if (account) api.getPatientCoverage(account.patientId).then(setCoverages);
  }

  return (
    <Drawer open={Boolean(account)} onClose={onClose} title={account ? account.patientName : "Patient Account"} subtitle={account ? `${account.accountNumber} · ${account.patientMrn}` : undefined}>
      {account && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line p-4 bg-signal-indigo-tint/40">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Coverage" value={coverageLabel[account.coverageType]} />
              <Field label="Payer" value={account.payerName ?? "—"} />
              <Field label="Current Balance" value={formatSAR(account.currentBalance)} valueClassName={account.currentBalance > 0 ? "text-pulse-coral" : ""} />
              <Field label="Patient Responsibility (Total)" value={formatSAR(account.patientResponsibility)} />
              {account.coverageType === "insurance" && <Field label="Insurance Pending" value={formatSAR(account.insurancePending)} />}
              <Field label="Account Created" value={account.createdOn} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Coverage</h3>
              <Button variant="outline" size="sm" onClick={onAddCoverage} icon={<Plus size={12} />}>
                Add Coverage
              </Button>
            </div>
            {coverages.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No coverage on file — this patient bills as self-pay.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {coverages.map((c) => {
                  const check = eligibility[c.id];
                  return (
                    <div key={c.id} className="rounded-xl border border-line px-3.5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {c.payerName} <span className="text-xs font-normal text-on-surface-variant">— {c.planName}</span>
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {c.rank === "primary" ? "Primary" : "Secondary"} · Member {c.memberId} · {c.effectiveDate} → {c.expiryDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status === "active" ? "bg-vital-green/15 text-vital-green" : "bg-surface-container-low text-on-surface-variant"}`}
                          >
                            {c.status}
                          </span>
                          {c.status === "active" && (
                            <button type="button" onClick={() => handleCancelCoverage(c.id)} className="p-1 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-pulse-coral" title="Cancel Coverage">
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {c.status === "active" && (
                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-line">
                          {check ? (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              <span className={`flex items-center gap-1 font-semibold ${check.eligible ? "text-vital-green" : "text-pulse-coral"}`}>
                                <ShieldCheck size={12} /> {check.eligible ? "Eligible" : "Not Eligible"}
                              </span>
                              <span className="text-on-surface-variant">Copay {formatSAR(check.copay)}</span>
                              <span className="text-on-surface-variant">Deductible {formatSAR(check.deductible)}</span>
                              {check.authorizationRequiredServices.length > 0 && (
                                <span className="text-on-surface-variant">Auth required: {check.authorizationRequiredServices.join(", ")}</span>
                              )}
                              <span className="text-on-surface-variant/70">Checked {check.checkedOn}</span>
                              <button
                                type="button"
                                onClick={() => handleCheckEligibility(c.id)}
                                disabled={checkingId === c.id}
                                className="text-signal-indigo font-semibold hover:underline disabled:opacity-50"
                              >
                                Re-check
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCheckEligibility(c.id)}
                              disabled={checkingId === c.id}
                              className="text-xs font-semibold text-signal-indigo hover:underline disabled:opacity-50"
                            >
                              {checkingId === c.id ? "Checking…" : "Check Eligibility"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">Invoices</h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No invoices for this patient yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {invoices.map((inv) => {
                  const meta = invoiceStatusMeta[inv.status];
                  return (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => onOpenInvoice(inv.id)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left hover:bg-surface-container-low transition-all"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{inv.invoiceNumber}</p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {inv.issuedDate} · Balance {formatSAR(inv.balance)}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
