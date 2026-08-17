import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface TrendAreaChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
}

interface TooltipPayload {
  value: number;
  payload: { label: string; value: number };
}

function ChartTooltip({
  active,
  payload,
  color,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  color: string;
  valueFormatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg bg-[var(--ink-navy)] px-3 py-1.5 text-white shadow-lg font-mono text-xs font-bold"
      style={{ borderBottom: `2px solid ${color}` }}
    >
      {valueFormatter(payload[0].value)}
    </div>
  );
}

/** Shared area-trend chart with a hover tooltip callout — used for any "metric over time" panel. */
export function TrendAreaChart({
  data,
  color = "var(--signal-indigo)",
  height = 260,
  valueFormatter = (v) => String(v),
}: TrendAreaChartProps) {
  const gradientId = `area-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--line)" }}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <Tooltip
          content={<ChartTooltip color={color} valueFormatter={valueFormatter} />}
          cursor={{ stroke: "var(--line)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 5, fill: color, stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
