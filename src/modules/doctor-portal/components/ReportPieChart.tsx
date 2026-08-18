import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ReportPieChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

interface TooltipPayload {
  value: number;
  payload: { label: string; value: number; color: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white border border-slate-100 shadow-lg px-3 py-1.5 text-xs font-semibold text-slate-700">
      {payload[0].payload.label}: {payload[0].value}
    </div>
  );
}

/** Module-local — donut chart for Report's status-distribution breakdowns (e.g. clinical status across the roster). */
export function ReportPieChart({ data, height = 220 }: ReportPieChartProps) {
  return (
    <div className="flex items-center gap-5">
      <ResponsiveContainer width="55%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="font-bold text-slate-800">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
