import { Settings2, Scissors, Wrench, UserRound, Package, Timer } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { OTSettingsData } from "@modules/hospital-admin/api";

interface OTSettingsPanelProps {
  settings: OTSettingsData | null;
  onGoToRooms: () => void;
  onGoToInstruments: () => void;
  onGoToTeam: () => void;
  onGoToImplants: () => void;
}

/** Module-local — OT Settings (spec §35): configuration overview linking to the screens that actually own each value, never a duplicate config surface. */
export function OTSettingsPanel({ settings, onGoToRooms, onGoToInstruments, onGoToTeam, onGoToImplants }: OTSettingsPanelProps) {
  if (!settings) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center gap-2 mb-5">
          <Settings2 size={18} className="text-signal-indigo" />
          <h2 className="text-lg font-bold text-on-surface">{settings.departmentName} Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button type="button" onClick={onGoToRooms} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <Scissors size={15} />
              <span className="text-sm font-bold text-on-surface">OT Rooms</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeRoomCount}</p>
            <p className="text-xs text-on-surface-variant">active rooms</p>
          </button>
          <button type="button" onClick={onGoToInstruments} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <Wrench size={15} />
              <span className="text-sm font-bold text-on-surface">Instrument Sets</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.availableInstrumentSets}</p>
            <p className="text-xs text-on-surface-variant">available now</p>
          </button>
          <button type="button" onClick={onGoToTeam} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <UserRound size={15} />
              <span className="text-sm font-bold text-on-surface">Surgical Team</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeTeamMembers}</p>
            <p className="text-xs text-on-surface-variant">active members</p>
          </button>
          <button type="button" onClick={onGoToImplants} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <Package size={15} />
              <span className="text-sm font-bold text-on-surface">Implant Types</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.implantTypesTracked}</p>
            <p className="text-xs text-on-surface-variant">tracked</p>
          </button>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Workflow Defaults</h2>
        <div className="rounded-xl border border-line px-4 py-3.5 max-w-xs">
          <div className="flex items-center gap-2 mb-1.5 text-on-surface-variant">
            <Timer size={14} />
            <span className="text-xs font-semibold uppercase tracking-wide">Default Case Buffer</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{settings.defaultCaseBufferMinutes} min</p>
        </div>
        <p className="text-xs text-on-surface-variant mt-4">
          These figures reflect the live configuration on the OT Rooms, Instruments, Surgical Team, and Implants tabs — edit them there rather than here to avoid a second source of truth.
        </p>
      </Card>
    </div>
  );
}
