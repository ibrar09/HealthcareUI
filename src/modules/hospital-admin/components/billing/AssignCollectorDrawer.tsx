import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import type { ARLedgerRow } from "@modules/hospital-admin/api";

interface AssignCollectorDrawerProps {
  row: ARLedgerRow | null;
  onClose: () => void;
  onSubmit: (invoiceId: string, collectorName: string) => void;
  staffOptions: { id: string; name: string }[];
}

/** Module-local — assigns an AR receivable to a collector (spec §31 "Assigned Collector" column). */
export function AssignCollectorDrawer({ row, onClose, onSubmit, staffOptions }: AssignCollectorDrawerProps) {
  const [collectorName, setCollectorName] = useState("");

  useEffect(() => {
    if (row) setCollectorName(row.assignedCollector ?? staffOptions[0]?.name ?? "");
  }, [row, staffOptions]);

  function handleSubmit() {
    if (!row || !collectorName) return;
    onSubmit(row.invoiceId, collectorName);
    onClose();
  }

  return (
    <Drawer
      open={Boolean(row)}
      onClose={onClose}
      title="Assign Collector"
      subtitle={row?.invoiceNumber}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!collectorName}>
            Assign
          </Button>
        </div>
      }
    >
      <FormSection title="Collector">
        <FormField label="Assign To">
          <select className={formInputClass} value={collectorName} onChange={(e) => setCollectorName(e.target.value)}>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>
    </Drawer>
  );
}
