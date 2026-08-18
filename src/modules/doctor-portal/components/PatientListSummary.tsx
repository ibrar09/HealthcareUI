import type { RosterPatient } from "@modules/doctor-portal/api";

interface PatientListSummaryProps {
  patients: RosterPatient[];
}

/** Module-local — the My Patients header stat row, computed live from the current roster (not a hardcoded count). */
export function PatientListSummary({ patients }: PatientListSummaryProps) {
  const total = patients.length;
  const today = patients.filter((p) => p.lastVisit.startsWith("Today")).length;
  const active = patients.filter((p) => p.encounterActive).length;
  const ipd = patients.filter((p) => p.encounterType === "IPD").length;
  const critical = patients.filter((p) => p.clinicalStatus === "Critical").length;
  const pendingResults = patients.filter((p) => p.pending.length > 0).length;
  const followUps = patients.filter((p) => p.clinicalStatus === "Follow-up").length;

  const stats: { label: string; value: number; tone?: "critical" }[] = [
    { label: "Total Patients", value: total },
    { label: "Today's Patients", value: today },
    { label: "Active Encounters", value: active },
    { label: "IPD Patients", value: ipd },
    { label: "Critical", value: critical, tone: critical > 0 ? "critical" : undefined },
    { label: "Pending Results", value: pendingResults },
    { label: "Follow-ups", value: followUps },
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-2.5 flex-1 min-w-[130px]">
          <p className={`text-xl font-bold ${s.tone === "critical" ? "text-rose-600" : "text-slate-800"}`}>{s.value}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
