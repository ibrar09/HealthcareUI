import { ShieldAlert } from "lucide-react";
import { Card } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { Medication, ControlledRegisterRow } from "@modules/hospital-admin/api";

interface ControlledMedicinesPanelProps {
  medications: Medication[];
  register: ControlledRegisterRow[];
}

/** Module-local — Controlled/Restricted Medicines + Register (spec §25-26): every dispense of a controlled substance is a permanent, auto-created register entry with a running balance — strong audit controls, never manually editable. */
export function ControlledMedicinesPanel({ medications, register }: ControlledMedicinesPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero accentColor="var(--pulse-coral)">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-pulse-coral" />
          <h2 className="text-lg font-bold text-on-surface">Controlled Substances</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Strength</th>
                <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Storage Requirements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {medications.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 pr-3 font-semibold text-on-surface">{m.genericName}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{m.strength}</td>
                  <td className="py-2.5 pr-3 text-on-surface-variant">{m.storageRequirements ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Controlled Medication Register</h2>
        {register.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No controlled-substance dispensing recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Date</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Batch</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Qty Dispensed</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Balance</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Prescriber</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Pharmacist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {register.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(e.date)}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{e.medicationName}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-on-surface-variant">{e.batchNumber}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.quantityDispensed}</td>
                    <td className="py-2.5 pr-3 font-semibold text-on-surface">{e.balanceAfter}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.prescriberName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{e.patientName}</td>
                    <td className="py-2.5 text-on-surface-variant">{e.pharmacistName}</td>
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
