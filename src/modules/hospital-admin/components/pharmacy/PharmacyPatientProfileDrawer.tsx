import { AlertTriangle } from "lucide-react";
import { Drawer } from "@shared/design-system/components";
import { prescriptionStatusMeta, formatDateTime } from "@modules/hospital-admin/components/pharmacy/pharmacyStatusMeta";
import type { PharmacyPatientProfile } from "@modules/hospital-admin/api";

interface PharmacyPatientProfileDrawerProps {
  profile: PharmacyPatientProfile | null;
  onClose: () => void;
}

/** Module-local — Patient Pharmacy Profile (spec §5): current medications + medication history. Deliberately shows Prescribed → Dispensed only — Administered is nursing's own MAR record, never merged in here. */
export function PharmacyPatientProfileDrawer({ profile, onClose }: PharmacyPatientProfileDrawerProps) {
  return (
    <Drawer open={Boolean(profile)} onClose={onClose} title={profile?.patientName ?? ""} subtitle={profile ? `DOB ${profile.dob} · ${profile.sex}` : undefined}>
      {profile && (
        <>
          {profile.allergies.length > 0 && (
            <div className="mb-6 rounded-xl border border-pulse-coral/30 bg-pulse-coral/5 px-4 py-3">
              <h4 className="text-xs font-bold uppercase tracking-wide text-pulse-coral mb-2 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Allergies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.allergies.map((a) => (
                  <span key={a} className="rounded-full px-2.5 py-1 text-xs font-semibold bg-pulse-coral/14 text-pulse-coral">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Current Medications</h4>
            {profile.currentMedications.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No active medications on file.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {profile.currentMedications.map((m) => {
                  const status = prescriptionStatusMeta[m.status];
                  return (
                    <div key={m.prescriptionNumber} className="rounded-xl border border-line px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{m.medicationName}</p>
                        <p className="text-xs text-on-surface-variant">
                          {m.dose} · {m.prescriberName} · {m.prescriptionNumber}
                        </p>
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${status.color} 16%, transparent)`, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Medication History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Medication</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Prescribed</th>
                    <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Dispensed</th>
                    <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {profile.medicationHistory.map((m) => {
                    const status = prescriptionStatusMeta[m.status];
                    return (
                      <tr key={m.prescriptionNumber}>
                        <td className="py-2 pr-3 text-on-surface-variant">{m.medicationName}</td>
                        <td className="py-2 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(m.prescribedAt)}</td>
                        <td className="py-2 pr-3 text-on-surface-variant">
                          {m.quantityDispensed}/{m.quantityPrescribed}
                        </td>
                        <td className="py-2">
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
            <p className="text-[11px] text-on-surface-variant mt-3">
              Shows Prescribed → Dispensed only. Administration is recorded separately in the nursing MAR — a medication being dispensed does not mean it was administered.
            </p>
          </div>
        </>
      )}
    </Drawer>
  );
}
