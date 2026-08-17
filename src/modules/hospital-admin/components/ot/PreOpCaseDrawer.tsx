import { useEffect, useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { consentStatusMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseDetail, ChecklistItem, ConsentStatus, ASAClass } from "@modules/hospital-admin/api";

const consentStatuses: ConsentStatus[] = ["required", "obtained", "verified", "withdrawn"];
const asaClasses: ASAClass[] = ["I", "II", "III", "IV", "V", "VI"];

interface PreOpCaseDrawerProps {
  caseDetail: SurgicalCaseDetail | null;
  onClose: () => void;
  onComplete: () => void;
  checklistTemplate: ChecklistItem[];
}

/** Module-local — shared Pre-Op / Consent / Anesthesia detail (spec §12-15), opened from both the Pre-Op and Anesthesia tabs. Every field here is structured short-form capture, never a freeform clinical note editor. */
export function PreOpCaseDrawer({ caseDetail, onClose, onComplete, checklistTemplate }: PreOpCaseDrawerProps) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("required");
  const [consentType, setConsentType] = useState("");
  const [consentObtainedBy, setConsentObtainedBy] = useState("");
  const [consentWitness, setConsentWitness] = useState("");
  const [consentDocRef, setConsentDocRef] = useState("");

  const [airway, setAirway] = useState("");
  const [history, setHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [asaClass, setAsaClass] = useState<ASAClass | "">("");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    if (caseDetail) {
      setConsentStatus(caseDetail.consent?.status ?? "required");
      setConsentType(caseDetail.consent?.type ?? "");
      setConsentObtainedBy(caseDetail.consent?.obtainedBy ?? "");
      setConsentWitness(caseDetail.consent?.witness ?? "");
      setConsentDocRef(caseDetail.consent?.documentRef ?? "");
      setAirway(caseDetail.anesthesiaAssessment?.airwayAssessment ?? "");
      setHistory(caseDetail.anesthesiaAssessment?.relevantHistory ?? "");
      setAllergies(caseDetail.anesthesiaAssessment?.allergies ?? "");
      setAsaClass(caseDetail.anesthesiaAssessment?.asaClass ?? "");
      setPlan(caseDetail.anesthesiaAssessment?.plan ?? "");
    }
    // Keyed on id, not the whole object: checklist toggles in this same
    // drawer trigger background refetches that replace `caseDetail`'s
    // reference constantly — resetting on every such refresh would silently
    // discard in-progress, unsaved Consent/Anesthesia form edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseDetail?.id]);

  async function toggleItem(itemId: string) {
    if (!caseDetail) return;
    await api.togglePreOpChecklistItem(caseDetail.id, itemId);
    onComplete();
  }

  async function saveConsent() {
    if (!caseDetail) return;
    await api.recordConsent(caseDetail.id, { status: consentStatus, type: consentType || undefined, obtainedBy: consentObtainedBy || undefined, witness: consentWitness || undefined, documentRef: consentDocRef || undefined });
    onComplete();
  }

  async function saveAnesthesiaAssessment() {
    if (!caseDetail) return;
    await api.recordAnesthesiaAssessment(caseDetail.id, {
      airwayAssessment: airway || undefined,
      relevantHistory: history || undefined,
      allergies: allergies || undefined,
      asaClass: asaClass || undefined,
      plan: plan || undefined,
    });
    onComplete();
  }

  async function markReady() {
    if (!caseDetail) return;
    await api.markReadyForOT(caseDetail.id);
    onComplete();
    onClose();
  }

  const completed = new Set(caseDetail?.preOpChecklistCompleted ?? []);

  return (
    <Drawer
      open={Boolean(caseDetail)}
      onClose={onClose}
      title={caseDetail?.caseNumber ?? ""}
      subtitle={caseDetail ? `${caseDetail.patientName} · ${caseDetail.procedureName}` : undefined}
      footer={
        caseDetail && (
          <div className="flex items-center justify-between gap-3">
            {caseDetail.preOpReady ? (
              <span className="text-sm font-bold text-vital-green">✓ Ready for OT</span>
            ) : (
              <span className="text-sm text-on-surface-variant">Not ready yet</span>
            )}
            <Button onClick={markReady} disabled={!caseDetail.preOpReady || caseDetail.status === "ready-for-ot"}>
              Mark Ready for OT
            </Button>
          </div>
        )
      }
    >
      {caseDetail && (
        <>
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Patient Preparation Checklist</h4>
            <div className="rounded-xl border border-line divide-y divide-line">
              {checklistTemplate.map((item) => {
                const done = completed.has(item.id);
                return (
                  <button key={item.id} type="button" onClick={() => toggleItem(item.id)} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-surface-container-low transition-all">
                    {done ? <CheckSquare size={16} className="text-vital-green flex-shrink-0" /> : <Square size={16} className="text-outline-variant flex-shrink-0" />}
                    <span className={`text-sm ${done ? "text-on-surface" : "text-on-surface-variant"}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <FormSection title="Consent">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Status">
                <select className={formInputClass} value={consentStatus} onChange={(e) => setConsentStatus(e.target.value as ConsentStatus)}>
                  {consentStatuses.map((s) => (
                    <option key={s} value={s}>
                      {consentStatusMeta[s].label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Consent Type">
                <input className={formInputClass} value={consentType} onChange={(e) => setConsentType(e.target.value)} placeholder="e.g. Surgical consent — general anesthesia" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Patient / Authorized Representative">
                <input className={formInputClass} value={consentObtainedBy} onChange={(e) => setConsentObtainedBy(e.target.value)} placeholder="Name" />
              </FormField>
              <FormField label="Witness">
                <input className={formInputClass} value={consentWitness} onChange={(e) => setConsentWitness(e.target.value)} placeholder="Name" />
              </FormField>
            </div>
            <div className="mb-4">
              <FormField label="Document Reference">
                <input className={formInputClass} value={consentDocRef} onChange={(e) => setConsentDocRef(e.target.value)} placeholder="e.g. CONSENT-2026-0150" />
              </FormField>
            </div>
            {caseDetail.consent?.obtainedAt && <p className="text-xs text-on-surface-variant mb-4">Recorded {formatDateTime(caseDetail.consent.obtainedAt)}</p>}
            <Button size="sm" variant="outline" onClick={saveConsent}>
              Save Consent
            </Button>
          </FormSection>

          <FormSection title="Pre-Anesthesia Assessment">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Airway Assessment">
                <input className={formInputClass} value={airway} onChange={(e) => setAirway(e.target.value)} placeholder="e.g. Mallampati I" />
              </FormField>
              <FormField label="ASA Classification">
                <select className={formInputClass} value={asaClass} onChange={(e) => setAsaClass(e.target.value as ASAClass)}>
                  <option value="">Not set</option>
                  {asaClasses.map((c) => (
                    <option key={c} value={c}>
                      ASA {c}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Relevant History">
                <input className={formInputClass} value={history} onChange={(e) => setHistory(e.target.value)} placeholder="e.g. No prior anesthesia complications" />
              </FormField>
              <FormField label="Allergies">
                <input className={formInputClass} value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. NKDA" />
              </FormField>
            </div>
            <div className="mb-4">
              <FormField label="Anesthesia Plan">
                <input className={formInputClass} value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="e.g. General anesthesia, standard induction" />
              </FormField>
            </div>
            {caseDetail.anesthesiaAssessment?.completedAt && (
              <p className="text-xs text-on-surface-variant mb-4">Completed {formatDateTime(caseDetail.anesthesiaAssessment.completedAt)}</p>
            )}
            <Button size="sm" variant="outline" onClick={saveAnesthesiaAssessment}>
              Save Assessment
            </Button>
          </FormSection>
        </>
      )}
    </Drawer>
  );
}
