import { Button, Card } from "@shared/design-system/components";
import { imagingOrderStatusMeta, imagingPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { ImagingOrderRow } from "@modules/hospital-admin/api";

interface RadiologyWorklistPanelProps {
  orders: ImagingOrderRow[];
  onCheckIn: (order: ImagingOrderRow) => void;
  onStart: (order: ImagingOrderRow) => void;
  onComplete: (order: ImagingOrderRow) => void;
  onView: (order: ImagingOrderRow) => void;
}

const priorityOrder = { stat: 0, urgent: 1, asap: 2, routine: 3 } as const;

/** Module-local — Radiology "Worklist" tab (spec §11): what technologists actually work from — scheduled/checked-in/in-progress, sorted by priority, with the next action inline. */
export function RadiologyWorklistPanel({ orders, onCheckIn, onStart, onComplete, onView }: RadiologyWorklistPanelProps) {
  const sorted = [...orders].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="pb-8">
      <Card hero>
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">Nothing scheduled, checked-in, or in-progress right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Study</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Modality</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Room</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sorted.map((o) => {
                  const priority = imagingPriorityMeta[o.priority];
                  const status = imagingOrderStatusMeta[o.status];
                  return (
                    <tr key={o.id}>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-on-surface">{o.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.studyName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant uppercase">{o.modality ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.roomNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.scheduledDateTime ? formatDateTime(o.scheduledDateTime) : "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${status.color} 16%, transparent)`, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {o.status === "scheduled" && (
                          <Button size="sm" onClick={() => onCheckIn(o)}>
                            Check In
                          </Button>
                        )}
                        {o.status === "checked-in" && (
                          <Button size="sm" onClick={() => onStart(o)}>
                            Start
                          </Button>
                        )}
                        {o.status === "in-progress" && (
                          <Button size="sm" onClick={() => onComplete(o)}>
                            Complete
                          </Button>
                        )}
                        {o.status !== "scheduled" && o.status !== "checked-in" && o.status !== "in-progress" && (
                          <Button size="sm" variant="outline" onClick={() => onView(o)}>
                            View
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
