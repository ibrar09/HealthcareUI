import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import type { ReviewReport, ReviewReportStatus } from "@modules/doctor-portal/api";

interface ReviewReportsPanelProps {
  reports: ReviewReport[];
}

const statusStyle: Record<ReviewReportStatus, string> = {
  "Ready for Review": "bg-blue-50 text-blue-600 border-blue-100",
  "Action Required": "bg-rose-50 text-rose-600 border-rose-100",
  "Lab Completed": "bg-slate-100 text-slate-600 border-slate-200",
  "Radiology Approved": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Pending Assessment": "bg-amber-50 text-amber-700 border-amber-100",
};

/** Module-local — labs/imaging results awaiting doctor sign-off (spec §14 "the doctor shouldn't need to enter the laboratory module"). */
export function ReviewReportsPanel({ reports }: ReviewReportsPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800">Reports Awaiting Review</h2>
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{reports.length}</span>
      </div>

      <div className="flex flex-col divide-y divide-slate-100">
        {reports.map((r) => (
          <div key={r.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800 truncate">{r.name}</p>
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border flex-shrink-0 whitespace-nowrap ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{r.testName}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{r.findings}</p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.DOCTOR.PATIENT_DETAIL(r.patientId))}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1.5"
                >
                  History <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
