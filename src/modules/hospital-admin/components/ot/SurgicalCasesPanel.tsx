import { Search, Plus } from "lucide-react";
import { Card, Button, StatusChip } from "@shared/design-system/components";
import { surgicalCaseStatusMeta, surgeryPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { SurgicalCaseRow, SurgicalCaseStatus, SurgeryPriority } from "@modules/hospital-admin/api";

interface SurgicalCasesPanelProps {
  cases: SurgicalCaseRow[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: SurgicalCaseStatus | "all";
  onStatusFilterChange: (value: SurgicalCaseStatus | "all") => void;
  priorityFilter: SurgeryPriority | "all";
  onPriorityFilterChange: (value: SurgeryPriority | "all") => void;
  onSelect: (id: string) => void;
  onNewRequest: () => void;
}

const statusOptions: (SurgicalCaseStatus | "all")[] = [
  "all", "requested", "approved", "scheduled", "pre-op-pending", "pre-op-cleared", "ready-for-ot",
  "patient-transferred", "anesthesia-started", "surgery-started", "surgery-completed", "recovery",
  "transferred", "completed", "cancelled", "postponed", "no-show", "aborted",
];
const priorityOptions: (SurgeryPriority | "all")[] = ["all", "emergency", "urgent", "semi-urgent", "elective"];

/** Module-local — Surgical Cases tab (spec §7): full case-management table with the standardized lifecycle status (spec §8), never arbitrary colors alone. */
export function SurgicalCasesPanel({ cases, search, onSearchChange, statusFilter, onStatusFilterChange, priorityFilter, onPriorityFilterChange, onSelect, onNewRequest }: SurgicalCasesPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search case #, patient, procedure..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as SurgicalCaseStatus | "all")}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : surgicalCaseStatusMeta[s].label}
              </option>
            ))}
          </select>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value as SurgeryPriority | "all")}>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All Priorities" : surgeryPriorityMeta[p].label}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={onNewRequest} icon={<Plus size={14} />}>
            New Surgery Request
          </Button>
        </div>
      </div>

      <Card hero>
        {cases.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No surgical cases match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Case ID</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Procedure</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Surgeon</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">OT</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cases.map((c) => {
                  const priority = surgeryPriorityMeta[c.priority];
                  const status = surgicalCaseStatusMeta[c.status];
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(c.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{c.caseNumber}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.procedureName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.surgeonName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.scheduledDateTime ? formatDateTime(c.scheduledDateTime) : "—"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{c.roomNumber ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <StatusChip tone="neutral">
                          <span style={{ color: status.color }}>{status.label}</span>
                        </StatusChip>
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
