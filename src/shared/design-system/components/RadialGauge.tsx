interface RadialGaugeProps {
  percent: number;
  color?: string;
  trackColor?: string;
  labelColor?: string;
  size?: number;
  centerValue?: string;
}

export function RadialGauge({
  percent,
  color = "var(--signal-indigo)",
  trackColor = "var(--line)",
  labelColor = color,
  size = 96,
  centerValue,
}: RadialGaugeProps) {
  const stroke = size * 0.11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            filter: `drop-shadow(0 0 3px color-mix(in srgb, ${color} 53%, transparent))`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono font-bold" style={{ fontSize: size * 0.22, color: labelColor }}>
          {centerValue ?? `${percent}%`}
        </span>
      </div>
    </div>
  );
}
