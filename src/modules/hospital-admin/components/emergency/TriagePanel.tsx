import { Card, Button } from "@shared/design-system/components";
import { arrivalModeLabels, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyQueueRow } from "@modules/hospital-admin/api";

interface TriagePanelProps {
  rows: EmergencyQueueRow[];
  onTriage: (id: string) => void;
}

/** Module-local — Triage worklist (spec §3): Patient Arrival -> Registration -> Triage. Only patients still waiting for triage show here. */
export function TriagePanel({ rows, onTriage }: TriagePanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Card hero>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No patients waiting for triage.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {rows.map((r) => (
              <div key={r.id} className="py-3.5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-on-surface">{r.queueNumber} — {r.patientName} <span className="font-normal text-on-surface-variant">({r.age}/{r.sex})</span></p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{r.chiefComplaint}</p>
                  <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Arrived {formatDateTime(r.arrivalTime)} · {arrivalModeLabels[r.arrivalMode]} · waiting {r.waitMinutes}m</p>
                </div>
                <Button size="sm" onClick={() => onTriage(r.id)}>Perform Triage</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
