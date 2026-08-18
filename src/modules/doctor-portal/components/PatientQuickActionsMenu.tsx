import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ExternalLink, Stethoscope, Pill, FlaskConical, ScanLine, Share2, FileText, CalendarPlus } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface PatientQuickActionsMenuProps {
  patientId: string;
}

const comingSoonItems = [
  { label: "Prescription", icon: Pill },
  { label: "Lab Order", icon: FlaskConical },
  { label: "Imaging Order", icon: ScanLine },
  { label: "Referral", icon: Share2 },
  { label: "Add Note", icon: FileText },
  { label: "Schedule Follow-up", icon: CalendarPlus },
];

/** Module-local — the "⋮" quick-actions menu on each patient row/card. Open Patient and Start Encounter are real; the rest are visually present but inert until those workflows exist. */
export function PatientQuickActionsMenu({ patientId }: PatientQuickActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-slate-100 shadow-lg z-20 py-1.5">
          <button
            type="button"
            onClick={() => { setOpen(false); navigate(ROUTES.DOCTOR.PATIENT_DETAIL(patientId)); }}
            className="flex items-center gap-2 w-full text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 px-3 py-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Patient
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate(ROUTES.DOCTOR.ENCOUNTER(patientId)); }}
            className="flex items-center gap-2 w-full text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 px-3 py-2"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Start Encounter
          </button>
          <div className="border-t border-slate-100 my-1.5" />
          {comingSoonItems.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 w-full text-left text-xs font-medium text-slate-400 px-3 py-2 cursor-not-allowed" title="Coming soon">
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
