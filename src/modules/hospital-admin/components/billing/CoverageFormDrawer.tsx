import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { NewCoverageInput, CoverageRank, SubscriberRelationship, Payer, InsurancePlanView } from "@modules/hospital-admin/api";

const relationshipOptions: SubscriberRelationship[] = ["self", "spouse", "child", "other"];

interface CoverageFormDrawerProps {
  open: boolean;
  patientId: string | null;
  patientName?: string;
  onClose: () => void;
  onComplete: () => void;
  payers: Payer[];
}

/** Module-local — add a Patient Coverage record (spec §11, FHIR Coverage). */
export function CoverageFormDrawer({ open, patientId, patientName, onClose, onComplete, payers }: CoverageFormDrawerProps) {
  const [payerId, setPayerId] = useState("");
  const [plans, setPlans] = useState<InsurancePlanView[]>([]);
  const [planId, setPlanId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [subscriberName, setSubscriberName] = useState(patientName ?? "");
  const [relationshipToSubscriber, setRelationshipToSubscriber] = useState<SubscriberRelationship>("self");
  const [rank, setRank] = useState<CoverageRank>("primary");
  const [effectiveDate, setEffectiveDate] = useState("2026-01-01");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");

  useEffect(() => {
    if (open) {
      setPayerId(payers[0]?.id ?? "");
      setMemberId("");
      setPolicyNumber("");
      setSubscriberName(patientName ?? "");
      setRelationshipToSubscriber("self");
      setRank("primary");
      setEffectiveDate("2026-01-01");
      setExpiryDate("2026-12-31");
    }
  }, [open, payers, patientName]);

  useEffect(() => {
    if (!payerId) {
      setPlans([]);
      return;
    }
    api.getInsurancePlans(payerId).then((rows) => {
      setPlans(rows);
      setPlanId(rows[0]?.id ?? "");
    });
  }, [payerId]);

  async function handleSubmit() {
    if (!patientId || !payerId || !planId || !memberId.trim() || !policyNumber.trim() || !subscriberName.trim()) return;
    const input: NewCoverageInput = { patientId, payerId, planId, memberId: memberId.trim(), policyNumber: policyNumber.trim(), subscriberName: subscriberName.trim(), relationshipToSubscriber, rank, effectiveDate, expiryDate };
    await api.createCoverage(input);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Coverage"
      subtitle={patientName ? `For ${patientName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!payerId || !planId || !memberId.trim() || !policyNumber.trim() || !subscriberName.trim()}>
            Add Coverage
          </Button>
        </div>
      }
    >
      <FormSection title="Payer">
        <div className="mb-4">
          <FormField label="Payer">
            <select className={formInputClass} value={payerId} onChange={(e) => setPayerId(e.target.value)}>
              {payers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Plan">
          <select className={formInputClass} value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.planType})
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Policy Details">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Member ID">
            <input className={formInputClass} value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="e.g. EFU-M-12345" />
          </FormField>
          <FormField label="Policy Number">
            <input className={formInputClass} value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g. EFU-12345-A" />
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Subscriber Name">
            <input className={formInputClass} value={subscriberName} onChange={(e) => setSubscriberName(e.target.value)} />
          </FormField>
          <FormField label="Relationship to Subscriber">
            <select className={formInputClass} value={relationshipToSubscriber} onChange={(e) => setRelationshipToSubscriber(e.target.value as SubscriberRelationship)}>
              {relationshipOptions.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormField label="Effective Date">
            <input type="date" className={formInputClass} value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </FormField>
          <FormField label="Expiry Date">
            <input type="date" className={formInputClass} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Rank">
          <div className="flex gap-2">
            {(["primary", "secondary"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRank(r)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  rank === r ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo" : "border-line text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {r === "primary" ? "Primary" : "Secondary"}
              </button>
            ))}
          </div>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
