import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import { formatSAR } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import * as api from "@modules/hospital-admin/api";
import type { ChargeView, CoverageType } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface CreateInvoiceDrawerProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/** Module-local — creates an Invoice from a patient's validated, unbilled charges (spec §7 "Billing Ready" → §15). */
export function CreateInvoiceDrawer({ open, onClose, onComplete }: CreateInvoiceDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [coverageType, setCoverageType] = useState<CoverageType | null>(null);
  const [eligibleCharges, setEligibleCharges] = useState<ChargeView[]>([]);
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [insuranceAmount, setInsuranceAmount] = useState(0);
  const [estimateSource, setEstimateSource] = useState<{ payerName?: string; contractNumber?: string } | null>(null);

  useEffect(() => {
    if (open) {
      setPatient(undefined);
      setCoverageType(null);
      setEligibleCharges([]);
      setSelectedChargeIds([]);
      setDiscountAmount(0);
      setInsuranceAmount(0);
      setEstimateSource(null);
    }
  }, [open]);

  useEffect(() => {
    if (!patient) {
      setEligibleCharges([]);
      setSelectedChargeIds([]);
      setCoverageType(null);
      return;
    }
    api.getCharges({ patientId: patient.id, status: "validated" }).then((rows) => {
      setEligibleCharges(rows);
      setSelectedChargeIds(rows.map((r) => r.id));
    });
    api.getPatientAccount(patient.id).then((account) => setCoverageType(account.coverageType));
  }, [patient]);

  function toggleCharge(id: string) {
    setSelectedChargeIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  useEffect(() => {
    if (!patient || selectedChargeIds.length === 0) {
      setEstimateSource(null);
      return;
    }
    api.estimateInsuranceAmount(patient.id, selectedChargeIds).then((estimate) => {
      if (estimate.amount > 0) {
        setInsuranceAmount(estimate.amount);
        setEstimateSource({ payerName: estimate.payerName, contractNumber: estimate.contractNumber });
      } else {
        setEstimateSource(null);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, selectedChargeIds.join(",")]);

  const selectedCharges = eligibleCharges.filter((c) => selectedChargeIds.includes(c.id));
  const grossAmount = selectedCharges.reduce((sum, c) => sum + c.amount, 0);
  const patientResponsibility = Math.max(0, grossAmount - discountAmount - insuranceAmount);

  async function handleSubmit() {
    if (!patient || selectedChargeIds.length === 0) return;
    await api.createInvoiceFromCharges({ patientId: patient.id, chargeIds: selectedChargeIds, discountAmount, insuranceAmount });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create Invoice"
      subtitle="Bill a patient's validated charges."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!patient || selectedChargeIds.length === 0}>
            Create Invoice
          </Button>
        </div>
      }
    >
      <FormSection title="Patient">
        <PatientPicker value={patient} onChange={setPatient} />
      </FormSection>

      {patient && (
        <FormSection title="Validated Charges">
          {eligibleCharges.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No validated, unbilled charges for this patient. Validate charges in Charge Review first.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {eligibleCharges.map((c) => (
                <label key={c.id} className="flex items-center justify-between gap-3 rounded-input border border-line px-3.5 py-2.5 cursor-pointer hover:bg-surface-container-low transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <input type="checkbox" className="accent-signal-indigo" checked={selectedChargeIds.includes(c.id)} onChange={() => toggleCharge(c.id)} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{c.serviceName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {c.quantity} × {formatSAR(c.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-on-surface flex-shrink-0">{formatSAR(c.amount)}</span>
                </label>
              ))}
            </div>
          )}
        </FormSection>
      )}

      {selectedCharges.length > 0 && (
        <FormSection title="Adjustments">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <FormField label="Discount (SAR)">
              <input
                type="number"
                min={0}
                max={grossAmount}
                className={formInputClass}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Math.min(grossAmount, Number(e.target.value) || 0)))}
              />
            </FormField>
            {(coverageType === "insurance" || coverageType === "corporate") && (
              <FormField label="Expected Insurance Amount (SAR)">
                <input
                  type="number"
                  min={0}
                  max={grossAmount - discountAmount}
                  className={formInputClass}
                  value={insuranceAmount}
                  onChange={(e) => setInsuranceAmount(Math.max(0, Math.min(grossAmount - discountAmount, Number(e.target.value) || 0)))}
                />
              </FormField>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mb-1">
            {estimateSource
              ? `Pre-filled from ${estimateSource.payerName}'s contract ${estimateSource.contractNumber} — a real, computed estimate, not an insurer-confirmed adjudication. Editable.`
              : "No contract rate found for this patient's coverage — enter a billing-staff estimate manually."}
          </p>
          <div className="rounded-xl border border-line px-4 py-3 mt-2 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Gross Amount</span>
              <span className="font-semibold text-on-surface">{formatSAR(grossAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Discount</span>
              <span className="font-semibold text-on-surface">{formatSAR(discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Insurance</span>
              <span className="font-semibold text-on-surface">{formatSAR(insuranceAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 mt-0.5">
              <span className="font-bold text-on-surface">Patient Responsibility</span>
              <span className="font-bold text-signal-indigo">{formatSAR(patientResponsibility)}</span>
            </div>
          </div>
        </FormSection>
      )}
    </Drawer>
  );
}
