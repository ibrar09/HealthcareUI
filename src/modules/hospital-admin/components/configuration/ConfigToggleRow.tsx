import { toggleTrackClass, toggleThumbClass } from "@modules/hospital-admin/components/configuration/configHelpers";

interface ConfigToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Module-local — a single toggleable setting row, reused across every Configuration panel. */
export function ConfigToggleRow({ label, description, checked, onChange }: ConfigToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={toggleTrackClass(checked)}>
        <span className={toggleThumbClass(checked)} />
      </button>
    </div>
  );
}
