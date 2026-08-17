import { Package, Truck, Boxes, Tag, AlertTriangle } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import type { InventorySettingsData } from "@modules/hospital-admin/api";

interface InventorySettingsPanelProps {
  settings: InventorySettingsData | null;
  onGoToItems: () => void;
  onGoToProcurement: () => void;
  onGoToWarehouses: () => void;
}

/** Module-local — Settings overview (spec §46, matches every other module's discipline): links to the screens that own each value, never a duplicate config surface. */
export function InventorySettingsPanel({ settings, onGoToItems, onGoToProcurement, onGoToWarehouses }: InventorySettingsPanelProps) {
  if (!settings) return null;
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hero>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal-indigo/10 text-signal-indigo"><Tag size={16} /></span>
            <div>
              <h2 className="text-base font-bold text-on-surface">Item Catalog</h2>
              <p className="text-xs text-on-surface-variant">{settings.activeItemCount} active items · {settings.categoryCount} categories</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onGoToItems}>Manage Items & Categories</Button>
        </Card>

        <Card hero>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-vital-green/10 text-vital-green"><Truck size={16} /></span>
            <div>
              <h2 className="text-base font-bold text-on-surface">Procurement</h2>
              <p className="text-xs text-on-surface-variant">{settings.activeSupplierCount} active suppliers</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onGoToProcurement}>Manage Suppliers</Button>
        </Card>

        <Card hero>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-module-inventory/10" style={{ color: "var(--module-inventory)", backgroundColor: "color-mix(in srgb, var(--module-inventory) 10%, transparent)" }}><Boxes size={16} /></span>
            <div>
              <h2 className="text-base font-bold text-on-surface">Warehouses & Locations</h2>
              <p className="text-xs text-on-surface-variant">{settings.warehouseCount} warehouses</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onGoToWarehouses}>Manage Warehouses</Button>
        </Card>

        <Card hero accentColor="var(--caution-amber)">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-caution-amber/10 text-caution-amber"><AlertTriangle size={16} /></span>
            <div>
              <h2 className="text-base font-bold text-on-surface">Approval Rules</h2>
              <p className="text-xs text-on-surface-variant">Adjustments of {settings.defaultAdjustmentApprovalThreshold}+ units require a second approver</p>
            </div>
          </div>
        </Card>
      </div>

      <Card hero>
        <div className="flex items-center gap-2 mb-1">
          <Package size={15} className="text-on-surface-variant" />
          <h2 className="text-sm font-bold text-on-surface">Department</h2>
        </div>
        <p className="text-sm text-on-surface-variant">{settings.departmentName}</p>
      </Card>
    </div>
  );
}
