import { TrendingUp } from "lucide-react";
import { Card, KPICard } from "@shared/design-system/components";
import type { WardOccupancy, BedTypeOccupancy } from "@modules/hospital-admin/api";

interface OccupancyAnalyticsProps {
  overallOccupancyRate: number;
  byWard: WardOccupancy[];
  byBedType: BedTypeOccupancy[];
  genderAvailability: { male: number; female: number };
}

function rateColor(rate: number) {
  if (rate >= 90) return "var(--pulse-coral)";
  if (rate >= 70) return "var(--caution-amber)";
  return "var(--vital-green)";
}

/** Module-local — Bed Management Phase 3 Analytics tab (spec §21-22): deeper ward/bed-type breakdowns beyond the Dashboard headline numbers. */
export function OccupancyAnalytics({ overallOccupancyRate, byWard, byBedType, genderAvailability }: OccupancyAnalyticsProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KPICard label="Overall Occupancy" value={overallOccupancyRate} unit="%" icon={<TrendingUp size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Available — Male-eligible" value={genderAvailability.male} accentColor="var(--vital-green)" />
        <KPICard label="Available — Female-eligible" value={genderAvailability.female} accentColor="var(--vital-green)" />
      </div>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Occupancy by Ward</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[640px] flex flex-col gap-2">
            <div className="grid grid-cols-7 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wide text-on-surface-variant font-bold">
              <span className="col-span-2">Ward</span>
              <span className="text-right">Total</span>
              <span className="text-right">Available</span>
              <span className="text-right">Occupied</span>
              <span className="text-right">Reserved</span>
              <span className="text-right">Rate</span>
            </div>
            {byWard.map((w) => (
              <div key={w.wardId} className="grid grid-cols-7 gap-2 items-center rounded-xl border border-line px-3 py-2.5">
                <span className="col-span-2 text-sm font-semibold text-on-surface truncate">
                  {w.wardName} <span className="text-on-surface-variant font-normal font-mono text-xs">{w.wardCode}</span>
                </span>
                <span className="text-right text-sm text-on-surface">{w.totalBeds}</span>
                <span className="text-right text-sm text-vital-green font-semibold">{w.available}</span>
                <span className="text-right text-sm text-on-surface">{w.occupied}</span>
                <span className="text-right text-sm text-on-surface">{w.reserved}</span>
                <span className="text-right text-sm font-bold" style={{ color: rateColor(w.occupancyRate) }}>
                  {w.occupancyRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Occupancy by Bed Type</h2>
        <div className="flex flex-col gap-3">
          {byBedType.map((bt) => (
            <div key={bt.bedTypeId}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface font-medium">
                  {bt.bedTypeName} <span className="text-on-surface-variant">({bt.occupied}/{bt.totalBeds} occupied)</span>
                </span>
                <span className="font-bold" style={{ color: rateColor(bt.occupancyRate) }}>
                  {bt.occupancyRate}%
                </span>
              </div>
              <div className="w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full" style={{ width: `${bt.occupancyRate}%`, backgroundColor: rateColor(bt.occupancyRate) }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
