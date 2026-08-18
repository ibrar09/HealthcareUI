interface MicroBarChartProps {
  color?: "slate" | "orange" | "brown" | "green" | "blue";
  values?: number[];
}

const colorClasses: Record<NonNullable<MicroBarChartProps["color"]>, string> = {
  slate: "bg-slate-300",
  orange: "bg-orange-400",
  brown: "bg-amber-600",
  green: "bg-emerald-400",
  blue: "bg-blue-500",
};

/** Module-local — the small decorative bar-sparkline used on each Summary Card. */
export function MicroBarChart({ color = "blue", values = [40, 65, 30, 85, 55] }: MicroBarChartProps) {
  return (
    <div className="flex items-end space-x-1.5 h-10 px-1">
      {values.map((v, i) => (
        <div key={i} style={{ height: `${v}%` }} className={`w-1.5 rounded-full ${colorClasses[color]} transition-all duration-300 hover:opacity-80`} />
      ))}
    </div>
  );
}
