import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { NewEmergencyOrderInput, EmergencyOrderType, EmergencyOrderPriority } from "@modules/hospital-admin/api";

const types: EmergencyOrderType[] = ["laboratory", "radiology", "medication", "procedure", "consultation", "monitoring"];
const priorities: EmergencyOrderPriority[] = ["routine", "urgent", "stat"];

function emptyValues(visitId: string, orderedBy: string): NewEmergencyOrderInput {
  return { visitId, orderType: "laboratory", description: "", priority: "routine", orderedBy };
}

interface OrderFormDrawerProps {
  open: boolean;
  visitId: string | null;
  visitLabel?: string;
  onClose: () => void;
  onSubmit: (values: NewEmergencyOrderInput) => void;
  orderedBy: string;
  visitOptions?: { id: string; label: string }[];
}

/** Module-local — place an Emergency Order (spec §9): Laboratory/Radiology/Medication/Procedure/Consultation/Monitoring. When opened without a pre-selected visit (from the Orders tab), a patient picker is shown. */
export function OrderFormDrawer({ open, visitId, visitLabel, onClose, onSubmit, orderedBy, visitOptions }: OrderFormDrawerProps) {
  const [values, setValues] = useState<NewEmergencyOrderInput>(emptyValues(visitId ?? visitOptions?.[0]?.id ?? "", orderedBy));
  const [testCodesText, setTestCodesText] = useState("");

  useEffect(() => {
    if (open) {
      setValues(emptyValues(visitId ?? visitOptions?.[0]?.id ?? "", orderedBy));
      setTestCodesText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visitId]);

  function set<K extends keyof NewEmergencyOrderInput>(key: K, value: NewEmergencyOrderInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const canSubmit = values.description.trim() && values.visitId;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="New Order"
      subtitle={visitId ? visitLabel : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmit({ ...values, testCodes: values.orderType === "laboratory" ? testCodesText.split(",").map((c) => c.trim()).filter(Boolean) : undefined });
              onClose();
            }}
            disabled={!canSubmit}
          >
            Place Order
          </Button>
        </div>
      }
    >
      <FormSection title="Order">
        {!visitId && visitOptions && (
          <div className="mb-4">
            <FormField label="Patient">
              <select className={formInputClass} value={values.visitId} onChange={(e) => set("visitId", e.target.value)}>
                {visitOptions.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </FormField>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Order Type">
            <select className={formInputClass} value={values.orderType} onChange={(e) => set("orderType", e.target.value as EmergencyOrderType)}>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority">
            <select className={formInputClass} value={values.priority} onChange={(e) => set("priority", e.target.value as EmergencyOrderPriority)}>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mb-4">
          <FormField label="Description">
            <input className={formInputClass} value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Troponin, CBC, Electrolytes" />
          </FormField>
        </div>
        {values.orderType === "laboratory" && (
          <FormField label="Test Codes (comma-separated, creates a real Laboratory order)">
            <input className={formInputClass} value={testCodesText} onChange={(e) => setTestCodesText(e.target.value)} placeholder="e.g. CBC-PANEL, K, CREAT" />
          </FormField>
        )}
      </FormSection>
    </Drawer>
  );
}
