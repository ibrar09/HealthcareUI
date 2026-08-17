import { CheckCircle2, Sparkles } from "lucide-react";
import type { BedListRow } from "@modules/hospital-admin/api";

interface CleaningQueueProps {
  beds: BedListRow[];
  onComplete: (bedId: string) => void;
}

/** Module-local — Bed Management "Cleaning" tab (spec §18): beds awaiting turnaround before they're available again. */
export function CleaningQueue({ beds, onComplete }: CleaningQueueProps) {
  if (beds.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vital-green/10 text-vital-green mb-3">
          <CheckCircle2 size={22} />
        </span>
        <p className="font-bold text-on-surface">Cleaning queue is empty</p>
        <p className="text-sm text-on-surface-variant mt-1">No beds are currently awaiting turnaround.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {beds.map((b) => (
        <div key={b.id} className="relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden shadow-card">
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: "var(--caution-amber)" }} />
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-caution-amber/10 text-caution-amber">
            <Sparkles size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-on-surface truncate">{b.identifier}</h3>
            <p className="text-xs text-on-surface-variant truncate">
              {b.wardName} · {b.roomName} · Vacated {b.lastUpdated}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onComplete(b.id)}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-glow hover:brightness-110 transition-all flex-shrink-0"
          >
            <CheckCircle2 size={13} /> Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
}
