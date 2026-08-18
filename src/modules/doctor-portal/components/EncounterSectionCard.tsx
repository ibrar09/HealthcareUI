import { ReactNode } from "react";
import { Plus } from "lucide-react";

interface EncounterSectionCardProps {
  icon: ReactNode;
  title: string;
  count: number;
  emptyLabel: string;
  form: ReactNode;
  children: ReactNode;
}

/** Module-local — shared shell for each Encounter Workspace section (Diagnosis/Prescription/Orders): icon header, add-form, and a list of items added this encounter. */
export function EncounterSectionCard({ icon, title, count, emptyLabel, form, children }: EncounterSectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {count > 0 && (
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{count}</span>
        )}
      </div>

      {form}

      <div className="flex flex-col divide-y divide-slate-100 mt-3">
        {count === 0 ? <p className="text-xs text-slate-400 text-center py-4">{emptyLabel}</p> : children}
      </div>
    </div>
  );
}

interface AddButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export function EncounterAddButton({ onClick, disabled, label }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition-colors"
    >
      <Plus className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
