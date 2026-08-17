import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Search, UserPlus, Users } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { KPICard } from "@shared/design-system/components";
import { PatientRow } from "@modules/hospital-admin/components/patients/PatientRow";
import { PatientFormDrawer, PatientFormValues } from "@modules/hospital-admin/components/patients/PatientFormDrawer";
import * as api from "@modules/hospital-admin/api";
import { getIdentifier, getPatientFullName } from "@modules/hospital-admin/api";
import type { PatientStatus } from "@modules/hospital-admin/api";

type StatusFilter = "all" | PatientStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "discharged", label: "Discharged" },
  { value: "pending-verification", label: "Pending Verification" },
  { value: "flagged", label: "Flagged" },
];

const PAGE_SIZE = 8;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function PatientAdministration() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<api.PatientPage | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.getPatientStats>> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [facilities, setFacilities] = useState<Awaited<ReturnType<typeof api.getFacilities>>>([]);

  useEffect(() => {
    api.getPatients({ page, pageSize: PAGE_SIZE, search, status }).then(setPageData);
  }, [page, search, status]);

  useEffect(() => {
    api.getPatientStats().then(setStats);
    api.getFacilities().then(setFacilities);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  async function handleSubmit(values: PatientFormValues) {
    await api.createPatient(values);
    setSearch("");
    setStatus("pending-verification");
    setPage(1);
    api.getPatientStats().then(setStats);
  }

  const totalPages = pageData ? Math.max(1, Math.ceil(pageData.total / PAGE_SIZE)) : 1;

  return (
    <HospitalAdminLayout active="Patients">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Patient Administration</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage and verify hospital registrations.</p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
        >
          <UserPlus size={16} /> New Patient
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
        <KPICard label="Total Patients" value={stats?.total ?? "—"} icon={<Users size={14} />} accentColor="var(--signal-indigo)" />
        <KPICard label="Pending Verification" value={stats?.pendingVerification ?? "—"} icon={<Clock size={14} />} accentColor="var(--caution-amber)" />
        <KPICard label="Flagged" value={stats?.flagged ?? "—"} icon={<AlertTriangle size={14} />} accentColor="var(--pulse-coral)" />
        <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.MPI_REVIEW)} className="text-left w-full">
          <KPICard label="Possible Duplicates" value={stats?.possibleDuplicates ?? "—"} icon={<Search size={14} />} accentColor="var(--sunset-coral)" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, MRN, UHID, phone, DOB, or email..."
            className="w-full bg-white border border-line text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-signal-indigo transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                status === f.value
                  ? "bg-gradient-brand text-white shadow-glow"
                  : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {pageData?.results.map((p) => {
          const fullName = getPatientFullName(p.name);
          return (
            <PatientRow
              key={p.id}
              name={fullName}
              initials={initials(fullName)}
              mrn={getIdentifier(p.identifiers, "mrn")?.value ?? "—"}
              universalHealthId={getIdentifier(p.identifiers, "universal-health-id")?.value ?? "—"}
              organizationName={p.managingOrganizationName}
              dob={p.dob}
              age={api.getPatientAge(p.dob)}
              gender={p.gender === "male" ? "M" : p.gender === "female" ? "F" : p.gender === "other" ? "O" : "U"}
              phone={p.phone}
              lastVisit={p.lastVisit}
              status={p.status}
              possibleDuplicate={Boolean(p.possibleDuplicateOf)}
              onView={() => navigate(ROUTES.HOSPITAL_ADMIN.PATIENT_DETAIL(p.id))}
            />
          );
        })}
        {pageData && pageData.results.length === 0 && (
          <p className="text-center text-sm text-on-surface-variant py-12">No patients match your search.</p>
        )}
      </div>

      {pageData && pageData.total > 0 && (
        <div className="flex items-center justify-between mt-6 pb-8">
          <p className="text-xs text-on-surface-variant">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pageData.total)} of {pageData.total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                  p === page ? "bg-gradient-brand text-white shadow-glow" : "border border-line bg-white text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <PatientFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        facilityOptions={facilities.map((f) => ({ id: f.id, name: f.name }))}
      />
    </HospitalAdminLayout>
  );
}
