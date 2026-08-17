interface WaveformPatternProps {
  color?: string;
  opacity?: number;
}

/**
 * The Clinical Precision "ECG Heartbeat" signature motif — a tiled watermark texture,
 * never a literal logo. Used behind gradient hero cards and dark headers.
 */
export function WaveformPattern({ color = "#FFFFFF", opacity = 0.14 }: WaveformPatternProps) {
  const id = `waveform-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity }} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="64" height="36" patternUnits="userSpaceOnUse">
          <path d="M0 20 L16 20 L20 8 L25 32 L29 20 L64 20" fill="none" stroke={color} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
