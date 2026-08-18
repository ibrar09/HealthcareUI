import { ChevronRight } from "lucide-react";
import type { RosterPatient } from "@modules/doctor-portal/api";

export type AttentionFilterKey = "critical-results" | "abnormal-results" | "follow-ups" | "referrals" | "notes-signature" | "external-records";

interface NeedsMyAttentionPanelProps {
  patients: RosterPatient[];
  activeFilter: AttentionFilterKey | null;
  onSelect: (key: AttentionFilterKey) => void;
}

const DOT: Record<string, string> = {
  critical: "bg-rose-500",
  abnormal: "bg-amber-500",
  routine: "bg-blue-500",
  info: "bg-slate-400",
};

/** Module-local — actionable "what needs my review right now" feed, computed from the roster's results/pending/records rather than a separate inbox system. */
export function NeedsMyAttentionPanel({ patients, activeFilter, onSelect }: NeedsMyAttentionPanelProps) {
  const criticalResults = patients.filter((p) => p.recentResults.some((r) => r.flag === "critical")).length;
  const abnormalResults = patients.filter((p) => p.recentResults.some((r) => r.flag === "abnormal")).length;
  const followUpsDue = patients.filter((p) => p.clinicalStatus === "Follow-up").length;
  const referrals = patients.filter((p) => p.pending.some((i) => i.label.toLowerCase().includes("referral"))).length;
  const notesSignature = patients.filter((p) => p.pending.some((i) => i.label.toLowerCase().includes("signature"))).length;
  const externalRecords = patients.filter((p) => p.externalRecords).length;

  const allItems: { key: AttentionFilterKey; label: string; count: number; dot: string }[] = [
    { key: "critical-results", label: "Critical Results", count: criticalResults, dot: DOT.critical },
    { key: "abnormal-results", label: "Abnormal Lab Results", count: abnormalResults, dot: DOT.abnormal },
    { key: "follow-ups", label: "Follow-ups Due", count: followUpsDue, dot: DOT.routine },
    { key: "referrals", label: "Referrals Awaiting Response", count: referrals, dot: DOT.routine },
    { key: "notes-signature", label: "Notes Awaiting Signature", count: notesSignature, dot: DOT.routine },
    { key: "external-records", label: "New External Records", count: externalRecords, dot: DOT.info },
  ];
  const items = allItems.filter((i) => i.count > 0);

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
      <h2 className="text-sm font-bold text-slate-800 mb-3">Needs My Attention</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.key === activeFilter;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
              {item.count} {item.label}
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
