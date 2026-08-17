import { AlertTriangle, AlertOctagon, Info, PackageSearch, ShoppingCart, ClipboardList } from "lucide-react";
import { Card } from "@shared/design-system/components";
import type { InventoryAlert } from "@modules/hospital-admin/api";

interface AlertsPanelProps {
  alerts: InventoryAlert[];
}

const severityColor: Record<InventoryAlert["severity"], string> = {
  info: "var(--signal-indigo)",
  warning: "var(--caution-amber)",
  critical: "var(--pulse-coral)",
};

const categoryIcon: Record<InventoryAlert["category"], typeof PackageSearch> = {
  stock: PackageSearch,
  procurement: ShoppingCart,
  operational: ClipboardList,
};

const categoryLabel: Record<InventoryAlert["category"], string> = {
  stock: "Stock Alerts",
  procurement: "Procurement Alerts",
  operational: "Operational Alerts",
};

/** Module-local — Inventory Alerts (spec §42): stock/procurement/operational, all computed live from current state, never a stored decorative list. */
export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const categories: InventoryAlert["category"][] = ["stock", "procurement", "operational"];
  return (
    <div className="flex flex-col gap-6 pb-8">
      {categories.map((cat) => {
        const rows = alerts.filter((a) => a.category === cat);
        const Icon = categoryIcon[cat];
        return (
          <Card hero key={cat}>
            <div className="flex items-center gap-2 mb-4">
              <Icon size={16} className="text-on-surface-variant" />
              <h2 className="text-lg font-bold text-on-surface">{categoryLabel[cat]}</h2>
              <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-xs font-bold text-on-surface-variant">{rows.length}</span>
            </div>
            {rows.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">Nothing to flag right now.</p>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {rows.map((a) => {
                  const SeverityIcon = a.severity === "critical" ? AlertOctagon : a.severity === "warning" ? AlertTriangle : Info;
                  return (
                    <div key={a.id} className="py-2.5 flex items-start gap-2.5">
                      <SeverityIcon size={15} className="mt-0.5 flex-shrink-0" style={{ color: severityColor[a.severity] }} />
                      <p className="text-sm text-on-surface">{a.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
