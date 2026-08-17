import { CSSProperties, ReactNode } from "react";

interface ServiceRowProps {
  name: string;
  tag: string;
  code: string;
  meta: string;
  coverage: number;
  price: number;
  accentColor: string;
  icon?: ReactNode;
  onManage?: () => void;
}

/** Module-local — a billable service line item (Facilities › Services tab). */
export function ServiceRow({ name, tag, code, meta, coverage, price, accentColor, icon, onManage }: ServiceRowProps) {
  return (
    <button
      type="button"
      onClick={onManage}
      className="group relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_var(--row-glow)]"
      style={{ "--row-glow": `color-mix(in srgb, ${accentColor} 30%, transparent)` } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)` }}
      />
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundImage: `linear-gradient(180deg, ${accentColor}, color-mix(in srgb, ${accentColor} 30%, transparent))` }}
      />

      {icon && (
        <span
          className="relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}
        >
          {icon}
        </span>
      )}

      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-bold text-on-surface">{name}</h3>
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md flex-shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor }}
          >
            {tag}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          <span className="font-mono">{code}</span> · {meta}
        </p>
      </div>

      <div className="relative z-10 flex items-center gap-6 flex-shrink-0">
        <div className="w-32 hidden sm:block">
          <div className="flex justify-between text-[10px] text-on-surface-variant mb-1">
            <span>Avg. Coverage</span>
            <span className="font-bold text-on-surface">{coverage}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${coverage}%`,
                backgroundImage: `linear-gradient(90deg, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, white))`,
              }}
            />
          </div>
        </div>
        <div
          className="text-xl font-bold w-24 text-right bg-clip-text text-transparent"
          style={{ backgroundImage: `linear-gradient(90deg, var(--on-surface), color-mix(in srgb, ${accentColor} 55%, var(--on-surface)))` }}
        >
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </button>
  );
}
