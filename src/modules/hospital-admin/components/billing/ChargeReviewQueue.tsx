import { Check, X } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import type { ChargeView } from "@modules/hospital-admin/api";

function ChecklistItem({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${pass ? "text-vital-green" : "text-pulse-coral"}`}>
      {pass ? <Check size={13} /> : <X size={13} />}
      {label}
    </div>
  );
}

interface ChargeReviewQueueProps {
  charges: ChargeView[];
  onValidate: (chargeId: string) => void;
  onReverse: (chargeId: string) => void;
}

/** Module-local — Charge Review (spec §7): validation checklist before a charge can be billed. Only real, verifiable checks — no fake Coverage/Authorization checkmarks, since Eligibility/Authorization don't exist until Phase 2. */
export function ChargeReviewQueue({ charges, onValidate, onReverse }: ChargeReviewQueueProps) {
  if (charges.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No charges awaiting review — Charge Review queue is clear.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {charges.map((c) => {
        const checks = [
          { pass: Boolean(c.patientId), label: "Patient" },
          { pass: Boolean(c.serviceName), label: "Service" },
          { pass: Boolean(c.capturedBy), label: "Provider" },
          { pass: Boolean(c.capturedOn), label: "Date" },
          { pass: c.quantity > 0, label: "Quantity" },
          { pass: c.unitPrice > 0, label: "Price" },
        ];
        const allPass = checks.every((k) => k.pass);
        return (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="font-bold text-on-surface">{c.serviceName}</p>
                <p className="text-xs text-on-surface-variant">
                  {c.patientName} · {c.patientMrn} · Captured by {c.capturedBy} on {c.capturedOn}
                </p>
                <p className="text-sm font-semibold text-on-surface mt-1">
                  {c.quantity} × {formatSAR(c.unitPrice)} = {formatSAR(c.amount)}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => onReverse(c.id)} icon={<X size={13} />}>
                  Reverse
                </Button>
                <Button size="sm" onClick={() => onValidate(c.id)} disabled={!allPass} icon={<Check size={13} />}>
                  Validate
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
              {checks.map((k) => (
                <ChecklistItem key={k.label} pass={k.pass} label={k.label} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
