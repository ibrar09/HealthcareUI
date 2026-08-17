interface Segment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  centerLabel?: string;
  /** Overrides the auto-summed total, e.g. a fixed completion percent — renders label above value instead of value above label. */
  centerValue?: string;
  size?: number;
  legend?: boolean;
  /** "computed" (default) shows each segment's share of the total; "raw" shows the segment's own value with a literal % suffix. */
  legendMode?: "computed" | "raw";
}

/**
 * Module-local component — lives here, not in shared/, because only
 * Hospital Admin's "Patients by Department" screen needs a donut chart
 * right now. If Billing or Platform Admin later needs the same pattern,
 * THAT's when this gets promoted to shared/design-system/components/.
 */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 160,
  legend = true,
  legendMode = "computed",
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((seg) => {
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const strokeDashoffset = -offsetAcc;
            offsetAcc += dash;
            return (
              <circle
                key={seg.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={16}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
        {centerLabel && !centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono font-bold text-2xl text-on-surface">{total}</span>
            <span className="text-[10px] text-on-surface-variant">{centerLabel}</span>
          </div>
        )}
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel && <span className="text-xs text-on-surface-variant font-medium">{centerLabel}</span>}
            <span className="text-xl font-bold text-on-surface">{centerValue}</span>
          </div>
        )}
      </div>
      {legend && (
        <div className="flex flex-col gap-3">
          {data.map((seg) => (
            <div key={seg.name} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-on-surface-variant font-medium">{seg.name}</span>
              </span>
              <span className="font-bold text-on-surface text-xs">
                {legendMode === "raw" ? seg.value : Math.round((seg.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
