import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { pacuStatusMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseDetail, PacuStatus, PacuDestination } from "@modules/hospital-admin/api";

const pacuStatuses: PacuStatus[] = ["waiting", "arrived", "recovery", "ready-for-transfer", "transferred"];
const destinations: PacuDestination[] = ["ward", "icu", "hdu", "emergency", "other"];
const destinationLabels: Record<PacuDestination, string> = { ward: "Ward", icu: "ICU", hdu: "HDU", emergency: "Emergency", other: "Other" };

interface RecoveryCaseDrawerProps {
  caseDetail: SurgicalCaseDetail | null;
  onClose: () => void;
  onComplete: () => void;
  onMoveToRecovery: () => void;
}

/** Module-local — Recovery/PACU detail (spec §24-26): PACU status cycling and the post-op note capture that hands the patient off to their destination unit. */
export function RecoveryCaseDrawer({ caseDetail, onClose, onComplete, onMoveToRecovery }: RecoveryCaseDrawerProps) {
  const [patientCondition, setPatientCondition] = useState("");
  const [painAssessment, setPainAssessment] = useState("");
  const [recoveryAssessment, setRecoveryAssessment] = useState("");
  const [postOpOrders, setPostOpOrders] = useState("");
  const [followUpPlan, setFollowUpPlan] = useState("");

  useEffect(() => {
    if (caseDetail) {
      setPatientCondition(caseDetail.postOpNote?.patientCondition ?? "");
      setPainAssessment(caseDetail.postOpNote?.painAssessment ?? "");
      setRecoveryAssessment(caseDetail.postOpNote?.recoveryAssessment ?? "");
      setPostOpOrders(caseDetail.postOpNote?.postOpOrders ?? "");
      setFollowUpPlan(caseDetail.postOpNote?.followUpPlan ?? "");
    }
    // Keyed on id, not the whole object — PACU status buttons in this same
    // drawer trigger background refetches that would otherwise wipe an
    // in-progress, unsaved post-op note. See PreOpCaseDrawer for the same fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseDetail?.id]);

  async function setStatus(status: PacuStatus) {
    if (!caseDetail) return;
    await api.setPacuStatus(caseDetail.id, status);
    onComplete();
  }

  async function transferOut() {
    if (!caseDetail) return;
    await api.recordPostOpNoteAndTransfer(caseDetail.id, {
      patientCondition: patientCondition || undefined,
      painAssessment: painAssessment || undefined,
      recoveryAssessment: recoveryAssessment || undefined,
      postOpOrders: postOpOrders || undefined,
      followUpPlan: followUpPlan || undefined,
    });
    onComplete();
    onClose();
  }

  const inPacu = caseDetail?.status === "recovery";

  return (
    <Drawer
      open={Boolean(caseDetail)}
      onClose={onClose}
      title={caseDetail?.caseNumber ?? ""}
      subtitle={caseDetail ? `${caseDetail.patientName} · ${caseDetail.procedureName}` : undefined}
      footer={
        caseDetail && (
          <div className="flex items-center justify-end gap-2">
            {caseDetail.status === "surgery-completed" && <Button onClick={onMoveToRecovery}>Move to Recovery</Button>}
            {inPacu && (
              <Button onClick={transferOut} disabled={caseDetail.pacuStatus !== "ready-for-transfer" && caseDetail.pacuStatus !== "transferred"}>
                Record Note & Transfer
              </Button>
            )}
          </div>
        )
      }
    >
      {caseDetail && (
        <>
          {caseDetail.status === "surgery-completed" && (
            <p className="mb-6 text-sm text-on-surface-variant">Surgery is complete. Move this patient to Recovery/PACU to begin post-op tracking.</p>
          )}

          {(inPacu || caseDetail.pacuStatus) && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">PACU Status</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {pacuStatuses.map((s) => {
                  const meta = pacuStatusMeta[s];
                  const active = caseDetail.pacuStatus === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className="rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
                      style={active ? { backgroundColor: `color-mix(in srgb, ${meta.color} 16%, transparent)`, color: meta.color, borderColor: meta.color } : { borderColor: "var(--line)", color: "var(--on-surface-variant)" }}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              {caseDetail.pacuArrivalAt && <p className="text-xs text-on-surface-variant">Arrived {formatDateTime(caseDetail.pacuArrivalAt)}</p>}
              {caseDetail.pacuDestination && <p className="text-xs text-on-surface-variant">Destination: {destinationLabels[caseDetail.pacuDestination]}</p>}
            </div>
          )}

          {inPacu && (
            <FormSection title="Post-Op Note">
              <div className="mb-4">
                <FormField label="Patient Condition">
                  <input className={formInputClass} value={patientCondition} onChange={(e) => setPatientCondition(e.target.value)} placeholder="e.g. Stable, vitals within normal limits" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField label="Pain Assessment">
                  <input className={formInputClass} value={painAssessment} onChange={(e) => setPainAssessment(e.target.value)} placeholder="e.g. 3/10" />
                </FormField>
                <FormField label="Recovery Assessment">
                  <input className={formInputClass} value={recoveryAssessment} onChange={(e) => setRecoveryAssessment(e.target.value)} placeholder="e.g. Alert, appropriate for transfer" />
                </FormField>
              </div>
              <div className="mb-4">
                <FormField label="Post-Op Orders">
                  <input className={formInputClass} value={postOpOrders} onChange={(e) => setPostOpOrders(e.target.value)} placeholder="e.g. Routine monitoring, ambulate day 1" />
                </FormField>
              </div>
              <FormField label="Follow-Up Plan">
                <input className={formInputClass} value={followUpPlan} onChange={(e) => setFollowUpPlan(e.target.value)} placeholder="e.g. Surgical follow-up in 2 weeks" />
              </FormField>
            </FormSection>
          )}
        </>
      )}
    </Drawer>
  );
}
