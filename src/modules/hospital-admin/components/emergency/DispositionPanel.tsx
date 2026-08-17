import { Card, Button } from "@shared/design-system/components";
import { dispositionTypeMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/emergency/emergencyStatusMeta";
import type { EmergencyQueueRow, EmergencyDispositionType } from "@modules/hospital-admin/api";

type DispositionRow = {
  id: string;
  queueNumber: string;
  patientName: string;
  type: EmergencyDispositionType;
  decidedByName: string;
  decidedAt: string;
  targetDepartmentName?: string;
  receivingOrganization?: string;
  transferStatus?: "requested" | "in-transit" | "completed";
};

interface DispositionPanelProps {
  pendingVisits: EmergencyQueueRow[];
  dispositions: DispositionRow[];
  onDischarge: (visitId: string) => void;
  onAdmit: (visitId: string) => void;
  onTransfer: (visitId: string) => void;
  onAdvanceTransfer: (id: string) => void;
}

/** Module-local — Emergency Disposition (spec §17-20): Discharge / Admission / Transfer, one consolidated tab per the user's own MVP bundling. */
export function DispositionPanel({ pendingVisits, dispositions, onDischarge, onAdmit, onTransfer, onAdvanceTransfer }: DispositionPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Awaiting Disposition</h2>
        {pendingVisits.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No patients currently awaiting a disposition decision.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {pendingVisits.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-on-surface">{v.queueNumber} — {v.patientName}</p>
                  <p className="text-xs text-on-surface-variant">{v.chiefComplaint}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onDischarge(v.id)}>Discharge</Button>
                  <Button size="sm" variant="outline" onClick={() => onAdmit(v.id)}>Admit</Button>
                  <Button size="sm" variant="outline" onClick={() => onTransfer(v.id)}>Transfer</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Disposition History</h2>
        {dispositions.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No dispositions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Type</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Destination</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Decided By</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {dispositions.map((d) => {
                  const meta = dispositionTypeMeta[d.type];
                  return (
                    <tr key={d.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{d.queueNumber} — {d.patientName}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(meta.color)}>{meta.label}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{d.targetDepartmentName ?? d.receivingOrganization ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{d.decidedByName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(d.decidedAt)}</td>
                      <td className="py-2.5 text-right">
                        {d.type === "transfer" && d.transferStatus !== "completed" && (
                          <Button size="sm" variant="outline" onClick={() => onAdvanceTransfer(d.id)}>
                            {d.transferStatus === "requested" ? "Mark In Transit" : "Mark Completed"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
