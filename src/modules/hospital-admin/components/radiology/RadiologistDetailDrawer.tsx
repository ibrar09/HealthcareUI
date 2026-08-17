import { Drawer } from "@shared/design-system/components";
import type { RadiologistRow } from "@modules/hospital-admin/api";

interface RadiologistDetailDrawerProps {
  radiologist: RadiologistRow | null;
  onClose: () => void;
}

const modalityLabels: Record<string, string> = {
  ct: "CT",
  mri: "MRI",
  xr: "X-Ray",
  us: "Ultrasound",
  mammography: "Mammography",
  fluoroscopy: "Fluoroscopy",
  pet: "PET",
  spect: "SPECT",
  dexa: "DEXA",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="text-xs text-on-surface-variant flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

/** Module-local — Radiologist profile (spec §15): identity/credentials/schedule/workload — read-only, HR fields stay owned by Staff & Workforce. */
export function RadiologistDetailDrawer({ radiologist, onClose }: RadiologistDetailDrawerProps) {
  return (
    <Drawer open={Boolean(radiologist)} onClose={onClose} title={radiologist?.name ?? ""} subtitle={radiologist?.title}>
      {radiologist && (
        <>
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Identity & Credentials</h3>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Professional ID" value={radiologist.id} />
              <Row label="Specialty" value={radiologist.specialty} />
              <Row label="License" value={radiologist.licenseNumber} />
              <Row label="Department" value="Radiology" />
              <Row label="Status" value={radiologist.status.replace("-", " ")} />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Schedule & Availability</h3>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Working Days" value={radiologist.schedule.join(", ")} />
              <Row label="Available Today" value={radiologist.availableToday ? "Yes" : "No"} />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Reporting Workload</h3>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Studies Today" value={String(radiologist.studiesToday)} />
              <Row label="Pending Reports" value={String(radiologist.pendingReports)} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Assigned Modalities</h3>
            {radiologist.assignedModalityTypes.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No reported studies yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {radiologist.assignedModalityTypes.map((m) => (
                  <span key={m} className="rounded-full px-3 py-1.5 text-xs font-semibold bg-signal-indigo-tint text-signal-indigo">
                    {modalityLabels[m] ?? m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
