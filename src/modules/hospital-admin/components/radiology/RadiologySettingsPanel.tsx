import { Settings2, ScanLine, DoorOpen, ListChecks, ListTree, Timer, AlertTriangle } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { RadiologySettingsData } from "@modules/hospital-admin/api";

interface RadiologySettingsPanelProps {
  settings: RadiologySettingsData | null;
  onGoToModalities: () => void;
  onGoToRooms: () => void;
  onGoToProcedures: () => void;
}

/** Module-local — Radiology "Settings" tab (spec §35): a configuration overview linking to Modalities/Rooms/Procedures, never a duplicate of those screens' own CRUD. */
export function RadiologySettingsPanel({ settings, onGoToModalities, onGoToRooms, onGoToProcedures }: RadiologySettingsPanelProps) {
  if (!settings) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center gap-2 mb-5">
          <Settings2 size={18} className="text-signal-indigo" />
          <h2 className="text-lg font-bold text-on-surface">{settings.departmentName} Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button type="button" onClick={onGoToModalities} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <ScanLine size={15} />
              <span className="text-sm font-bold text-on-surface">Modalities</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeModalityCount}</p>
            <p className="text-xs text-on-surface-variant">active pieces of equipment</p>
          </button>
          <button type="button" onClick={onGoToRooms} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <DoorOpen size={15} />
              <span className="text-sm font-bold text-on-surface">Rooms</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeRoomCount}</p>
            <p className="text-xs text-on-surface-variant">active imaging rooms</p>
          </button>
          <button type="button" onClick={onGoToProcedures} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <ListChecks size={15} />
              <span className="text-sm font-bold text-on-surface">Procedures</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeProcedureCount}</p>
            <p className="text-xs text-on-surface-variant">active catalog entries</p>
          </button>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Workflow Defaults</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-line px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5 text-on-surface-variant">
              <ListTree size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Protocols Configured</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.protocolCount}</p>
          </div>
          <div className="rounded-xl border border-line px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5 text-on-surface-variant">
              <Timer size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Default Slot Length</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.defaultSlotMinutes} min</p>
          </div>
          <div className="rounded-xl border border-line px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5 text-on-surface-variant">
              <AlertTriangle size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">Critical Escalation SLA</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.criticalFindingEscalationMinutes} min</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant mt-4">
          These figures reflect the live configuration on the Modalities, Rooms, and Procedures tabs — edit them there rather than here to avoid a second source of truth.
        </p>
      </Card>
    </div>
  );
}
