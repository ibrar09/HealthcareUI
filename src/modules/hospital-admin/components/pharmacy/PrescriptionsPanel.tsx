import { Search, ShieldAlert } from "lucide-react";
import { Card, StatusChip } from "@shared/design-system/components";
import { prescriptionStatusMeta, prescriptionPriorityMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { PrescriptionRow, PrescriptionStatus, PrescriptionPriority } from "@modules/hospital-admin/api";

interface PrescriptionsPanelProps {
  prescriptions: PrescriptionRow[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: PrescriptionStatus | "all";
  onStatusFilterChange: (value: PrescriptionStatus | "all") => void;
  priorityFilter: PrescriptionPriority | "all";
  onPriorityFilterChange: (value: PrescriptionPriority | "all") => void;
  onSelect: (id: string) => void;
}

const statusOptions: (PrescriptionStatus | "all")[] = [
  "all", "new", "received", "under-review", "verified", "preparing", "ready", "dispensing", "dispensed", "partially-dispensed", "cancelled", "rejected", "returned", "expired",
];
const priorityOptions: (PrescriptionPriority | "all")[] = ["all", "routine", "urgent", "stat"];

/** Module-local — Pharmacy Work Queue (spec §2): the full prescription pipeline, Prescription → Received → Verification → Clinical/Safety Check → Stock Check → Preparation → Dispensing → Completed, filterable by status/priority. */
export function PrescriptionsPanel({ prescriptions, search, onSearchChange, statusFilter, onStatusFilterChange, priorityFilter, onPriorityFilterChange, onSelect }: PrescriptionsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full rounded-input border border-line pl-9 pr-3.5 py-2 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
            placeholder="Search Rx #, patient, medication..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as PrescriptionStatus | "all")}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : prescriptionStatusMeta[s].label}
              </option>
            ))}
          </select>
          <select className="rounded-input border border-line px-3 py-2 text-sm outline-none focus:border-signal-indigo" value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value as PrescriptionPriority | "all")}>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All Priorities" : prescriptionPriorityMeta[p].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card hero>
        {prescriptions.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">No prescriptions match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Rx #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Doctor</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {prescriptions.map((rx) => {
                  const priority = prescriptionPriorityMeta[rx.priority];
                  const status = prescriptionStatusMeta[rx.status];
                  return (
                    <tr key={rx.id} className="cursor-pointer hover:bg-surface-container-low" onClick={() => onSelect(rx.id)}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">
                        <div className="flex items-center gap-1.5">
                          {rx.prescriptionNumber}
                          {rx.controlledSubstance && (
                            <span title="Controlled substance">
                              <ShieldAlert size={12} className="text-pulse-coral" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{rx.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{rx.prescriberName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{rx.departmentName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{rx.medicationSummary}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(rx.prescriptionDate)}</td>
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
