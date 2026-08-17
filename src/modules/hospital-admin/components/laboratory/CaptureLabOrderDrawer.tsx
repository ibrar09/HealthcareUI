import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import * as api from "@modules/hospital-admin/api";
import type { LabTestCatalogEntry, LabOrderPriority, DepartmentDirectoryRow } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface PractitionerOption {
  id: string;
  name: string;
}

interface CaptureLabOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  catalog: LabTestCatalogEntry[];
  practitioners: PractitionerOption[];
  departments: DepartmentDirectoryRow[];
}

const priorities: LabOrderPriority[] = ["routine", "urgent", "stat"];

/** Module-local — administrative Lab Order capture, mirrors Billing's manual Capture Charge (spec §6) — for one-off orders; most orders should come from a clinical ordering workspace once one exists. */
export function CaptureLabOrderDrawer({ open, onClose, onComplete, catalog, practitioners, departments }: CaptureLabOrderDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [orderingPractitionerId, setOrderingPractitionerId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [testCodes, setTestCodes] = useState<string[]>([]);
  const [priority, setPriority] = useState<LabOrderPriority>("routine");
  const [reasonForTest, setReasonForTest] = useState("");
  const [clinicalInformation, setClinicalInformation] = useState("");

  useEffect(() => {
    if (open) {
      setPatient(undefined);
      setOrderingPractitionerId(practitioners[0]?.id ?? "");
      setDepartmentId(departments[0]?.id ?? "");
      setTestCodes([]);
      setPriority("routine");
      setReasonForTest("");
      setClinicalInformation("");
    }
  }, [open, practitioners, departments]);

  function toggleTest(code: string) {
    setTestCodes((codes) => (codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code]));
  }

  async function handleSubmit() {
    if (!patient || !orderingPractitionerId || !departmentId || testCodes.length === 0 || !reasonForTest.trim()) return;
    await api.createLabOrder({ patientId: patient.id, orderingPractitionerId, departmentId, testCodes, priority, reasonForTest, clinicalInformation: clinicalInformation || undefined });
    onComplete();
    onClose();
  }

  const canSubmit = Boolean(patient) && Boolean(orderingPractitionerId) && Boolean(departmentId) && testCodes.length > 0 && reasonForTest.trim().length > 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Capture Lab Order"
      subtitle="For a one-off order — most orders should come from a clinical ordering workspace."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Capture Order
          </Button>
        </div>
      }
    >
      <FormSection title="Patient">
        <PatientPicker value={patient} onChange={setPatient} />
      </FormSection>

      <FormSection title="Order Details">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Ordering Practitioner">
            <select className={formInputClass} value={orderingPractitionerId} onChange={(e) => setOrderingPractitionerId(e.target.value)}>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Department">
            <select className={formInputClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Priority">
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                    priority === p ? "bg-gradient-brand text-white shadow-glow" : "border border-line text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Reason for Test">
            <input className={formInputClass} value={reasonForTest} onChange={(e) => setReasonForTest(e.target.value)} placeholder="e.g. Diabetes screening" />
          </FormField>
        </div>
        <FormField label="Clinical Information (optional)">
          <input className={formInputClass} value={clinicalInformation} onChange={(e) => setClinicalInformation(e.target.value)} placeholder="Relevant history for the lab" />
        </FormField>
      </FormSection>

      <FormSection title="Tests">
        <div className="flex flex-col gap-2">
          {catalog.map((t) => (
            <label key={t.code} className="flex items-center justify-between gap-3 rounded-input border border-line px-3.5 py-2.5 cursor-pointer hover:bg-surface-container-low transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <input type="checkbox" className="accent-signal-indigo" checked={testCodes.includes(t.code)} onChange={() => toggleTest(t.code)} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{t.name}</p>
                  <p className="text-xs text-on-surface-variant truncate capitalize">
                    {t.category} · {t.specimenType} · TAT {t.turnaroundTimeHours}h
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </FormSection>
    </Drawer>
  );
}
