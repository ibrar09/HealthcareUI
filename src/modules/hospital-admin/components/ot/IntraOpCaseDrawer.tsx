import { CheckSquare, Square } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import * as api from "@modules/hospital-admin/api";
import type { SurgicalCaseDetail, SafetyChecklistStage, ChecklistItem } from "@modules/hospital-admin/api";

const stageLabels: Record<SafetyChecklistStage, string> = {
  "before-anesthesia": "Before Anesthesia",
  "before-incision": "Before Incision",
  "before-patient-leaves-ot": "Before Patient Leaves OT",
};

interface IntraOpCaseDrawerProps {
  caseDetail: SurgicalCaseDetail | null;
  onClose: () => void;
  onComplete: () => void;
  safetyChecklistTemplate: Record<SafetyChecklistStage, ChecklistItem[]>;
  onCompleteSurgery: () => void;
}

/** Module-local — Intra-Op detail (spec §16-18): the three-stage surgical safety checklist plus time-tracking actions (Transfer → Anesthesia Start → Surgery Start → Complete). Complete Surgery hands off to the Procedure Documentation drawer rather than closing the case here. */
export function IntraOpCaseDrawer({ caseDetail, onClose, onComplete, safetyChecklistTemplate, onCompleteSurgery }: IntraOpCaseDrawerProps) {
  async function toggle(stage: SafetyChecklistStage, itemId: string) {
    if (!caseDetail) return;
    await api.toggleSafetyChecklistItem(caseDetail.id, stage, itemId);
    onComplete();
  }

  async function transferPatient() {
    if (!caseDetail) return;
    await api.transferPatientToOT(caseDetail.id);
    onComplete();
  }

  async function startAnesthesia() {
    if (!caseDetail) return;
    await api.startCaseAnesthesia(caseDetail.id);
    onComplete();
  }

  async function startSurgery() {
    if (!caseDetail) return;
    await api.startCaseSurgery(caseDetail.id);
    onComplete();
  }

  const completedByStage = caseDetail?.safetyChecklistCompleted ?? {};

  return (
    <Drawer
      open={Boolean(caseDetail)}
      onClose={onClose}
      title={caseDetail?.caseNumber ?? ""}
      subtitle={caseDetail ? `${caseDetail.patientName} · ${caseDetail.procedureName}` : undefined}
      footer={
        caseDetail && (
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {caseDetail.status === "ready-for-ot" && <Button onClick={transferPatient}>Transfer Patient to OT</Button>}
            {caseDetail.status === "patient-transferred" && <Button onClick={startAnesthesia}>Start Anesthesia</Button>}
            {caseDetail.status === "anesthesia-started" && <Button onClick={startSurgery}>Start Surgery</Button>}
            {caseDetail.status === "surgery-started" && <Button onClick={onCompleteSurgery}>Complete Surgery</Button>}
          </div>
        )
      }
    >
      {caseDetail && (
        <>
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Time Tracking</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Room Entry</p>
                <p className="text-sm font-semibold text-on-surface">{caseDetail.roomEntryAt ? formatDateTime(caseDetail.roomEntryAt) : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Anesthesia Start</p>
                <p className="text-sm font-semibold text-on-surface">{caseDetail.anesthesiaStartAt ? formatDateTime(caseDetail.anesthesiaStartAt) : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Procedure Start</p>
                <p className="text-sm font-semibold text-on-surface">{caseDetail.procedureStartAt ? formatDateTime(caseDetail.procedureStartAt) : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Procedure End</p>
                <p className="text-sm font-semibold text-on-surface">{caseDetail.procedureEndAt ? formatDateTime(caseDetail.procedureEndAt) : "—"}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Surgical Safety Checklist</h4>
            {(Object.keys(safetyChecklistTemplate) as SafetyChecklistStage[]).map((stage) => {
              const completed = new Set(completedByStage[stage] ?? []);
              return (
                <div key={stage} className="mb-4">
                  <p className="text-xs font-bold text-on-surface mb-1.5">{stageLabels[stage]}</p>
                  <div className="rounded-xl border border-line divide-y divide-line">
                    {safetyChecklistTemplate[stage].map((item) => {
                      const done = completed.has(item.id);
                      return (
                        <button key={item.id} type="button" onClick={() => toggle(stage, item.id)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left hover:bg-surface-container-low transition-all">
                          {done ? <CheckSquare size={15} className="text-vital-green flex-shrink-0" /> : <Square size={15} className="text-outline-variant flex-shrink-0" />}
                          <span className={`text-sm ${done ? "text-on-surface" : "text-on-surface-variant"}`}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Drawer>
  );
}
