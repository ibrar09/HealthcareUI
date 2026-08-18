import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { Appointment, RosterPatient } from "@modules/doctor-portal/api";

interface ClinicalBriefProps {
  doctorName: string;
  todaysAppointments: Appointment[];
  roster: RosterPatient[];
}

function toMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let [, h, m, ampm] = match;
  let hours = parseInt(h, 10);
  if (ampm.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
  return hours * 60 + parseInt(m, 10);
}

/** Module-local — the "Good morning" clinical brief: today's patient count plus what needs review before the doctor's day starts. Reuses the same computation pattern as My Patients' Needs My Attention panel. */
export function ClinicalBrief({ doctorName, todaysAppointments, roster }: ClinicalBriefProps) {
  const navigate = useNavigate();
  const activeToday = todaysAppointments.filter((a) => a.status !== "Cancelled");
  const todaysPatients = activeToday
    .map((a) => ({ appt: a, patient: roster.find((p) => p.id === a.patientId) }))
    .filter((x): x is { appt: Appointment; patient: RosterPatient } => Boolean(x.patient));

  const criticalCount = todaysPatients.filter((x) => x.patient.clinicalStatus === "Critical").length;
  const abnormalCount = todaysPatients.filter((x) => x.patient.recentResults.some((r) => r.flag === "abnormal" || r.flag === "critical")).length;
  const followUpCount = todaysPatients.filter((x) => x.patient.clinicalStatus === "Follow-up").length;
  const externalCount = todaysPatients.filter((x) => x.patient.externalRecords).length;

  const upNext = todaysPatients
    .filter((x) => ["Confirmed", "Waiting", "Checked-in", "Scheduled"].includes(x.appt.status))
    .sort((a, b) => toMinutes(a.appt.time) - toMinutes(b.appt.time))[0];

  if (activeToday.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-sm mb-5">
      <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">Today's Clinical Brief</p>
      <h2 className="text-lg font-bold mb-3">Good morning, {doctorName}</h2>
      <p className="text-sm text-blue-50 mb-3">You have {activeToday.length} patients today.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {criticalCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">🔴 {criticalCount} patients have critical alerts</span>
        )}
        {abnormalCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">🟠 {abnormalCount} patients have abnormal recent results</span>
        )}
        {followUpCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">🟡 {followUpCount} patients require follow-up</span>
        )}
        {externalCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/15 rounded-full px-3 py-1.5">🔵 {externalCount} patients have external records available</span>
        )}
      </div>

      {upNext && (
        <div className="bg-white/10 rounded-xl px-4 py-3 mb-4">
          <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider mb-1">Your first patient</p>
          <p className="text-sm font-bold">{upNext.patient.name} · {upNext.appt.time}</p>
          <p className="text-xs text-blue-50">{upNext.appt.reason}</p>
          {upNext.patient.recentResults[0] && (
            <p className="text-xs text-blue-100 mt-1">Last {upNext.patient.recentResults[0].name}: {upNext.patient.recentResults[0].value}</p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(ROUTES.DOCTOR.APPOINTMENTS)}
        className="flex items-center gap-1 text-xs font-semibold text-white hover:text-blue-100"
      >
        Open Today's Schedule <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
