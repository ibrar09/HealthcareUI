import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ReportBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  layout?: "vertical" | "horizontal";
}

interface TooltipPayload {
  value: number;
  payload: { label: string; value: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white border border-slate-100 shadow-lg px-3 py-1.5 text-xs font-semibold text-slate-700">
      {payload[0].payload.label}: {payload[0].value}
    </div>
  );
}

/** Module-local — bar chart for Report's categorical breakdowns (visit type, appointment status, top diagnoses). "horizontal" layout puts labels on the Y axis for long category names. */
export function ReportBarChart({ data, color = "#2563EB", height = 260, layout = "horizontal" }: ReportBarChartProps) {
  const isHorizontal = layout === "horizontal";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={isHorizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 16, left: isHorizontal ? 8 : 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={!isHorizontal} vertical={isHorizontal} />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={{ stroke: "#F1F5F9" }} allowDecimals={false} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={140} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={{ stroke: "#F1F5F9" }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} tickLine={false} axisLine={false} allowDecimals={false} />
          </>
        )}
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFC" }} />
        <Bar dataKey="value" fill={color} radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
