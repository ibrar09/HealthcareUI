import { Card, Button, StatusChip } from "@shared/design-system/components";
import { surgicalCaseStatusMeta, surgeryPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseRow } from "@modules/hospital-admin/api";

interface SurgerySchedulePanelProps {
  cases: SurgicalCaseRow[];
  onView: (id: string) => void;
  onDelay: (c: SurgicalCaseRow) => void;
  onReschedule: (c: SurgicalCaseRow) => void;
  onCancel: (c: SurgicalCaseRow) => void;
}

/** Module-local — Today's Surgery Schedule (spec §6). Start/Transfer actions belong to Phase 2's Intra-Op screen and aren't wired here yet — this stays a scheduling view. */
export function SurgerySchedulePanel({ cases, onView, onDelay, onReschedule, onCancel }: SurgerySchedulePanelProps) {
  const cancellable = new Set(["requested", "approved", "scheduled", "pre-op-pending", "pre-op-cleared", "ready-for-ot"]);
  return (
    <div className="pb-8">
      <Card hero>
        {cases.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No surgeries scheduled for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Surgeon</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">OT</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Anesthesia</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cases.map((c) => {
                  const status = surgicalCaseStatusMeta[c.status];
                  const priority = surgeryPriorityMeta[c.priority];
                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface whitespace-nowrap">{c.scheduledDateTime ? formatDateTime(c.scheduledDateTime) : "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <span>{c.procedureName}</span>
                          {c.priority === "emergency" && (
                            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                              EMERGENCY
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.surgeonName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.roomNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.anesthesiaType ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <StatusChip tone="neutral">
                          <span style={{ color: status.color }}>{status.label}</span>
                        </StatusChip>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button size="sm" variant="ghost" onClick={() => onView(c.id)}>
                            View
                          </Button>
                          {cancellable.has(c.status) && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => onDelay(c)}>
                                Delay
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onReschedule(c)}>
                                Reschedule
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onCancel(c)}>
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
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
