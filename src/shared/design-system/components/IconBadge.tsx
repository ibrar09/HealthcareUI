import { ReactNode } from "react";

interface IconBadgeProps {
  icon: ReactNode;
  color?: string;
  size?: number;
}

/** Duotone icon badge — never render a bare outline icon alone anywhere in the platform. */
export function IconBadge({ icon, color = "var(--signal-indigo)", size = 40 }: IconBadgeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
    >
      {icon}
    </div>
  );
}
