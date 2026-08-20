import { AlertOctagon, AlertTriangle, Bell } from "lucide-react";
import type { AttentionItem, AttentionSeverity } from "@modules/nursing-ipd/api";

interface NeedsAttentionPanelProps {
  items: AttentionItem[];
}

const SEVERITY_STYLE: Record<AttentionSeverity, { bg: string; text: string; icon: typeof AlertOctagon }> = {
  critical: { bg: "bg-rose-50 border-rose-100", text: "text-rose-700", icon: AlertOctagon },
  high: { bg: "bg-orange-50 border-orange-100", text: "text-orange-700", icon: AlertTriangle },
  medium: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: Bell },
};

/** Module-local — the Nurse Dashboard's "Needs Attention" feed: the handful of things that need eyes on them right now, not a full alert log. */
export function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-fit">
      <h2 className="text-sm font-bold text-slate-800 mb-3">Needs Attention</h2>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">Nothing needs attention right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const style = SEVERITY_STYLE[item.severity];
            const Icon = style.icon;
            return (
              <div key={item.id} className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${style.bg}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.text}`} />
                <p className={`text-xs font-semibold ${style.text}`}>{item.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
