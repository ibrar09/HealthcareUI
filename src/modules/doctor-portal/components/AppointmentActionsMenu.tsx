import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

interface AppointmentActionsMenuProps {
  items: { label: string; onClick: () => void; danger?: boolean }[];
}

/** Module-local — the "⋮" secondary-actions menu on an appointment row (Reschedule/Cancel/Decline/No-show — whichever apply to that status). */
export function AppointmentActionsMenu({ items }: AppointmentActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="More actions" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-lg z-20 py-1.5">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`block w-full text-left text-xs font-semibold px-3 py-2 hover:bg-slate-50 ${item.danger ? "text-rose-600" : "text-slate-700"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
