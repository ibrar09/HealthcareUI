import { AlertListTable } from "@modules/hospital-admin/components/alerts/AlertListTable";
import type { Alert } from "@modules/hospital-admin/api";

interface CriticalAlertsPanelProps {
  alerts: Alert[];
  onSelect: (id: string) => void;
}

/** Module-local — Critical Alerts (spec §38 dedicated page): every open critical-severity alert in one feed, per §3's own definition ("requires immediate action"). */
export function CriticalAlertsPanel({ alerts, onSelect }: CriticalAlertsPanelProps) {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <AlertListTable alerts={alerts} onSelect={onSelect} emptyMessage="No open critical alerts." />
    </div>
  );
}
