import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import * as api from "@modules/hospital-admin/api";
import type { PatientCoverageView, BillableService } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface RequestAuthorizationDrawerProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  services: BillableService[];
  staffOptions: { id: string; name: string }[];
}

/** Module-local — request a preauthorization (spec §13): requires an active coverage. */
export function RequestAuthorizationDrawer({ open, onClose, onComplete, services, staffOptions }: RequestAuthorizationDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [coverages, setCoverages] = useState<PatientCoverageView[]>([]);
  const [coverageId, setCoverageId] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [requestedBy, setRequestedBy] = useState("");

  useEffect(() => {
    if (open) {
      setPatient(undefined);
      setCoverages([]);
      setCoverageId("");
      setServiceCode(services[0]?.code ?? "");
      setRequestedBy(staffOptions[0]?.name ?? "");
    }
  }, [open, services, staffOptions]);

  useEffect(() => {
    if (!patient) {
      setCoverages([]);
      setCoverageId("");
      return;
    }
    api.getPatientCoverage(patient.id).then((rows) => {
      const active = rows.filter((r) => r.status === "active");
      setCoverages(active);
      setCoverageId(active[0]?.id ?? "");
    });
  }, [patient]);

  async function handleSubmit() {
    if (!patient || !coverageId || !serviceCode || !requestedBy) return;
    await api.requestAuthorization({ patientId: patient.id, coverageId, serviceCode, requestedBy });
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request Authorization"
      subtitle="Preauthorization requires an active insurance coverage."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!patient || !coverageId || !serviceCode || !requestedBy}>
            Submit Request
          </Button>
        </div>
      }
    >
      <FormSection title="Patient">
        <PatientPicker value={patient} onChange={setPatient} />
      </FormSection>

      {patient && (
        <FormSection title="Coverage">
          {coverages.length === 0 ? (
            <p className="text-sm text-on-surface-variant">This patient has no active insurance coverage — add one in their Patient Account first.</p>
          ) : (
            <select className={formInputClass} value={coverageId} onChange={(e) => setCoverageId(e.target.value)}>
              {coverages.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.payerName} — {c.planName} ({c.rank})
                </option>
              ))}
            </select>
          )}
        </FormSection>
      )}

      {coverageId && (
        <FormSection title="Service Requiring Authorization">
          <div className="mb-4">
            <FormField label="Service">
              <select className={formInputClass} value={serviceCode} onChange={(e) => setServiceCode(e.target.value)}>
                {services.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Requested By">
            <select className={formInputClass} value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)}>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>
      )}
    </Drawer>
  );
}
