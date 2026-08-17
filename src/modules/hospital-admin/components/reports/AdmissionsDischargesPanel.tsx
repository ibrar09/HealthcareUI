import { Card, KPICard } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/reports/reportsHelpers";
import type { AdmissionsDischargesData } from "@modules/hospital-admin/api";

interface AdmissionsDischargesPanelProps {
  data: AdmissionsDischargesData | null;
}

/** Module-local — Admission + Discharge Reports (spec §11-12): real bed-audit admission/discharge/transfer events, never fabricated counts. */
export function AdmissionsDischargesPanel({ data }: AdmissionsDischargesPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Total Admissions" value={data.totalAdmissions} accentColor="var(--signal-indigo)" />
        <KPICard label="Total Discharges" value={data.totalDischarges} accentColor="var(--vital-green)" />
        <KPICard label="Total Transfers" value={data.totalTransfers} accentColor="var(--module-radiology)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Admissions by Ward</h2>
        {data.byWard.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No admissions recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {data.byWard.map((row) => (
              <div key={row.wardName} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{row.wardName}</span>
                <span className="font-mono font-bold text-on-surface">{row.admissions}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Recent Admissions</h2>
          {data.recentAdmissions.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4 text-center">None yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {data.recentAdmissions.map((a, i) => (
                <div key={i} className="py-2 text-sm">
                  <p className="font-semibold text-on-surface">{a.patientName}</p>
                  <p className="text-xs text-on-surface-variant">{a.wardName} · {a.bedIdentifier} · {formatDateTime(a.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero>
          <h2 className="text-lg font-bold text-on-surface mb-4">Recent Discharges</h2>
          {data.recentDischarges.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4 text-center">None yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {data.recentDischarges.map((d, i) => (
                <div key={i} className="py-2 text-sm">
                  <p className="font-semibold text-on-surface">{d.patientName}</p>
                  <p className="text-xs text-on-surface-variant">{d.wardName} · {d.bedIdentifier} · {formatDateTime(d.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
