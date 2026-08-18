import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface AppointmentModalShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  widthClass?: string;
}

/** Module-local — shared centered-modal shell for Book/Reschedule/Cancel appointment forms. */
export function AppointmentModalShell({ title, onClose, children, footer, widthClass = "max-w-md" }: AppointmentModalShellProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-label={title} className={`bg-white rounded-2xl shadow-2xl w-full ${widthClass} max-h-[90vh] flex flex-col`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 flex-shrink-0">{footer}</div>
        </div>
      </div>
    </>
  );
}
