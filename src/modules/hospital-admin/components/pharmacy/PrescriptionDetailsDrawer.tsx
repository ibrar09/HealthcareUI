import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Drawer, Button, StatusChip } from "@shared/design-system/components";
import { prescriptionStatusMeta, prescriptionPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { PrescriptionDetail, VerificationWarning } from "@modules/hospital-admin/api";

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="text-xs text-on-surface-variant flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right">{value ?? "—"}</span>
    </div>
  );
}

const warningLabels: Record<VerificationWarning["type"], string> = {
  allergy: "Allergy",
  "duplicate-therapy": "Duplicate Therapy",
  "expired-medication": "Expired Medication",
  "stock-unavailable": "Stock Unavailable",
  "missing-information": "Missing Information",
};

interface PrescriptionDetailsDrawerProps {
  prescription: PrescriptionDetail | null;
  warnings: VerificationWarning[];
  onClose: () => void;
  onReceive: () => void;
  onStartReview: () => void;
  onVerify: () => void;
  onReject: () => void;
  onStartPreparing: () => void;
  onMarkReady: () => void;
  onDispense: () => void;
  onReturn: () => void;
  onCancel: () => void;
}

/** Module-local — Prescription Management + Medication Verification (spec §3-4): full structured detail, live-computed warnings (never a clinical-decision-support engine replacing pharmacist judgment), and every workflow action for the current status. */
export function PrescriptionDetailsDrawer({ prescription, warnings, onClose, onReceive, onStartReview, onVerify, onReject, onStartPreparing, onMarkReady, onDispense, onReturn, onCancel }: PrescriptionDetailsDrawerProps) {
  const status = prescription ? prescriptionStatusMeta[prescription.status] : null;
  const priority = prescription ? prescriptionPriorityMeta[prescription.priority] : null;

  const canCancel = Boolean(prescription) && !["dispensed", "cancelled", "rejected"].includes(prescription!.status);
  const canReturn = prescription?.status === "dispensed" || prescription?.status === "partially-dispensed";

  return (
    <Drawer
      open={Boolean(prescription)}
      onClose={onClose}
      title={prescription?.prescriptionNumber ?? ""}
      subtitle={prescription ? `${prescription.patientName} · ${prescription.medicationSummary}` : undefined}
      footer={
        prescription && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {canReturn && (
                <Button variant="outline" size="sm" onClick={onReturn}>
                  Record Return
                </Button>
              )}
              {canCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {prescription.status === "new" && <Button onClick={onReceive}>Receive</Button>}
              {prescription.status === "received" && <Button onClick={onStartReview}>Start Verification</Button>}
              {prescription.status === "under-review" && (
                <>
                  <Button variant="outline" onClick={onReject}>
                    Reject
                  </Button>
                  <Button onClick={onVerify}>Verify</Button>
                </>
              )}
              {prescription.status === "verified" && <Button onClick={onStartPreparing}>Start Preparing</Button>}
              {prescription.status === "preparing" && <Button onClick={onMarkReady}>Mark Ready</Button>}
              {(prescription.status === "ready" || prescription.status === "dispensing") && <Button onClick={onDispense}>Dispense</Button>}
            </div>
          </div>
        )
      }
    >
      {prescription && status && priority && (
        <>
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <StatusChip tone="neutral">
              <span style={{ color: status.color }}>{status.label}</span>
            </StatusChip>
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
              {priority.label}
            </span>
            {prescription.controlledSubstance && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pulse-coral/14 text-pulse-coral text-xs font-bold px-2.5 py-1">
                <ShieldAlert size={12} /> Controlled Substance
              </span>
            )}
          </div>

          {warnings.length > 0 && (
            <div className="mb-6 rounded-xl border border-pulse-coral/30 bg-pulse-coral/5 px-4 py-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-pulse-coral mb-2 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Verification Warnings
              </h4>
              <div className="flex flex-col gap-1.5">
                {warnings.map((w, i) => (
                  <p key={i} className="text-sm text-on-surface">
                    <span className="font-semibold">{warningLabels[w.type]}:</span> {w.message}
                  </p>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2">Structured flags only — final clinical judgment stays with the pharmacist.</p>
            </div>
          )}

          {(prescription.cancelledReason || prescription.rejectedReason || prescription.returnedReason) && (
            <div className="mb-6 rounded-xl border border-line px-4 py-3">
              {prescription.cancelledReason && (
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Cancelled:</span> {prescription.cancelledReason}
                </p>
              )}
              {prescription.rejectedReason && (
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Rejected:</span> {prescription.rejectedReason}
                </p>
              )}
              {prescription.returnedReason && (
                <p className="text-sm text-on-surface">
                  <span className="font-semibold">Returned:</span> {prescription.returnedReason}
                </p>
              )}
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Prescription</h4>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Patient" value={prescription.patientName} />
              <Row label="Prescriber" value={prescription.prescriberName} />
              <Row label="Department" value={prescription.departmentName} />
              <Row label="Encounter" value={prescription.encounterId} />
              <Row label="Prescription Date" value={formatDateTime(prescription.prescriptionDate)} />
              <Row label="Pharmacist" value={prescription.pharmacistName} />
              <Row label="Verified" value={prescription.verifiedAt ? `${formatDateTime(prescription.verifiedAt)} by ${prescription.verifiedByName}` : undefined} />
              <Row label="Dispensed" value={prescription.dispensedAt ? `${formatDateTime(prescription.dispensedAt)} by ${prescription.dispensedByName}` : undefined} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Medications</h4>
            <div className="flex flex-col gap-3">
              {prescription.itemRows.map((item) => (
                <div key={item.id} className="rounded-xl border border-line px-4 py-3.5">
                  <p className="text-sm font-bold text-on-surface mb-2">
                    {item.medicationName} {item.medicationStrength}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="uppercase tracking-wide text-on-surface-variant">Dose / Route</p>
                      <p className="font-semibold text-on-surface capitalize">
                        {item.dose} · {item.route}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-on-surface-variant">Frequency / Duration</p>
                      <p className="font-semibold text-on-surface">
                        {item.frequency} · {item.duration}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-on-surface-variant">Quantity</p>
                      <p className="font-semibold text-on-surface">
                        {item.quantityDispensed}/{item.quantity} dispensed
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-on-surface-variant">Refills</p>
                      <p className="font-semibold text-on-surface">
                        {item.refillsUsed}/{item.refillsAllowed} used
                      </p>
                    </div>
                  </div>
                  {item.instructions && <p className="text-xs text-on-surface-variant mt-2">{item.instructions}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
