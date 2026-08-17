import { UserRound } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { SurgicalTeamMemberRow } from "@modules/hospital-admin/api";

interface SurgicalTeamPanelProps {
  team: SurgicalTeamMemberRow[];
}

/** Module-local — Surgical Team roster (spec §10, §29): read-only, joined off Staff & Workforce, same pattern as Radiology's Radiologists/Technologists tabs — never a second personnel system. */
export function SurgicalTeamPanel({ team }: SurgicalTeamPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {team.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No OT team members on file.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Member</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Role</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Specialty</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Schedule</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Cases Today</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {team.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                          <UserRound size={14} />
                        </span>
                        <span className="font-semibold text-on-surface">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{m.role}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{m.specialty}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{m.schedule.join(", ")}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{m.casesToday}</td>
                    <td className="py-2.5">
                      {m.status !== "active" ? (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-outline/14 text-on-surface-variant capitalize">{m.status.replace("-", " ")}</span>
                      ) : m.availableToday ? (
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
