import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-signal-indigo to-signal-indigo-dark text-white shadow-[0_4px_14px_-4px_rgba(53,23,217,0.45)] hover:shadow-[0_8px_22px_-4px_rgba(53,23,217,0.55)] hover:brightness-[1.08]",
  outline: "bg-white text-on-surface border border-line hover:border-signal-indigo hover:text-signal-indigo",
  ghost: "bg-transparent text-on-surface hover:bg-paper",
  danger: "bg-white text-pulse-coral border border-pulse-coral/30 hover:bg-pulse-coral/5",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-input",
  md: "text-sm px-4 py-2.5 rounded-input",
  lg: "text-base px-5 py-3 rounded-input",
};

/** Every button in every module goes through this component. Never a raw <button> with ad-hoc classes. */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "font-display font-medium inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
