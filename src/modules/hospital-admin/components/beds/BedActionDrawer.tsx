import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import * as api from "@modules/hospital-admin/api";
import { getIdentifier, getPatientFullName } from "@modules/hospital-admin/api";
import type { BedListRow, IsolationType } from "@modules/hospital-admin/api";

export type BedActionMode = "assign" | "confirm-admission" | "reserve" | "transfer" | "maintenance" | "block" | "isolation";

const modeTitle: Record<BedActionMode, { title: string; subtitle: string }> = {
  assign: { title: "Assign Bed", subtitle: "Admit a patient into this bed." },
  "confirm-admission": { title: "Confirm Admission", subtitle: "Move the reserved patient into this bed now." },
  reserve: { title: "Reserve Bed", subtitle: "Hold this bed for a patient before they arrive." },
  transfer: { title: "Transfer Patient", subtitle: "Move the current occupant to a different bed." },
  maintenance: { title: "Report Maintenance Issue", subtitle: "Take this bed out of service for repair." },
  block: { title: "Block Bed", subtitle: "Block this bed from assignment (infection control, renovation, etc.)." },
  isolation: { title: "Set Isolation Precaution", subtitle: "Flag this occupied bed's precaution type." },
};

const isolationTypeOptions: { value: IsolationType; label: string }[] = [
  { value: "contact", label: "Contact" },
  { value: "droplet", label: "Droplet" },
  { value: "airborne", label: "Airborne" },
  { value: "protective", label: "Protective" },
  { value: "other", label: "Other" },
];

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface BedActionDrawerProps {
  mode: BedActionMode | null;
  bed: BedListRow | null;
  onClose: () => void;
  onComplete: () => void;
  staffOptions: { id: string; name: string }[];
  availableBedOptions: BedListRow[];
  currentUserName: string;
}

/** Module-local — the single action form for every Bed Management Phase 2 workflow that needs input (assign/confirm/reserve/transfer/maintenance/block). */
export function BedActionDrawer({ mode, bed, onClose, onComplete, staffOptions, availableBedOptions, currentUserName }: BedActionDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [admissionDate, setAdmissionDate] = useState("2026-08-14");
  const [expectedDischargeDate, setExpectedDischargeDate] = useState("");
  const [expectedAdmissionDate, setExpectedAdmissionDate] = useState("");
  const [reservationReason, setReservationReason] = useState("");
  const [destinationBedId, setDestinationBedId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [maintenanceIssue, setMaintenanceIssue] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockUntil, setBlockUntil] = useState("");
  const [isolationType, setIsolationType] = useState<IsolationType>("contact");
  const [isolationReason, setIsolationReason] = useState("");

  const [current, setCurrent] = useState<{ mode: BedActionMode; bed: BedListRow } | null>(null);

  useEffect(() => {
    if (!mode || !bed) return;
    setCurrent({ mode, bed });
    setPatient(undefined);
    setAssignedStaffId("");
    setAdmissionDate("2026-08-14");
    setExpectedDischargeDate("");
    setExpectedAdmissionDate("");
    setReservationReason("");
    setDestinationBedId("");
    setTransferReason("");
    setMaintenanceIssue("");
    setBlockReason("");
    setBlockUntil("");
    setIsolationType("contact");
    setIsolationReason("");

    if (mode === "confirm-admission" && bed.reservedForPatientId) {
      api.getPatient(bed.reservedForPatientId).then((p) => {
        if (p) setPatient({ id: p.id, name: getPatientFullName(p.name), mrn: getIdentifier(p.identifiers, "mrn")?.value ?? "—" });
      });
    }
  }, [mode, bed]);

  if (!current) return null;
  const { mode: activeMode, bed: activeBed } = current;
  const meta = modeTitle[activeMode];

  async function handleSubmit() {
    const bed = activeBed;
    const mode = activeMode;
    if (mode === "assign" && patient) {
      await api.assignBed({ bedId: bed.id, patientId: patient.id, assignedStaffId: assignedStaffId || undefined, admissionDate, expectedDischargeDate: expectedDischargeDate || undefined }, currentUserName);
    } else if (mode === "confirm-admission") {
      await api.confirmAdmission(bed.id, { assignedStaffId: assignedStaffId || undefined, admissionDate, expectedDischargeDate: expectedDischargeDate || undefined }, currentUserName);
    } else if (mode === "reserve" && patient) {
      await api.reserveBed({ bedId: bed.id, reservedForPatientId: patient.id, expectedAdmissionDate, reservationReason: reservationReason || undefined, reservedBy: currentUserName }, currentUserName);
    } else if (mode === "transfer" && destinationBedId) {
      await api.transferPatient({ fromBedId: bed.id, toBedId: destinationBedId, reason: transferReason || undefined }, currentUserName);
    } else if (mode === "maintenance" && maintenanceIssue) {
      await api.reportMaintenance(bed.id, maintenanceIssue, currentUserName);
    } else if (mode === "block" && blockReason) {
      await api.blockBed({ bedId: bed.id, reason: blockReason, until: blockUntil || undefined }, currentUserName);
    } else if (mode === "isolation" && isolationType) {
      await api.setIsolation({ bedId: bed.id, isolationType, reason: isolationReason || undefined }, currentUserName);
    }
    onComplete();
    onClose();
  }

  const canSubmit =
    (activeMode === "assign" && Boolean(patient) && Boolean(admissionDate)) ||
    (activeMode === "confirm-admission" && Boolean(admissionDate)) ||
    (activeMode === "reserve" && Boolean(patient) && Boolean(expectedAdmissionDate)) ||
    (activeMode === "transfer" && Boolean(destinationBedId)) ||
    (activeMode === "maintenance" && maintenanceIssue.trim().length > 0) ||
    (activeMode === "block" && blockReason.trim().length > 0) ||
    activeMode === "isolation";

  return (
    <Drawer
      open={Boolean(mode && bed)}
      onClose={onClose}
      title={meta.title}
      subtitle={`${meta.subtitle} · Bed ${activeBed.identifier}`}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {meta.title}
          </Button>
        </div>
      }
    >
      {(activeMode === "assign" || activeMode === "reserve") && (
        <FormSection title="Patient">
          <PatientPicker value={patient} onChange={setPatient} />
        </FormSection>
      )}

      {activeMode === "confirm-admission" && patient && (
        <FormSection title="Patient">
          <div className="rounded-input border border-line bg-surface-container-low px-3.5 py-2.5">
            <p className="text-sm font-semibold text-on-surface">{patient.name}</p>
            <p className="text-xs font-mono text-on-surface-variant">{patient.mrn}</p>
          </div>
        </FormSection>
      )}

      {(activeMode === "assign" || activeMode === "confirm-admission") && (
        <FormSection title="Admission Details">
          <div className="mb-4 grid grid-cols-2 gap-4">
            <FormField label="Admission Date">
              <input type="date" className={formInputClass} value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} />
            </FormField>
            <FormField label="Expected Discharge (optional)">
              <input type="date" className={formInputClass} value={expectedDischargeDate} onChange={(e) => setExpectedDischargeDate(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Attending Doctor (optional)">
            <select className={formInputClass} value={assignedStaffId} onChange={(e) => setAssignedStaffId(e.target.value)}>
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>
      )}

      {activeMode === "reserve" && (
        <FormSection title="Reservation Details">
          <div className="mb-4">
            <FormField label="Expected Admission Date">
              <input type="date" className={formInputClass} value={expectedAdmissionDate} onChange={(e) => setExpectedAdmissionDate(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Reason (optional)">
            <input
              className={formInputClass}
              value={reservationReason}
              onChange={(e) => setReservationReason(e.target.value)}
              placeholder="e.g. Scheduled surgery"
            />
          </FormField>
        </FormSection>
      )}

      {activeMode === "transfer" && (
        <FormSection title="Destination Bed">
          <div className="mb-4">
            <FormField label="Available Beds">
              <select className={formInputClass} value={destinationBedId} onChange={(e) => setDestinationBedId(e.target.value)}>
                <option value="" disabled>
                  Select a destination bed
                </option>
                {availableBedOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.identifier} — {b.wardName} / {b.roomName} ({b.bedTypeName})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Reason (optional)">
            <input
              className={formInputClass}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="e.g. Clinical requirement"
            />
          </FormField>
        </FormSection>
      )}

      {activeMode === "maintenance" && (
        <FormSection title="Issue">
          <FormField label="Describe the problem">
            <textarea
              className={formInputClass}
              rows={3}
              value={maintenanceIssue}
              onChange={(e) => setMaintenanceIssue(e.target.value)}
              placeholder="e.g. Bed rail mechanism jammed"
            />
          </FormField>
        </FormSection>
      )}

      {activeMode === "block" && (
        <FormSection title="Block Details">
          <div className="mb-4">
            <FormField label="Reason">
              <textarea
                className={formInputClass}
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Infection control — deep clean required"
              />
            </FormField>
          </div>
          <FormField label="Expected Release Date (optional)">
            <input type="date" className={formInputClass} value={blockUntil} onChange={(e) => setBlockUntil(e.target.value)} />
          </FormField>
        </FormSection>
      )}

      {activeMode === "isolation" && (
        <FormSection title="Precaution Details">
          <div className="mb-4">
            <FormField label="Isolation Type">
              <select className={formInputClass} value={isolationType} onChange={(e) => setIsolationType(e.target.value as IsolationType)}>
                {isolationTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Reason (optional)">
            <input
              className={formInputClass}
              value={isolationReason}
              onChange={(e) => setIsolationReason(e.target.value)}
              placeholder="e.g. Suspected C. difficile"
            />
          </FormField>
        </FormSection>
      )}
    </Drawer>
  );
}
