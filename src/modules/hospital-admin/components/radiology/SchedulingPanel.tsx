import { CalendarClock } from "lucide-react";
import { Button, Card } from "@shared/design-system/components";
import { imagingOrderStatusMeta, formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { ImagingOrderRow } from "@modules/hospital-admin/api";

interface SchedulingPanelProps {
  readyToSchedule: ImagingOrderRow[];
  scheduled: ImagingOrderRow[];
  onSchedule: (order: ImagingOrderRow) => void;
  onView: (order: ImagingOrderRow) => void;
}

/** Module-local — Radiology "Scheduling" tab (spec §9): list view of every scheduled study, plus the queue of authorized orders still waiting to be scheduled. */
export function SchedulingPanel({ readyToSchedule, scheduled, onSchedule, onView }: SchedulingPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <CalendarClock size={16} className="text-signal-indigo" /> Ready to Schedule
        </h2>
        {readyToSchedule.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No authorized orders waiting to be scheduled.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {readyToSchedule.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {o.patientName} · {o.studyName}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {o.orderNumber} · {o.orderingPractitionerName}
                  </p>
                </div>
                <Button size="sm" onClick={() => onSchedule(o)} className="flex-shrink-0">
                  Schedule
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Scheduled Studies</h2>
        {scheduled.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No scheduled studies.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Study</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Modality</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Room</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Technologist</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {scheduled.map((o) => {
                  const status = imagingOrderStatusMeta[o.status];
                  return (
                    <tr key={o.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onView(o)}>
                      <td className="py-2.5 pr-3 font-mono text-on-surface">{o.scheduledDateTime ? formatDateTime(o.scheduledDateTime) : "—"}</td>
                      <td className="py-2.5 pr-3 font-medium text-on-surface">{o.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.studyName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant uppercase">{o.modality ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.roomNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{o.technologistName ?? "—"}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${status.color} 16%, transparent)`, color: status.color }}>
                          {status.label}
                        </span>
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
