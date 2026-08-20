import { AlertTriangle } from "lucide-react";
import type { AttentionItem, NurseShift, NursePatient } from "@modules/nursing-ipd/api";

interface NurseGreetingHeroProps {
  shift: NurseShift | null;
  topAttention: AttentionItem | null;
  topAttentionPatient: NursePatient | null;
}

const SEVERITY_LABEL: Record<string, string> = { critical: "🔴", high: "🟠", medium: "🟡" };

/** Module-local — the Nurse Dashboard's hero card: greeting, shift context, and the single most urgent thing to look at first. */
export function NurseGreetingHero({ shift, topAttention, topAttentionPatient }: NurseGreetingHeroProps) {
  return (
    <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-sm mb-5 overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative">
        <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1">{shift?.shiftType} Shift · {shift?.startTime} – {shift?.endTime}</p>
        <h1 className="text-2xl font-bold mb-1">Good Morning, {shift?.nurseName?.replace("Nurse ", "") ?? "Nurse"}</h1>
        <p className="text-sm text-teal-50 mb-4">{shift?.ward} · Charge Nurse: {shift?.chargeNurse}</p>

        {topAttention && topAttentionPatient && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
            <span className="text-lg">{SEVERITY_LABEL[topAttention.severity]}</span>
            <div>
              <p className="text-[11px] font-semibold text-teal-100 uppercase tracking-wider">Most Urgent</p>
              <p className="text-sm font-bold">{topAttention.label}</p>
              <p className="text-xs text-teal-100">Room {topAttentionPatient.room} · Bed {topAttentionPatient.bed}</p>
            </div>
          </div>
        )}

        {!topAttention && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
            <AlertTriangle className="w-4 h-4 text-teal-100" />
            <p className="text-sm font-semibold">All patients stable — nothing urgent right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
