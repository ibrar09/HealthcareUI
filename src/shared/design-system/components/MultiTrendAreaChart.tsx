import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface Series {
  key: string;
  label: string;
  color: string;
}

interface MultiTrendAreaChartProps {
  data: Record<string, string | number>[];
  series: Series[];
  height?: number;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  series: Series[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white border border-line shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-on-surface mb-1">{label}</div>
      {payload.map((p) => {
        const s = series.find((item) => item.key === p.dataKey);
        return (
          <div key={p.dataKey} className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s?.color }} />
            {s?.label}: <span className="font-semibold text-on-surface">{p.value}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Multi-series area trend chart with a shared hover tooltip — e.g. "new vs. discharged" over time. */
export function MultiTrendAreaChart({ data, series, height = 260 }: MultiTrendAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => {
            const id = `mtac-${s.key}`;
            return (
              <linearGradient key={s.key} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} tickLine={false} axisLine={false} width={32} />
        <Tooltip content={<ChartTooltip series={series} />} cursor={{ stroke: "var(--line)", strokeWidth: 1 }} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2.5}
            fill={`url(#mtac-${s.key})`}
            activeDot={{ r: 5, fill: "#FFFFFF", stroke: s.color, strokeWidth: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
