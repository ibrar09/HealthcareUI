import { Card, Button, StatusChip } from "@shared/design-system/components";
import { prescriptionStatusMeta, prescriptionPriorityMeta } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { PrescriptionRow } from "@modules/hospital-admin/api";

interface DispensingPanelProps {
  prescriptions: PrescriptionRow[];
  onSelect: (id: string) => void;
  onDispense: (rx: PrescriptionRow) => void;
}

/** Module-local — Dispensing screen (spec §2, §39): everything Ready or already mid-Dispensing, with a one-click Dispense action that decrements real batch stock (see api.dispensePrescription). */
export function DispensingPanel({ prescriptions, onSelect, onDispense }: DispensingPanelProps) {
  return (
    <div className="pb-8">
      <Card hero>
        {prescriptions.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-12">Nothing ready for dispensing right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Rx #</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Priority</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {prescriptions.map((rx) => {
                  const priority = prescriptionPriorityMeta[rx.priority];
                  const status = prescriptionStatusMeta[rx.status];
                  return (
                    <tr key={rx.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface cursor-pointer" onClick={() => onSelect(rx.id)}>
                        {rx.prescriptionNumber}
                      </td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{rx.patientName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{rx.medicationSummary}</td>
                      <td className="py-2.5 pr-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 16%, transparent)`, color: priority.color }}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <StatusChip tone="neutral">
                          <span style={{ color: status.color }}>{status.label}</span>
                        </StatusChip>
                      </td>
                      <td className="py-2.5">
                        <Button size="sm" onClick={() => onDispense(rx)}>
                          Dispense
                        </Button>
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
