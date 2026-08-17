import { Card } from "@shared/design-system/components";
import type { CancelledCaseRow, PostponedCaseRow } from "@modules/hospital-admin/api";

interface CancellationsPanelProps {
  cancelled: CancelledCaseRow[];
  postponed: PostponedCaseRow[];
}

/** Module-local — Cancellation Management (spec §32): cancelled and postponed cases, each auditable via the reason already captured at the point of cancellation/postponement. */
export function CancellationsPanel({ cancelled, postponed }: CancellationsPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Cancelled Cases</h2>
        {cancelled.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No cancelled cases.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cancelled.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.caseNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{c.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                    <td className="py-2.5 text-on-surface-variant">{c.cancelledReason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Postponed Cases</h2>
        {postponed.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No postponed cases.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {postponed.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.caseNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{c.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                    <td className="py-2.5 text-on-surface-variant">{c.postponedReason ?? "—"}</td>
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
