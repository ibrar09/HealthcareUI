import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { StockStatus } from "@modules/doctor-portal/api";

const STYLE: Record<StockStatus, { classes: string; Icon: typeof CheckCircle2 }> = {
  "In Stock": { classes: "bg-emerald-50 text-emerald-700 border-emerald-100", Icon: CheckCircle2 },
  "Low Stock": { classes: "bg-amber-50 text-amber-700 border-amber-100", Icon: AlertTriangle },
  "Out of Stock": { classes: "bg-rose-50 text-rose-700 border-rose-100", Icon: XCircle },
};

interface StockStatusBadgeProps {
  status: StockStatus;
}

/** Module-local — shared stock-status pill, used on both the Product & Stock list and the Encounter Workspace's live prescription lookup. */
export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  const { classes, Icon } = STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2.5 py-1 ${classes}`}>
      <Icon className="w-3 h-3" /> {status}
    </span>
  );
}
