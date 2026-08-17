import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import { PatientPicker } from "@modules/hospital-admin/components/PatientPicker";
import * as api from "@modules/hospital-admin/api";
import type { BillableService } from "@modules/hospital-admin/api";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface CaptureChargeDrawerProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  services: BillableService[];
}

/** Module-local — manual Charge Capture (spec §6) for one-off/missed charges; most charges should come from clinical systems automatically. */
export function CaptureChargeDrawer({ open, onClose, onComplete, services }: CaptureChargeDrawerProps) {
  const [patient, setPatient] = useState<PatientOption | undefined>(undefined);
  const [serviceCode, setServiceCode] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setPatient(undefined);
      setServiceCode(services[0]?.code ?? "");
      setQuantity(1);
    }
  }, [open, services]);

  async function handleSubmit() {
    if (!patient || !serviceCode) return;
    await api.captureCharge({ patientId: patient.id, serviceCode, quantity });
    onComplete();
    onClose();
  }

  const selectedService = services.find((s) => s.code === serviceCode);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Capture Charge"
      subtitle="For one-off or missed charges — most charges are generated automatically from clinical activity."
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!patient || !serviceCode || quantity < 1}>
            Capture Charge
          </Button>
        </div>
      }
    >
      <FormSection title="Patient">
        <PatientPicker value={patient} onChange={setPatient} />
      </FormSection>

      <FormSection title="Service">
        <div className="mb-4">
          <FormField label="Service">
            <select className={formInputClass} value={serviceCode} onChange={(e) => setServiceCode(e.target.value)}>
              {services.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name} ({s.department})
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Quantity">
          <input type="number" min={1} className={formInputClass} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
        </FormField>
        {selectedService && (
          <p className="mt-3 text-sm text-on-surface-variant">
            {quantity} × SAR {selectedService.standardPrice.toLocaleString()} = <span className="font-bold text-on-surface">SAR {(quantity * selectedService.standardPrice).toLocaleString()}</span>
          </p>
        )}
      </FormSection>
    </Drawer>
  );
}
