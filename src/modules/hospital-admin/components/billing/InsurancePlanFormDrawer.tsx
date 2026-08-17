import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";

interface PlanFormValues {
  name: string;
  planType: string;
}

interface InsurancePlanFormDrawerProps {
  open: boolean;
  payerName?: string;
  onClose: () => void;
  onSubmit: (values: PlanFormValues) => void;
}

/** Module-local — add an Insurance Plan under a payer (spec §10). */
export function InsurancePlanFormDrawer({ open, payerName, onClose, onSubmit }: InsurancePlanFormDrawerProps) {
  const [name, setName] = useState("");
  const [planType, setPlanType] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setPlanType("");
    }
  }, [open]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Insurance Plan"
      subtitle={payerName ? `Under ${payerName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit({ name, planType });
              onClose();
            }}
            disabled={!name.trim() || !planType.trim()}
          >
            Add Plan
          </Button>
        </div>
      }
    >
      <FormSection title="Details">
        <div className="mb-4">
          <FormField label="Plan Name">
            <input className={formInputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gold PPO" />
          </FormField>
        </div>
        <FormField label="Plan Type">
          <input className={formInputClass} value={planType} onChange={(e) => setPlanType(e.target.value)} placeholder="e.g. PPO, HMO, Standard" />
        </FormField>
      </FormSection>
    </Drawer>
  );
}
