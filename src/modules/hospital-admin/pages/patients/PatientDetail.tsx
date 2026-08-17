import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, BadgeCheck, Building2, Mail, MapPin, Pencil, Phone, ShieldCheck, Stethoscope, UserCircle2 } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { Card, StatusChip, StatusTone } from "@shared/design-system/components";
import { PatientFormDrawer, PatientFormValues } from "@modules/hospital-admin/components/patients/PatientFormDrawer";
import * as api from "@modules/hospital-admin/api";
import { getIdentifier, getPatientFullName } from "@modules/hospital-admin/api";
import type { IdentifierType, MaritalStatus, Patient, PatientStatus } from "@modules/hospital-admin/api";

const maritalStatusLabel: Record<MaritalStatus, string> = {
  single: "Single",
  married: "Married",
  divorced: "Divorced",
  widowed: "Widowed",
  unknown: "Unknown",
};

const statusTone: Record<PatientStatus, StatusTone> = {
  active: "success",
  discharged: "neutral",
  "pending-verification": "warning",
  flagged: "critical",
  merged: "neutral",
};

const statusLabel: Record<PatientStatus, string> = {
  active: "Active",
  discharged: "Discharged",
  "pending-verification": "Pending Verification",
  flagged: "Flagged",
  merged: "Merged",
};

const identifierLabel: Record<IdentifierType, string> = {
  mrn: "Medical Record Number",
  "universal-health-id": "Universal Health ID",
  "national-id": "National ID",
  passport: "Passport",
  "insurance-id": "Insurance ID",
  "external-org-id": "External Org ID",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [duplicateOf, setDuplicateOf] = useState<Patient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [facilities, setFacilities] = useState<Awaited<ReturnType<typeof api.getFacilities>>>([]);

  useEffect(() => {
    if (!patientId) return;
    api.getPatient(patientId).then(setPatient);
  }, [patientId]);

  useEffect(() => {
    api.getFacilities().then(setFacilities);
  }, []);

  useEffect(() => {
    if (patient?.possibleDuplicateOf) {
      api.getPatient(patient.possibleDuplicateOf).then(setDuplicateOf);
    } else {
      setDuplicateOf(null);
    }
  }, [patient?.possibleDuplicateOf]);

  if (!patient) {
    return (
      <HospitalAdminLayout active="Patients">
        <p className="text-sm text-on-surface-variant">Patient not found.</p>
      </HospitalAdminLayout>
    );
  }

  async function handleSubmit(values: PatientFormValues) {
    if (!patient) return;
    const identifiers = patient.identifiers.filter((identifier) => identifier.type !== "national-id");
    if (values.nationalId) {
      identifiers.push({
        type: "national-id",
        value: values.nationalId,
        issuer: "NADRA",
        status: "active",
        verified: true,
        period: { start: patient.registeredOn },
      });
    }
    const updated = await api.updatePatient(patient.id, {
      name: { given: values.givenName, family: values.familyName },
      preferredName: values.preferredName,
      dob: values.dob,
      gender: values.gender,
      maritalStatus: values.maritalStatus,
      identifiers,
      managingOrganizationId: values.managingOrganizationId,
      phone: values.phone,
      email: values.email,
      address: values.address,
      communicationPreference: values.communicationPreference,
      insuranceProvider: values.insuranceProvider,
      insurancePolicyNumber: values.insurancePolicyNumber,
      emergencyContactName: values.emergencyContactName,
      emergencyContactRelationship: values.emergencyContactRelationship,
      emergencyContactPhone: values.emergencyContactPhone,
      emergencyContactAddress: values.emergencyContactAddress,
    });
    setPatient(updated);
  }

  const managingOrganizationName = facilities.find((f) => f.id === patient.managingOrganizationId)?.name ?? "Unknown facility";

  const fullName = getPatientFullName(patient.name);
  const duplicateFullName = duplicateOf ? getPatientFullName(duplicateOf.name) : "another patient";
  const duplicateMrn = duplicateOf ? getIdentifier(duplicateOf.identifiers, "mrn")?.value : undefined;

  return (
    <HospitalAdminLayout active="Patients">
      <button
        type="button"
        onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.PATIENTS)}
        className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-signal-indigo transition-colors mb-2"
      >
        <ArrowLeft size={14} /> Back to Patient Administration
      </button>

      {patient.possibleDuplicateOf && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-pulse-coral/50 bg-pulse-coral/[0.06] px-5 py-4 mb-2">
          <AlertTriangle size={20} className="text-pulse-coral flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-pulse-coral">Possible duplicate record</p>
            <p className="text-xs text-on-surface-variant">
              This record may match {duplicateFullName} {duplicateMrn ? `(${duplicateMrn})` : ""} — same date of birth and contact
              details. Review before merging.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.MPI_REVIEW_PAIR(patient.id))}
            className="flex-shrink-0 bg-pulse-coral text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Review
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hero className="lg:col-span-1 flex flex-col items-center text-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold border-2 mb-4"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, var(--signal-indigo) 18%, white), color-mix(in srgb, var(--signal-indigo) 8%, white))",
              color: "var(--signal-indigo)",
              borderColor: "color-mix(in srgb, var(--signal-indigo) 35%, transparent)",
            }}
          >
            {initials(fullName)}
          </span>
          <h1 className="text-xl font-bold text-on-surface">{fullName}</h1>
          {patient.preferredName && <p className="text-xs text-on-surface-variant italic">"{patient.preferredName}"</p>}
          <p className="text-sm text-on-surface-variant mb-1">
            {api.getPatientAge(patient.dob)} yrs ({patient.dob}) ·{" "}
            {patient.gender === "male" ? "Male" : patient.gender === "female" ? "Female" : patient.gender === "other" ? "Other" : "Unknown"}
          </p>
          <p className="text-xs text-on-surface-variant mb-3">{maritalStatusLabel[patient.maritalStatus]}</p>
          <StatusChip tone={statusTone[patient.status]}>{statusLabel[patient.status]}</StatusChip>

          <div className="w-full mt-6 pt-5 border-t border-line flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <Building2 size={14} className="text-on-surface-variant flex-shrink-0" />
              <span className="truncate">{managingOrganizationName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <Mail size={14} className="text-on-surface-variant flex-shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <Phone size={14} className="text-on-surface-variant flex-shrink-0" />
              {patient.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <MapPin size={14} className="text-on-surface-variant flex-shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
              <span>Registered</span>
              <span className="font-semibold text-on-surface">{patient.registeredOn}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mt-6 w-full flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-semibold text-signal-indigo hover:bg-signal-indigo-tint transition-colors"
          >
            <Pencil size={14} /> Edit Patient
          </button>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card hero>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <BadgeCheck size={18} className="text-signal-indigo" /> Patient Identifiers
            </h2>
            <div className="flex flex-col gap-3">
              {patient.identifiers.map((identifier) => (
                <div
                  key={identifier.type}
                  className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">
                      {identifierLabel[identifier.type]} · {identifier.issuer}
                    </p>
                    <p className="font-mono text-sm font-bold text-on-surface truncate">{identifier.value}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Issued {identifier.period.start}
                      {identifier.period.end ? ` · Expires ${identifier.period.end}` : ""}
                    </p>
                  </div>
                  <StatusChip tone={identifier.verified ? "success" : "warning"}>
                    {identifier.verified ? "Verified" : "Unverified"}
                  </StatusChip>
                </div>
              ))}
            </div>
          </Card>

          <Card hero>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-signal-indigo" /> Insurance & Emergency Contact
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Provider</p>
                <p className="text-sm font-semibold text-on-surface mb-3">{patient.insuranceProvider || "—"}</p>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Policy Number</p>
                <p className="font-mono text-sm font-semibold text-on-surface">{patient.insurancePolicyNumber || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1">Emergency Contact</p>
                <p className="text-sm font-semibold text-on-surface">
                  {patient.emergencyContactName || "—"}
                  {patient.emergencyContactName && (
                    <span className="text-on-surface-variant font-normal"> · {patient.emergencyContactRelationship}</span>
                  )}
                </p>
                <p className="text-sm text-on-surface mb-1">{patient.emergencyContactPhone || "—"}</p>
                {patient.emergencyContactAddress && (
                  <p className="text-xs text-on-surface-variant">{patient.emergencyContactAddress}</p>
                )}
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-1 mt-3">Preferred Contact Method</p>
                <p className="text-sm font-semibold text-on-surface capitalize">{patient.communicationPreference}</p>
              </div>
            </div>
          </Card>

          <Card hero>
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <Stethoscope size={18} className="text-signal-indigo" /> Recent Visits
            </h2>
            {patient.visits.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No visit history yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {patient.visits.map((v) => (
                  <div key={v.date + v.department} className="flex items-center gap-4 rounded-xl border border-line px-4 py-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-signal-indigo-tint text-signal-indigo">
                      <UserCircle2 size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {v.reason} · {v.department}
                      </p>
                      <p className="text-xs text-on-surface-variant">{v.provider}</p>
                    </div>
                    <p className="text-xs font-mono text-on-surface-variant flex-shrink-0">{v.date}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <PatientFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        initialValues={{
          givenName: patient.name.given,
          familyName: patient.name.family,
          preferredName: patient.preferredName,
          dob: patient.dob,
          gender: patient.gender,
          maritalStatus: patient.maritalStatus,
          nationalId: getIdentifier(patient.identifiers, "national-id")?.value ?? "",
          managingOrganizationId: patient.managingOrganizationId,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          communicationPreference: patient.communicationPreference,
          insuranceProvider: patient.insuranceProvider,
          insurancePolicyNumber: patient.insurancePolicyNumber,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactRelationship: patient.emergencyContactRelationship,
          emergencyContactPhone: patient.emergencyContactPhone,
          emergencyContactAddress: patient.emergencyContactAddress,
        }}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
      />
    </HospitalAdminLayout>
  );
}
