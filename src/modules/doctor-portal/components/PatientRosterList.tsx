import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Globe } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { PatientQuickActionsMenu } from "@modules/doctor-portal/components/PatientQuickActionsMenu";
import type { ColumnKey } from "@modules/doctor-portal/components/PatientColumnsMenu";
import type { ClinicalStatus, RosterPatient } from "@modules/doctor-portal/api";

interface PatientRosterListProps {
  patients: RosterPatient[];
  columns: Record<ColumnKey, boolean>;
  groupBy: "none" | "department" | "location";
  onSelectPatient: (patientId: string) => void;
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

/** Module-local — the full My Patients table: identity, encounter, diagnosis, allergy, vitals, results, pending, last/next visit, all column-configurable and optionally grouped. */
export function PatientRosterList({ patients, columns, groupBy, onSelectPatient }: PatientRosterListProps) {
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-4 py-3 font-bold">Patient</th>
            {columns.encounter && <th className="px-3 py-3 font-bold">Encounter</th>}
            {columns.diagnosis && <th className="px-3 py-3 font-bold">Diagnosis</th>}
            {columns.allergy && <th className="px-3 py-3 font-bold">Allergy</th>}
            {columns.vitals && <th className="px-3 py-3 font-bold">Vitals</th>}
            {columns.results && <th className="px-3 py-3 font-bold">Results</th>}
            {columns.pending && <th className="px-3 py-3 font-bold">Pending</th>}
            {columns.lastVisit && <th className="px-3 py-3 font-bold">Last Visit</th>}
            {columns.nextAppointment && <th className="px-3 py-3 font-bold">Next</th>}
            {columns.phone && <th className="px-3 py-3 font-bold">Phone</th>}
            {columns.location && <th className="px-3 py-3 font-bold">Location</th>}
            <th className="px-3 py-3 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(([group, groupPatients]) => (
            <Fragment key={group || "ungrouped"}>
              {group && (
                <tr key={`group-${group}`} className="bg-slate-50">
                  <td colSpan={12} className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {group} <span className="text-slate-400 font-semibold normal-case">· {groupPatients.length}</span>
                  </td>
                </tr>
              )}
              {groupPatients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectPatient(p.id); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View quick summary for ${p.name}`}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors align-top cursor-pointer focus:outline-none focus:bg-blue-50/40"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-slate-800">{p.name}</p>
                          {p.externalRecords && <Globe className="w-3 h-3 text-blue-400" aria-label="External records available" />}
                        </div>
                        <p className="text-[11px] text-slate-400">{p.mrn} · {p.age}{p.gender === "Male" ? "M" : "F"}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 ${CLINICAL_STATUS_TEXT[p.clinicalStatus]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${CLINICAL_STATUS_DOT[p.clinicalStatus]}`} /> {p.clinicalStatus}
                        </span>
                      </div>
                    </div>
                  </td>

                  {columns.encounter && (
                    <td className="px-3 py-3.5 text-xs">
                      <p className="font-bold text-slate-700">{p.encounterType}</p>
                      <p className="text-slate-500">{p.department}</p>
                      {(p.encounterType === "IPD" || p.encounterType === "Emergency") && <p className="text-[11px] text-slate-400 mt-0.5">{p.location}</p>}
                    </td>
                  )}

                  {columns.diagnosis && (
                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {p.conditions.slice(0, 2).map((c) => (
                          <span key={c} className="text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100 rounded-full px-2 py-0.5 whitespace-nowrap">{c}</span>
                        ))}
                        {p.conditions.length > 2 && <span className="text-[10px] text-slate-400">+{p.conditions.length - 2}</span>}
                      </div>
                    </td>
                  )}

                  {columns.allergy && (
                    <td className="px-3 py-3.5">
                      {p.allergies.length === 0 ? (
                        <span className="text-[11px] text-slate-300">—</span>
                      ) : p.allergies.length === 1 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600" title={p.allergies[0].reaction}>
                          <AlertTriangle className="w-3 h-3" /> {p.allergies[0].substance}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                          <AlertTriangle className="w-3 h-3" /> {p.allergies.length} Allergies
                        </span>
                      )}
                    </td>
                  )}

                  {columns.vitals && (
                    <td className="px-3 py-3.5 text-[11px] text-slate-600">
                      {p.vitals.bp && <p>BP {p.vitals.bp}</p>}
                      {p.vitals.hr !== undefined && <p>HR {p.vitals.hr}</p>}
                    </td>
                  )}

                  {columns.results && (
                    <td className="px-3 py-3.5">
                      {p.recentResults.length === 0 ? (
                        <span className="text-[11px] text-slate-300">—</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {p.recentResults.slice(0, 2).map((r) => (
                            <p key={r.name} className="text-[11px] text-slate-600 whitespace-nowrap">
                              {RESULT_FLAG_ICON[r.flag]} {r.name} {r.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                  )}

                  {columns.pending && (
                    <td className="px-3 py-3.5">
                      {p.pending.length === 0 ? (
                        <span className="text-[11px] text-slate-300">—</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {p.pending.map((item) => (
                            <p key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-600 whitespace-nowrap">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PENDING_DOT[item.urgency]}`} /> {item.label}
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                  )}

                  {columns.lastVisit && <td className="px-3 py-3.5 text-[11px] text-slate-600 whitespace-nowrap">{p.lastVisit}</td>}

                  {columns.nextAppointment && (
                    <td className="px-3 py-3.5 text-[11px] whitespace-nowrap">
                      {p.nextAppointment ? <span className="text-slate-600">{p.nextAppointment}</span> : <span className="text-slate-300">No follow-up scheduled</span>}
                    </td>
                  )}

                  {columns.phone && <td className="px-3 py-3.5 text-[11px] text-slate-600 whitespace-nowrap">{p.phone}</td>}
                  {columns.location && <td className="px-3 py-3.5 text-[11px] text-slate-600 whitespace-nowrap">{p.location}</td>}

                  <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(p.id))}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                      >
                        Open Patient
                      </button>
                      <PatientQuickActionsMenu patientId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
