import { UserRound } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { TechnologistRow } from "@modules/hospital-admin/api";

interface TechnologistsPanelProps {
  technologists: TechnologistRow[];
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

/** Module-local — Radiology "Technologists" tab (spec §16): read-only roster, same pattern as Radiologists — identity/license/schedule stay owned by Staff & Workforce. */
export function TechnologistsPanel({ technologists }: TechnologistsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      {technologists.map((t) => (
        <Card key={t.id} hero>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                <UserRound size={18} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-on-surface">{t.name}</h3>
                <p className="text-xs text-on-surface-variant">
                  {t.title} · {t.licenseNumber}
                </p>
              </div>
            </div>
            {t.status !== "active" ? (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-outline/14 text-on-surface-variant capitalize flex-shrink-0">{t.status.replace("-", " ")}</span>
            ) : t.currentStudy ? (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-caution-amber/14 text-caution-amber flex-shrink-0">In a Study</span>
            ) : t.availableToday ? (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-vital-green/14 text-vital-green flex-shrink-0">Available</span>
            ) : (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-outline/14 text-on-surface-variant flex-shrink-0">Off Today</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Shift Days</p>
              <p className="text-sm font-semibold text-on-surface">{t.schedule.join(", ")}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Current Room</p>
              <p className="text-sm font-semibold text-on-surface">{t.currentRoomNumber ?? "Unassigned"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Current Study</p>
              {t.currentStudy ? (
                <p className="text-sm font-semibold text-on-surface truncate">
                  {t.currentStudy.patientName} · {t.currentStudy.studyName} ({t.currentStudy.orderNumber})
                </p>
              ) : (
                <p className="text-sm text-on-surface-variant">None right now</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1.5">Modality Competency</p>
            {t.modalityCompetency.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No completed studies yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {t.modalityCompetency.map((m) => (
                  <span key={m} className="rounded-full px-3 py-1 text-xs font-semibold bg-signal-indigo-tint text-signal-indigo">
                    {modalityLabels[m] ?? m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
