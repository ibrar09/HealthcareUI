import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewBedInput, UpdateBedConfigInput, BedTypeConfig } from "@modules/hospital-admin/api";

interface BedFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  roomName?: string;
  onSubmitAdd?: (values: NewBedInput) => void;
  onSubmitEdit?: (values: UpdateBedConfigInput) => void;
  initialValues?: { identifier: string; bedTypeId: string };
  roomId?: string;
  bedTypes: BedTypeConfig[];
}

/** Module-local — Bed Management Phase 4 config screen (spec §28): add a new physical bed to a room, or edit its identifier/type. */
export function BedFormDrawer({ open, onClose, mode, roomName, onSubmitAdd, onSubmitEdit, initialValues, roomId, bedTypes }: BedFormDrawerProps) {
  const [identifier, setIdentifier] = useState("");
  const [bedTypeId, setBedTypeId] = useState("");

  useEffect(() => {
    if (!open) return;
    setIdentifier(initialValues?.identifier ?? "");
    setBedTypeId(initialValues?.bedTypeId ?? bedTypes[0]?.id ?? "");
  }, [open, initialValues, bedTypes]);

  function handleSubmit() {
    if (mode === "add" && roomId && onSubmitAdd) {
      onSubmitAdd({ roomId, bedTypeId, identifier });
    } else if (mode === "edit" && onSubmitEdit) {
      onSubmitEdit({ identifier, bedTypeId });
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === "add" ? "Add Bed" : "Edit Bed"}
      subtitle={roomName ? `Room ${roomName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!identifier.trim() || !bedTypeId}>
            {mode === "add" ? "Add Bed" : "Save Changes"}
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Bed Identifier">
            <input className={formInputClass} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. ICU-305-A" />
          </FormField>
        </div>
        <FormField label="Bed Type">
          <select className={formInputClass} value={bedTypeId} onChange={(e) => setBedTypeId(e.target.value)}>
            {bedTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
