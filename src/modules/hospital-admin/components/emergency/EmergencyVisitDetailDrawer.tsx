import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Drawer, Button } from "@shared/design-system/components";
import { formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { visitStatusMeta, arrivalModeLabels, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyVisitStatus, EmergencyArrivalMode, EmergencyVitals } from "@modules/hospital-admin/api";

type VisitDetail = {
  id: string;
  queueNumber: string;
  patientName: string;
  age: number;
  sex: string;
  arrivalTime: string;
  arrivalMode: EmergencyArrivalMode;
  chiefComplaint: string;
  status: EmergencyVisitStatus;
  allergies: string[];
  conditions: string[];
  currentMedications: string[];
  previousVisitCount: number;
  triageCategoryName?: string;
  triageColor?: string;
  assignedAreaName?: string;
  assignedDoctorName?: string;
  assignedNurseName?: string;
  triagedByName?: string;
  vitalsHistory: EmergencyVitals[];
  waitMinutes: number;
};

interface DoctorOption {
  id: string;
  name: string;
}

interface EmergencyVisitDetailDrawerProps {
  visit: VisitDetail | null;
  onClose: () => void;
  doctors: DoctorOption[];
  nurses: DoctorOption[];
  onAssign: (doctorId: string, nurseId: string) => void;
  onMarkLeft: () => void;
  onOpenTriage: () => void;
  onOpenTreatment: () => void;
}

/** Module-local — Emergency Patient Details (spec §4, folded into the Queue as a drawer per this project's established pattern). */
export function EmergencyVisitDetailDrawer({ visit, onClose, doctors, nurses, onAssign, onMarkLeft, onOpenTriage, onOpenTreatment }: EmergencyVisitDetailDrawerProps) {
  const [doctorId, setDoctorId] = useState("");
  const [nurseId, setNurseId] = useState("");
  const status = visit ? visitStatusMeta[visit.status] : null;

  return (
    <Drawer open={Boolean(visit)} onClose={onClose} title={visit?.queueNumber ?? ""} subtitle={visit ? `${visit.patientName} · ${visit.age}/${visit.sex}` : undefined}>
      {visit && status && (
        <>
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(status.color)}>{status.label}</span>
            {visit.triageCategoryName && (
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={statusPillStyle(visit.triageColor ?? "var(--outline)")}>{visit.triageCategoryName}</span>
            )}
            <span className="text-xs text-on-surface-variant">Waiting {visit.waitMinutes}m</span>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Arrival</h3>
            <p className="text-sm text-on-surface">{formatDateTime(visit.arrivalTime)} · {arrivalModeLabels[visit.arrivalMode]}</p>
            <p className="text-sm text-on-surface-variant mt-1">{visit.chiefComplaint}</p>
          </div>

          {visit.allergies.length > 0 && (
            <div className="mb-5 rounded-card bg-pulse-coral/5 border border-pulse-coral/20 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-pulse-coral mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Allergies</h3>
              <p className="text-sm text-on-surface">{visit.allergies.join(", ")}</p>
            </div>
          )}

          {(visit.conditions.length > 0 || visit.currentMedications.length > 0) && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">History</h3>
              {visit.conditions.length > 0 && <p className="text-sm text-on-surface">Conditions: {visit.conditions.join(", ")}</p>}
              {visit.currentMedications.length > 0 && <p className="text-sm text-on-surface-variant mt-1">Medications: {visit.currentMedications.join(", ")}</p>}
              <p className="text-xs text-on-surface-variant mt-1">{visit.previousVisitCount} previous ED visit(s)</p>
            </div>
          )}

          {visit.vitalsHistory.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Vitals</h3>
              <div className="flex flex-col divide-y divide-line">
                {[...visit.vitalsHistory].reverse().map((v) => (
                  <div key={v.id} className="py-2 text-sm">
                    <p className="text-xs text-on-surface-variant mb-0.5">{formatDateTime(v.recordedAt)}</p>
                    <p className="text-on-surface">
                      T {v.temperature ?? "—"}°C · HR {v.heartRate ?? "—"} · RR {v.respiratoryRate ?? "—"} · BP {v.bpSystolic ?? "—"}/{v.bpDiastolic ?? "—"} · SpO2 {v.spo2 ?? "—"}% · Pain {v.painScore ?? "—"}/10
                      {v.gcs !== undefined && ` · GCS ${v.gcs}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">Assignment</h3>
            <p className="text-sm text-on-surface">{visit.assignedAreaName ?? "Not yet assigned"}</p>
            <p className="text-sm text-on-surface-variant">Doctor: {visit.assignedDoctorName ?? "—"} · Nurse: {visit.assignedNurseName ?? "—"}</p>
            {visit.triagedByName && <p className="text-xs text-on-surface-variant mt-1">Triaged by {visit.triagedByName}</p>}
          </div>

          {visit.status === "waiting-doctor" && (
            <div className="mb-6 rounded-card border border-line p-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">Assign Doctor / Nurse</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select className={formInputClass} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <select className={formInputClass} value={nurseId} onChange={(e) => setNurseId(e.target.value)}>
                  <option value="">Select nurse</option>
                  {nurses.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <Button size="sm" disabled={!doctorId && !nurseId} onClick={() => onAssign(doctorId, nurseId)}>Assign</Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {visit.status === "waiting-triage" && <Button size="sm" onClick={onOpenTriage}>Perform Triage</Button>}
            {(visit.status === "waiting-doctor" || visit.status === "in-treatment") && <Button size="sm" onClick={onOpenTreatment}>Open Treatment Workspace</Button>}
            {(visit.status === "waiting-triage" || visit.status === "waiting-doctor") && (
              <Button size="sm" variant="ghost" onClick={onMarkLeft}>Mark Left Without Treatment</Button>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
