import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewModalityInput, ModalityType, RadiologyRoom } from "@modules/hospital-admin/api";

const modalityTypes: ModalityType[] = ["ct", "mri", "xr", "us", "mammography", "fluoroscopy", "pet", "spect", "dexa"];

function emptyValues(roomId: string): NewModalityInput {
  return { name: "", type: "ct", manufacturer: "", model: "", serialNumber: "", roomId, aeTitle: "", ipAddress: "", pacsDestination: "MAIN_PACS", nextMaintenance: "2026-09-01" };
}

interface ModalityFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewModalityInput) => void;
  initialValues?: NewModalityInput;
  rooms: RadiologyRoom[];
}

/** Module-local — add/edit a Modality (spec §12): every field the registry asks for, not a name-only stub. */
export function ModalityFormDrawer({ open, onClose, onSubmit, initialValues, rooms }: ModalityFormDrawerProps) {
  const [values, setValues] = useState<NewModalityInput>(initialValues ?? emptyValues(rooms[0]?.id ?? ""));
  const isEdit = Boolean(initialValues);

  useEffect(() => {
    if (open) setValues(initialValues ?? emptyValues(rooms[0]?.id ?? ""));
  }, [open, initialValues, rooms]);

  function set<K extends keyof NewModalityInput>(key: K, value: NewModalityInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Modality" : "Add Modality"}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(values);
              onClose();
            }}
            disabled={!values.name.trim() || !values.manufacturer.trim()}
          >
            {isEdit ? "Save Changes" : "Add Modality"}
          </Button>
        </div>
      }
    >
      <FormSection title="Identity">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Name">
            <input className={formInputClass} value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. CT-02" disabled={isEdit} />
          </FormField>
          <FormField label="Modality Type">
            <select className={formInputClass} value={values.type} onChange={(e) => set("type", e.target.value as ModalityType)}>
              {modalityTypes.map((t) => (
                <option key={t} value={t} className="uppercase">
                  {t.toUpperCase()}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Manufacturer">
            <input className={formInputClass} value={values.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} placeholder="e.g. Siemens" />
          </FormField>
          <FormField label="Model">
            <input className={formInputClass} value={values.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. SOMATOM go.Top" />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Location & Maintenance">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Room">
            <select className={formInputClass} value={values.roomId} onChange={(e) => set("roomId", e.target.value)}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number} — {r.location}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Serial Number">
            <input className={formInputClass} value={values.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} placeholder="e.g. SN-CT-90210" />
          </FormField>
        </div>
        <FormField label="Next Maintenance">
          <input type="date" className={formInputClass} value={values.nextMaintenance} onChange={(e) => set("nextMaintenance", e.target.value)} />
        </FormField>
      </FormSection>

      <FormSection title="DICOM / PACS">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="DICOM AE Title">
            <input className={formInputClass} value={values.aeTitle} onChange={(e) => set("aeTitle", e.target.value)} placeholder="e.g. CT_ROOM_02" />
          </FormField>
          <FormField label="IP Address">
            <input className={formInputClass} value={values.ipAddress} onChange={(e) => set("ipAddress", e.target.value)} placeholder="e.g. 10.20.4.15" />
          </FormField>
        </div>
        <FormField label="PACS Destination">
          <input className={formInputClass} value={values.pacsDestination} onChange={(e) => set("pacsDestination", e.target.value)} placeholder="e.g. MAIN_PACS" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
