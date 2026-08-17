import { FileText, ClipboardList } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { visitStatusMeta, arrivalModeLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyQueueRow } from "@modules/hospital-admin/api";

type WorkspaceRow = EmergencyQueueRow & { hasAssessment: boolean; openOrderCount: number };

interface DoctorOption {
  id: string;
  name: string;
}

interface TreatmentPanelProps {
  doctorId: string;
  onDoctorChange: (id: string) => void;
  doctors: DoctorOption[];
  rows: WorkspaceRow[];
  onOpenAssessment: (id: string) => void;
  onOpenOrders: (id: string) => void;
}

/** Module-local — Emergency Doctor Workspace (spec §7-8): My Emergency Patients, one card per active case. */
export function TreatmentPanel({ doctorId, onDoctorChange, doctors, rows, onOpenAssessment, onOpenOrders }: TreatmentPanelProps) {
  const critical = rows.filter((r) => r.triageCategoryId === "triage-critical").length;
  const urgent = rows.filter((r) => r.triageCategoryId === "triage-urgent" || r.triageCategoryId === "triage-emergent").length;
  const waiting = rows.filter((r) => r.status === "waiting-doctor").length;
  const observation = rows.filter((r) => r.status === "in-observation").length;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-on-surface-variant">Viewing patients for:</span>
        <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={doctorId} onChange={(e) => onDoctorChange(e.target.value)}>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card accentColor="var(--pulse-coral)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Critical</p><p className="text-2xl font-mono font-bold text-on-surface">{critical}</p></Card>
        <Card accentColor="var(--caution-amber)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Urgent</p><p className="text-2xl font-mono font-bold text-on-surface">{urgent}</p></Card>
        <Card accentColor="var(--signal-indigo)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Waiting</p><p className="text-2xl font-mono font-bold text-on-surface">{waiting}</p></Card>
        <Card accentColor="var(--module-radiology)"><p className="text-xs font-semibold text-on-surface-variant uppercase">Observation</p><p className="text-2xl font-mono font-bold text-on-surface">{observation}</p></Card>
      </div>

      {rows.length === 0 ? (
        <Card hero><p className="text-center text-sm text-on-surface-variant py-8">No active patients assigned to this doctor.</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((r) => {
            const status = visitStatusMeta[r.status];
            return (
              <Card hero key={r.id} accentColor={r.triageColor}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{r.queueNumber} — {r.patientName}</p>
                    <p className="text-xs text-on-surface-variant">{r.age}/{r.sex} · {arrivalModeLabels[r.arrivalMode]} · {formatDateTime(r.arrivalTime)}</p>
                  </div>
                  {r.triageCategoryName && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0" style={statusPillStyle(r.triageColor ?? "var(--outline)")}>{r.triageCategoryName}</span>}
                </div>
                <p className="text-sm text-on-surface-variant mb-2">{r.chiefComplaint}</p>
                {r.latestVitals && (
                  <p className="text-xs text-on-surface-variant mb-3">
                    HR {r.latestVitals.heartRate ?? "—"} · BP {r.latestVitals.bpSystolic ?? "—"}/{r.latestVitals.bpDiastolic ?? "—"} · SpO2 {r.latestVitals.spo2 ?? "—"}%
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
                  <span className="text-xs text-on-surface-variant">{r.openOrderCount} open order(s)</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => onOpenAssessment(r.id)}><FileText size={13} /> {r.hasAssessment ? "Edit" : "Document"} Assessment</Button>
                  <Button size="sm" variant="outline" onClick={() => onOpenOrders(r.id)}><ClipboardList size={13} /> Orders</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
