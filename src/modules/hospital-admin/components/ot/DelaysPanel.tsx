import { Card } from "@shared/design-system/components";
import type { DelayedCaseRow } from "@modules/hospital-admin/api";

interface DelaysPanelProps {
  cases: DelayedCaseRow[];
}

/** Module-local — Delay Management (spec §33): every recorded delay, sorted worst-first. */
export function DelaysPanel({ cases }: DelaysPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {cases.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No delays recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">OT</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Delay</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{c.roomNumber ?? "—"}</td>
                    <td className="py-2.5 pr-3">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-caution-amber/14 text-caution-amber">{c.delayMinutes} min</span>
                    </td>
                    <td className="py-2.5 text-on-surface-variant">{c.delayReason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
