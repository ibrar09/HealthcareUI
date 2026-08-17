import { Settings2, Pill, Truck, ShieldAlert, MapPin } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { PharmacySettingsData } from "@modules/hospital-admin/api";

interface PharmacySettingsPanelProps {
  settings: PharmacySettingsData | null;
  onGoToCatalog: () => void;
  onGoToProcurement: () => void;
  onGoToControlled: () => void;
}

/** Module-local — Pharmacy Settings (spec §39 Phase 3): configuration overview linking to the screens that own each value, never a duplicate config surface. */
export function PharmacySettingsPanel({ settings, onGoToCatalog, onGoToProcurement, onGoToControlled }: PharmacySettingsPanelProps) {
  if (!settings) return null;
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <div className="flex items-center gap-2 mb-5">
          <Settings2 size={18} className="text-signal-indigo" />
          <h2 className="text-lg font-bold text-on-surface">{settings.departmentName} Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button type="button" onClick={onGoToCatalog} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <Pill size={15} />
              <span className="text-sm font-bold text-on-surface">Medications</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeMedicationCount}</p>
            <p className="text-xs text-on-surface-variant">active catalog entries</p>
          </button>
          <button type="button" onClick={onGoToProcurement} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <Truck size={15} />
              <span className="text-sm font-bold text-on-surface">Suppliers</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.activeSupplierCount}</p>
            <p className="text-xs text-on-surface-variant">active suppliers</p>
          </button>
          <button type="button" onClick={onGoToControlled} className="text-left rounded-xl border border-line px-4 py-3.5 hover:bg-surface-container-low transition-all">
            <div className="flex items-center gap-2 mb-1.5 text-signal-indigo">
              <ShieldAlert size={15} />
              <span className="text-sm font-bold text-on-surface">Controlled Meds</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.controlledMedicationCount}</p>
            <p className="text-xs text-on-surface-variant">tracked</p>
          </button>
          <div className="text-left rounded-xl border border-line px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5 text-on-surface-variant">
              <MapPin size={15} />
              <span className="text-sm font-bold text-on-surface">Locations</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{settings.locationCount}</p>
            <p className="text-xs text-on-surface-variant">pharmacy locations</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant mt-4">
          These figures reflect the live configuration on the Medication Catalog, Procurement, and Controlled Medicines tabs — edit them there rather than here to avoid a second source of truth.
        </p>
      </Card>
    </div>
  );
}
