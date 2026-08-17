import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Copy, ShieldCheck, Sparkles } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { Card, KPICard } from "@shared/design-system/components";
import * as api from "@modules/hospital-admin/api";
import { getPatientFullName } from "@modules/hospital-admin/api";
import type { DuplicateCandidate } from "@modules/hospital-admin/api";

function confidenceColor(confidence: number) {
  if (confidence >= 90) return "var(--pulse-coral)";
  if (confidence >= 70) return "var(--caution-amber)";
  return "var(--signal-indigo)";
}

export function MpiDuplicateReview() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<DuplicateCandidate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getDuplicateQueue().then((q) => {
      setQueue(q);
      setLoaded(true);
    });
  }, []);

  const avgConfidence = queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + q.matchConfidence, 0) / queue.length) : 0;
  const highConfidence = queue.filter((q) => q.matchConfidence >= 90).length;

  return (
    <HospitalAdminLayout active="Patients">
      <button
        type="button"
        onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.PATIENTS)}
        className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-signal-indigo transition-colors mb-2"
      >
        <ArrowLeft size={14} /> Back to Patient Directory
      </button>

      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
        <span>Patients</span>
        <span>›</span>
        <span className="text-signal-indigo font-medium">Duplicate Review</span>
      </div>
      <h1 className="text-2xl font-bold text-on-surface mb-1">Duplicate Patient Review</h1>
      <p className="text-sm text-on-surface-variant mb-2">
        Records flagged by the Master Patient Index as possible matches. Never auto-merged — every pair needs a human decision.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
        <KPICard label="Pending Pairs" value={queue.length} icon={<Copy size={14} />} accentColor="var(--sunset-coral)" />
        <KPICard label="High Confidence (≥90%)" value={highConfidence} icon={<Sparkles size={14} />} accentColor="var(--pulse-coral)" />
        <KPICard label="Avg. Match Confidence" value={avgConfidence} unit="%" icon={<ShieldCheck size={14} />} accentColor="var(--signal-indigo)" />
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {queue.map((pair) => {
          const color = confidenceColor(pair.matchConfidence);
          return (
            <Card
              key={pair.patientA.id}
              hero
              accentColor={color}
              className="cursor-pointer"
              onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.MPI_REVIEW_PAIR(pair.patientA.id))}
            >
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface truncate">{getPatientFullName(pair.patientA.name)}</p>
                    <p className="text-xs text-on-surface-variant font-mono truncate">
                      {api.getIdentifier(pair.patientA.identifiers, "mrn")?.value ?? "—"}
                    </p>
                  </div>
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
                  >
                    <ArrowRight size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface truncate">{getPatientFullName(pair.patientB.name)}</p>
                    <p className="text-xs text-on-surface-variant font-mono truncate">
                      {api.getIdentifier(pair.patientB.identifiers, "mrn")?.value ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-shrink-0">
                  <CalendarDays size={13} /> DOB {pair.patientA.dob}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">Match Confidence</p>
                    <p className="font-mono font-bold text-lg leading-none" style={{ color }}>
                      {pair.matchConfidence}%
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
                  >
                    Review
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-1.5">
                {pair.matchedFields.map((f) => (
                  <span
                    key={f}
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}

        {loaded && queue.length === 0 && (
          <Card hero className="flex flex-col items-center text-center py-12">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vital-green/10 text-vital-green mb-3">
              <ShieldCheck size={22} />
            </span>
            <p className="font-bold text-on-surface">No duplicates pending review</p>
            <p className="text-sm text-on-surface-variant mt-1">The Master Patient Index hasn't flagged any possible matches.</p>
          </Card>
        )}
      </div>
    </HospitalAdminLayout>
  );
}
