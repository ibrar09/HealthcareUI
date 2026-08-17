import { ReactNode } from "react";

/** Shared building blocks for the module's drawer forms (Facility, Admission, ...). */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">{title}</h3>
      {children}
    </div>
  );
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

export const formInputClass =
  "w-full rounded-input border border-line px-3.5 py-2.5 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all";

interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType<{ size?: number | string }>;
}

export function ChipSelect<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ChipOption<T>[];
  columns?: number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const active = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all ${
              active
                ? "border-signal-indigo bg-signal-indigo-tint text-signal-indigo"
                : "border-line text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {Icon && <Icon size={18} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
