import { AlertListTable } from "@modules/hospital-admin/components/alerts/AlertListTable";
import type { Alert } from "@modules/hospital-admin/api";

interface MyAlertsPanelProps {
  alerts: Alert[];
  onSelect: (id: string) => void;
}

/** Module-local — My Alerts (spec §38 dedicated page): everything assigned to the signed-in user. */
export function MyAlertsPanel({ alerts, onSelect }: MyAlertsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <AlertListTable alerts={alerts} onSelect={onSelect} emptyMessage="Nothing assigned to you right now." />
    </div>
  );
}
