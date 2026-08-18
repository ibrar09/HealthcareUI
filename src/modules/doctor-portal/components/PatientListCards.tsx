import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Globe } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { PatientQuickActionsMenu } from "@modules/doctor-portal/components/PatientQuickActionsMenu";
import type { ClinicalStatus, RosterPatient } from "@modules/doctor-portal/api";

interface PatientListCardsProps {
  patients: RosterPatient[];
  groupBy: "none" | "department" | "location";
}

const CLINICAL_STATUS_DOT: Record<ClinicalStatus, string> = {
  Stable: "bg-emerald-500", Attention: "bg-amber-500", "High Risk": "bg-orange-500", Critical: "bg-rose-500", "Follow-up": "bg-blue-500",
};
const CLINICAL_STATUS_TEXT: Record<ClinicalStatus, string> = {
  Stable: "text-emerald-700 bg-emerald-50 border-emerald-100", Attention: "text-amber-700 bg-amber-50 border-amber-100",
  "High Risk": "text-orange-700 bg-orange-50 border-orange-100", Critical: "text-rose-700 bg-rose-50 border-rose-100",
  "Follow-up": "text-blue-700 bg-blue-50 border-blue-100",
};
const RESULT_FLAG_ICON: Record<string, string> = { critical: "🔴", abnormal: "🟡", normal: "🟢" };
const PENDING_DOT: Record<string, string> = { critical: "bg-rose-500", abnormal: "bg-amber-500", routine: "bg-slate-400" };

function groupKey(p: RosterPatient, groupBy: "none" | "department" | "location") {
  if (groupBy === "department") return p.department;
  if (groupBy === "location") return p.locationType;
  return "";
}

/** Module-local — card-layout variant of the My Patients list, same data as the table, better suited to tablets. */
export function PatientListCards({ patients, groupBy }: PatientListCardsProps) {
  const navigate = useNavigate();

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
        <p className="text-sm font-semibold text-slate-600">No patients match your search.</p>
        <p className="text-xs text-slate-400 mt-1">Try a different name, MRN, phone number, or filter.</p>
      </div>
    );
  }

  const groups: [string, RosterPatient[]][] =
    groupBy === "none"
      ? [["", patients]]
      : Array.from(
          patients.reduce((map, p) => {
            const key = groupKey(p, groupBy);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
            return map;
          }, new Map<string, RosterPatient[]>())
        );

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([group, groupPatients]) => (
        <Fragment key={group || "ungrouped"}>
          {group && (
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {group} <span className="text-slate-400 font-semibold normal-case">· {groupPatients.length}</span>
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupPatients.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                        {p.externalRecords && <Globe className="w-3 h-3 text-blue-400 flex-shrink-0" aria-label="External records available" />}
                      </div>
                      <p className="text-[11px] text-slate-400">{p.mrn} · {p.age}{p.gender === "Male" ? "M" : "F"}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-2 py-0.5 flex-shrink-0 ${CLINICAL_STATUS_TEXT[p.clinicalStatus]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${CLINICAL_STATUS_DOT[p.clinicalStatus]}`} /> {p.clinicalStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{p.encounterType}</span> · {p.department}
                  {(p.encounterType === "IPD" || p.encounterType === "Emergency") && <> · {p.location}</>}
                </p>

                {p.allergies.length > 0 && (
                  <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 w-fit">
                    <AlertTriangle className="w-3 h-3" /> {p.allergies.length === 1 ? p.allergies[0].substance : `${p.allergies.length} Allergies`}
                  </p>
                )}

                {p.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.conditions.map((c) => (
                      <span key={c} className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100 rounded-full px-2 py-0.5">{c}</span>
                    ))}
                  </div>
                )}

                {(p.vitals.bp || p.vitals.hr !== undefined || p.vitals.spo2 !== undefined) && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-600">
                    {p.vitals.bp && <span>BP {p.vitals.bp}</span>}
                    {p.vitals.hr !== undefined && <span>HR {p.vitals.hr}</span>}
                    {p.vitals.spo2 !== undefined && <span>SpO₂ {p.vitals.spo2}%</span>}
                  </div>
                )}

                {p.recentResults.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {p.recentResults.slice(0, 2).map((r) => (
                      <p key={r.name} className="text-[11px] text-slate-600">{RESULT_FLAG_ICON[r.flag]} {r.name} {r.value}</p>
                    ))}
                  </div>
                )}

                {p.pending.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {p.pending.map((item) => (
                      <p key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PENDING_DOT[item.urgency]}`} /> {item.label}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-50">
                  <span>Last: {p.lastVisit}</span>
                  <span>{p.nextAppointment ? `Next: ${p.nextAppointment}` : "No follow-up scheduled"}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(p.id))}
                    className="flex-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition-colors"
                  >
                    Open Patient
                  </button>
                  <PatientQuickActionsMenu patientId={p.id} />
                </div>
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
