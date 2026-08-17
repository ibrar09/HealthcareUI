import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Drawer, StatusChip } from "@shared/design-system/components";
import { formatDateTime } from "@modules/hospital-admin/components/radiology/radiologyStatusMeta";
import type { ImagingStudyDetail } from "@modules/hospital-admin/api";

interface ImagingStudyDetailsDrawerProps {
  study: ImagingStudyDetail | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
      <span className="text-xs text-on-surface-variant flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-on-surface text-right">{value}</span>
    </div>
  );
}

/** Module-local — Study Details (spec §18): patient/study info up front; DICOM/PACS technical fields live behind an Advanced/Technical toggle, per the spec's own "don't expose technical DICOM fields to ordinary users unnecessarily." */
export function ImagingStudyDetailsDrawer({ study, onClose }: ImagingStudyDetailsDrawerProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <Drawer open={Boolean(study)} onClose={onClose} title={study?.orderNumber ?? ""} subtitle={study ? `${study.patientName} · ${study.studyName}` : undefined}>
      {study && (
        <>
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Patient</h3>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Patient" value={study.patientName} />
              <Row label="DOB" value={study.patientDob} />
              <Row label="Sex" value={study.patientSex} />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">Study</h3>
            <div className="rounded-xl border border-line divide-y divide-line">
              <Row label="Description" value={study.studyName} />
              <Row label="Modality" value={(study.modality ?? "—").toUpperCase()} />
              <Row label="Body Site" value={study.bodySite} />
              <Row label="Date/Time" value={formatDateTime(study.performedDateTime)} />
              <Row label="Referring Physician" value={study.referringPractitionerName} />
              <Row label="Performing Technologist" value={study.technologistName} />
              <Row label="Series / Images" value={`${study.seriesCount} series · ${study.imageCount.toLocaleString()} images`} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTechnical((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-line px-3.5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all"
          >
            <span>Advanced / Technical Details</span>
            {showTechnical ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {showTechnical && (
            <div className="mt-2 rounded-xl border border-line divide-y divide-line">
              <Row label="Study Instance UID" value={study.studyInstanceUID} />
              <Row label="Series Instance UID" value={study.seriesInstanceUID} />
              <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
                <span className="text-xs text-on-surface-variant">PACS Transfer Status</span>
                <StatusChip tone={study.pacsTransferStatus === "success" ? "success" : study.pacsTransferStatus === "pending" ? "warning" : "critical"}>
                  {study.pacsTransferStatus === "success" ? "Success" : study.pacsTransferStatus === "pending" ? "Pending" : "Failed"}
                </StatusChip>
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
