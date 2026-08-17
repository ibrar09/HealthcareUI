import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  accentColor?: string;
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}

/** THE replacement for a plain <table> row across all modules. No module should render a raw HTML table for record lists. */
export function CardRow({
  accentColor = "var(--line)",
  leading,
  title,
  subtitle,
  trailing,
  className,
  onClick,
  ...rest
}: CardRowProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex items-center gap-4 bg-white rounded-card border border-line pl-4 pr-5 py-4",
        "transition-all duration-150",
        onClick && "cursor-pointer hover:shadow-card-hover hover:-translate-y-[1px]",
        className
      )}
      style={{ borderLeft: `3px solid ${accentColor}` }}
      {...rest}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-on-surface text-[15px] truncate">{title}</div>
        {subtitle && <div className="text-sm text-on-surface-variant font-body truncate">{subtitle}</div>}
      </div>
      {trailing && <div className="flex-shrink-0 flex items-center gap-3">{trailing}</div>}
    </div>
  );
}
