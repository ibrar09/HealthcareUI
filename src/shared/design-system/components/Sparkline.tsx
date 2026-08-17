interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  heartbeat?: boolean;
  gradient?: boolean;
}

/** The Clinical Ink signature chart primitive — every trend line in the platform renders through this so the "heartbeat cadence" stays consistent across all modules. */
export function Sparkline({
  data,
  color = "var(--signal-indigo)",
  height = 40,
  heartbeat = false,
  gradient = true,
}: SparklineProps) {
  const width = 160;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * (height - 6) - 3;
    return [x, y];
  });

  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1];
    if (heartbeat) {
      const midX = (px + x) / 2;
      const spike = Math.min(py, y) - height * 0.14;
      return `${acc} L ${midX - 4} ${(py + y) / 2} L ${midX} ${spike} L ${midX + 4} ${(py + y) / 2} L ${x} ${y}`;
    }
    return `${acc} L ${x} ${y}`;
  }, "");

  const uid = color.replace(/[^a-zA-Z0-9]/g, "");
  const gradientId = `spark-${uid}`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {gradient && <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#${gradientId})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
