import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, GitMerge, ShieldAlert, UserCheck, XCircle } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { Card } from "@shared/design-system/components";
import * as api from "@modules/hospital-admin/api";
import { getIdentifier, getPatientFullName } from "@modules/hospital-admin/api";
import type { DuplicateCandidate, Patient } from "@modules/hospital-admin/api";

function confidenceColor(confidence: number) {
  if (confidence >= 90) return "var(--pulse-coral)";
  if (confidence >= 70) return "var(--caution-amber)";
  return "var(--signal-indigo)";
}

interface FieldRow {
  label: string;
  a: string;
  b: string;
}

function buildFields(a: Patient, b: Patient): FieldRow[] {
  const genderLabel = (g: Patient["gender"]) => (g === "male" ? "Male" : g === "female" ? "Female" : g === "other" ? "Other" : "Unknown");
  return [
    { label: "Full Name", a: getPatientFullName(a.name), b: getPatientFullName(b.name) },
    { label: "Date of Birth", a: a.dob, b: b.dob },
    { label: "Gender", a: genderLabel(a.gender), b: genderLabel(b.gender) },
    { label: "Phone", a: a.phone, b: b.phone },
    { label: "Email", a: a.email, b: b.email },
    { label: "Address", a: a.address, b: b.address },
    { label: "MRN", a: getIdentifier(a.identifiers, "mrn")?.value ?? "—", b: getIdentifier(b.identifiers, "mrn")?.value ?? "—" },
    {
      label: "Universal Health ID",
      a: getIdentifier(a.identifiers, "universal-health-id")?.value ?? "—",
      b: getIdentifier(b.identifiers, "universal-health-id")?.value ?? "—",
    },
    { label: "Insurance Provider", a: a.insuranceProvider || "—", b: b.insuranceProvider || "—" },
    { label: "Insurance Policy #", a: a.insurancePolicyNumber || "—", b: b.insurancePolicyNumber || "—" },
    { label: "Registered On", a: a.registeredOn, b: b.registeredOn },
  ];
}

export function MpiPairReview() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [pair, setPair] = useState<DuplicateCandidate | null>(null);
  const [keepId, setKeepId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    api.getDuplicatePair(patientId).then((p) => {
      if (!p) {
        setNotFound(true);
        return;
      }
      setPair(p);
      setKeepId(p.patientA.id);
    });
  }, [patientId]);

  if (notFound) {
    return (
      <HospitalAdminLayout active="Patients">
        <p className="text-sm text-on-surface-variant">This duplicate pair has already been resolved.</p>
      </HospitalAdminLayout>
    );
  }

  if (!pair || !keepId) {
    return (
      <HospitalAdminLayout active="Patients">
        <p className="text-sm text-on-surface-variant">Loading…</p>
      </HospitalAdminLayout>
    );
  }

  const { patientA, patientB, matchConfidence, matchedFields } = pair;
  const fields = buildFields(patientA, patientB);
  const color = confidenceColor(matchConfidence);
  const mergeId = keepId === patientA.id ? patientB.id : patientA.id;

  async function handleMerge() {
    if (!keepId) return;
    await api.mergePatients(keepId, mergeId);
    navigate(ROUTES.HOSPITAL_ADMIN.MPI_REVIEW);
  }

  async function handleDismiss() {
    await api.dismissDuplicate(patientA.id, patientB.id);
    navigate(ROUTES.HOSPITAL_ADMIN.MPI_REVIEW);
  }

  return (
    <HospitalAdminLayout active="Patients">
      <button
        type="button"
        onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.MPI_REVIEW)}
        className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-signal-indigo transition-colors mb-2"
      >
        <ArrowLeft size={14} /> Back to Duplicate Review
      </button>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Compare & Resolve</h1>
          <p className="text-sm text-on-surface-variant mt-1">Choose which record to keep, then merge — or confirm these are different people.</p>
        </div>
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <ShieldAlert size={16} style={{ color }} />
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color }}>
              Match Confidence
            </p>
            <p className="font-mono font-bold text-lg leading-none" style={{ color }}>
              {matchConfidence}%
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="text-xs text-on-surface-variant mr-1">Matched on:</span>
        {matchedFields.map((f) => (
          <span
            key={f}
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
          >
            {f}
          </span>
        ))}
      </div>

      <Card hero className="mb-6">
        <div className="grid grid-cols-[minmax(0,1fr)_140px_140px] gap-x-4">
          <div />
          {[patientA, patientB].map((p) => {
            const selected = keepId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setKeepId(p.id)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-center transition-all ${
                  selected ? "border-vital-green bg-vital-green/[0.06]" : "border-line hover:bg-surface-container-low"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${selected ? "bg-vital-green" : "bg-outline-variant"}`}
                >
                  {selected ? <Check size={13} /> : <UserCheck size={13} />}
                </span>
                <span className="text-xs font-bold text-on-surface truncate w-full">{getPatientFullName(p.name)}</span>
                <span className="text-[10px] text-on-surface-variant">{selected ? "Keep this record" : "Select to keep"}</span>
              </button>
            );
          })}

          {fields.map((row) => {
            const matches = row.a.toLowerCase() === row.b.toLowerCase();
            return (
              <FieldRowView key={row.label} row={row} matches={matches} />
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={handleDismiss}
          className="flex items-center gap-1.5 border border-line bg-white text-on-surface text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-all"
        >
          <XCircle size={16} /> Not a Duplicate
        </button>
        <button
          type="button"
          onClick={handleMerge}
          className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
        >
          <GitMerge size={16} /> Merge into {getPatientFullName(keepId === patientA.id ? patientA.name : patientB.name)}
        </button>
      </div>
    </HospitalAdminLayout>
  );
}

function FieldRowView({ row, matches }: { row: FieldRow; matches: boolean }) {
  return (
    <>
      <div className="flex items-center border-t border-line py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
        {row.label}
      </div>
      {[row.a, row.b].map((value, i) => (
        <div
          key={i}
          className={`flex items-center justify-center border-t border-line py-3 px-2 text-center text-sm font-medium rounded-md ${
            matches ? "text-vital-green bg-vital-green/[0.06]" : "text-on-surface"
          }`}
        >
          <span className="truncate">{value}</span>
        </div>
      ))}
    </>
  );
}
