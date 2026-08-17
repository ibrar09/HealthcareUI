import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hero?: boolean;
  accentColor?: string;
  children: ReactNode;
}

export function Card({ hero, accentColor, className, style, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "relative bg-white border border-line shadow-card overflow-hidden",
        hero ? "rounded-hero p-6" : "rounded-card p-5",
        "transition-all duration-200 hover:-translate-y-0.5",
        accentColor
          ? "hover:shadow-[0_16px_32px_-14px_var(--card-glow)]"
          : "hover:shadow-card-hover",
        className
      )}
      style={
        {
          backgroundImage: accentColor
            ? `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 13%, transparent) 0%, transparent 60%)`
            : undefined,
          "--card-glow": accentColor ? `color-mix(in srgb, ${accentColor} 33%, transparent)` : undefined,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {accentColor && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80" />
      {children}
    </div>
  );
}
