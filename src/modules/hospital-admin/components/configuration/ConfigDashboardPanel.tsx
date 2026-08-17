import { Settings, CheckCircle2, Clock, History, Globe, Building2, MapPin, XCircle } from "lucide-react";
import { Card, KPICard, Button } from "@shared/design-system/components";
import type { ConfigurationDashboardData } from "@modules/hospital-admin/api";

interface ConfigDashboardPanelProps {
  data: ConfigurationDashboardData | null;
  onExport: () => void;
  onImport: () => void;
  onViewHistory: () => void;
}

/** Module-local — Configuration Dashboard (spec §1): overview KPIs + quick actions, every number computed from real settings/history records. */
export function ConfigDashboardPanel({ data, onExport, onImport, onViewHistory }: ConfigDashboardPanelProps) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total Configurations" value={data.totalConfigurations} icon={<Settings size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Active Configurations" value={data.activeConfigurations} icon={<CheckCircle2 size={14} />} accentColor="var(--vital-green)" />
        <KPICard label="Pending Changes" value={data.pendingChanges} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Recently Modified" value={data.recentlyModified} icon={<History size={14} />} accentColor="var(--signal-indigo)" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="System Defaults" value={data.systemDefaults} icon={<Globe size={14} />} accentColor="var(--outline)" />
        <KPICard label="Hospital-Specific" value={data.hospitalSpecificSettings} icon={<Building2 size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Branch-Specific" value={data.branchSpecificSettings} icon={<MapPin size={14} />} accentColor="var(--module-radiology)" />
        <KPICard label="Failed Changes" value={data.failedConfigurationChanges} icon={<XCircle size={14} />} accentColor="var(--pulse-coral)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onExport}>Export Configuration</Button>
          <Button size="sm" variant="outline" onClick={onImport}>Import Configuration</Button>
          <Button size="sm" variant="outline" onClick={onViewHistory}>View Configuration History</Button>
        </div>
      </Card>
    </div>
  );
}
