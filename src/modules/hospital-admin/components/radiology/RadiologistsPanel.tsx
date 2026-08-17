import { UserRound } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { RadiologistRow } from "@modules/hospital-admin/api";

interface RadiologistsPanelProps {
  radiologists: RadiologistRow[];
  onSelect: (radiologist: RadiologistRow) => void;
}

/** Module-local — Radiology "Radiologists" tab (spec §15): a workload/credentials roster, joined off Staff & Workforce's own record, not a second personnel system. */
export function RadiologistsPanel({ radiologists, onSelect }: RadiologistsPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {radiologists.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No radiologists on file for this department.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Radiologist</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Specialty</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">License</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Studies Today</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Pending Reports</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {radiologists.map((r) => (
                  <tr key={r.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(r)}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                          <UserRound size={14} />
                        </span>
                        <span className="font-semibold text-on-surface">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{r.specialty}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{r.licenseNumber}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.studiesToday}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{r.pendingReports}</td>
                    <td className="py-2.5">
                      {r.status !== "active" ? (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-outline/14 text-on-surface-variant capitalize">{r.status.replace("-", " ")}</span>
                      ) : r.availableToday ? (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-vital-green/14 text-vital-green">Available</span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-outline/14 text-on-surface-variant">Off Today</span>
                      )}
                    </td>
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
