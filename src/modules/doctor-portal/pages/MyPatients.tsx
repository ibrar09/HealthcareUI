import { useEffect, useMemo, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { PatientListSummary } from "@modules/doctor-portal/components/PatientListSummary";
import { NeedsMyAttentionPanel, type AttentionFilterKey } from "@modules/doctor-portal/components/NeedsMyAttentionPanel";
import { PatientListControls, type SmartViewChip } from "@modules/doctor-portal/components/PatientListControls";
import { PatientFiltersPanel, EMPTY_FILTERS, type PatientListFilters } from "@modules/doctor-portal/components/PatientFiltersPanel";
import { PatientColumnsMenu, DEFAULT_COLUMNS, type ColumnKey } from "@modules/doctor-portal/components/PatientColumnsMenu";
import { PatientRosterList } from "@modules/doctor-portal/components/PatientRosterList";
import { PatientListCards } from "@modules/doctor-portal/components/PatientListCards";
import * as api from "@modules/doctor-portal/api";
import type { RosterPatient, SmartViewKey } from "@modules/doctor-portal/api";

const CHIP_LABELS: { key: SmartViewKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "active", label: "Active" },
  { key: "opd", label: "OPD" },
  { key: "ipd", label: "IPD" },
  { key: "emergency", label: "Emergency" },
  { key: "critical", label: "Critical" },
  { key: "follow-up", label: "Follow-up" },
  { key: "pending-results", label: "Pending Results" },
];

function matchesSmartView(p: RosterPatient, key: SmartViewKey): boolean {
  switch (key) {
    case "all": return true;
    case "today": return p.lastVisit.startsWith("Today");
    case "active": return p.encounterActive;
    case "opd": return p.encounterType === "OPD";
    case "ipd": return p.encounterType === "IPD";
    case "emergency": return p.encounterType === "Emergency";
    case "critical": return p.clinicalStatus === "Critical";
    case "follow-up": return p.clinicalStatus === "Follow-up";
    case "pending-results": return p.pending.length > 0;
  }
}

function matchesClinicalFilter(p: RosterPatient, label: string): boolean {
  switch (label) {
    case "Diabetes": return p.conditions.some((c) => c.toLowerCase().includes("diabetes"));
    case "Hypertension": return p.conditions.some((c) => c.toLowerCase().includes("hypertens"));
    case "Heart Disease": return p.conditions.some((c) => /cardiac|coronary|heart/i.test(c));
    case "High Risk": return p.clinicalStatus === "High Risk";
    case "Allergy": return p.allergies.length > 0;
    case "Critical Result": return p.recentResults.some((r) => r.flag === "critical");
    default: return false;
  }
}

function matchesAttentionFilter(p: RosterPatient, key: AttentionFilterKey): boolean {
  switch (key) {
    case "critical-results": return p.recentResults.some((r) => r.flag === "critical");
    case "abnormal-results": return p.recentResults.some((r) => r.flag === "abnormal");
    case "follow-ups": return p.clinicalStatus === "Follow-up";
    case "referrals": return p.pending.some((i) => i.label.toLowerCase().includes("referral"));
    case "notes-signature": return p.pending.some((i) => i.label.toLowerCase().includes("signature"));
    case "external-records": return Boolean(p.externalRecords);
  }
}

export function MyPatients() {
  const [roster, setRoster] = useState<RosterPatient[]>([]);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<SmartViewKey>("all");
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilterKey | null>(null);
  const [filters, setFilters] = useState<PatientListFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>(DEFAULT_COLUMNS);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [groupBy, setGroupBy] = useState<"none" | "department" | "location">("none");

  useEffect(() => {
    api.getPatientRoster().then(setRoster);
  }, []);

  const departmentOptions = useMemo(() => Array.from(new Set(roster.map((p) => p.department))).sort(), [roster]);

  const chips: SmartViewChip[] = useMemo(
    () => CHIP_LABELS.map(({ key, label }) => ({ key, label, count: roster.filter((p) => matchesSmartView(p, key)).length })),
    [roster]
  );

  const filtersActive = Object.values(filters).some((arr) => arr.length > 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roster.filter((p) => {
      if (!matchesSmartView(p, activeChip)) return false;
      if (attentionFilter && !matchesAttentionFilter(p, attentionFilter)) return false;

      if (filters.encounterTypes.length > 0 && !filters.encounterTypes.includes(p.encounterType)) return false;
      if (filters.statuses.length > 0) {
        const statusMatch = filters.statuses.some((s) => (s === "Active" ? p.encounterActive : s === "Discharged" ? !p.encounterActive : p.clinicalStatus === s));
        if (!statusMatch) return false;
      }
      if (filters.departments.length > 0 && !filters.departments.includes(p.department)) return false;
      if (filters.locationTypes.length > 0 && !filters.locationTypes.includes(p.locationType)) return false;
      if (filters.clinical.length > 0 && !filters.clinical.some((c) => matchesClinicalFilter(p, c))) return false;

      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.patientIdCode.toLowerCase().includes(query) ||
        (p.encounterNumber?.toLowerCase().includes(query) ?? false) ||
        p.phone.toLowerCase().includes(query) ||
        p.dob.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query) ||
        p.conditions.some((c) => c.toLowerCase().includes(query))
      );
    });
  }, [roster, search, activeChip, attentionFilter, filters]);

  return (
    <DoctorLayout active="Patients">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">My Patients</h1>
      </div>

      <PatientListSummary patients={roster} />

      <NeedsMyAttentionPanel
        patients={roster}
        activeFilter={attentionFilter}
        onSelect={(key) => setAttentionFilter((prev) => (prev === key ? null : key))}
      />

      <PatientListControls
        search={search}
        onSearchChange={setSearch}
        chips={chips}
        activeChip={activeChip}
        onChipChange={setActiveChip}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersActive}
        onToggleColumns={() => setColumnsOpen((v) => !v)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      {filtersOpen && (
        <PatientFiltersPanel filters={filters} onChange={setFilters} departmentOptions={departmentOptions} onClear={() => setFilters(EMPTY_FILTERS)} />
      )}
      {columnsOpen && <PatientColumnsMenu columns={columns} onChange={setColumns} />}

      {viewMode === "table" ? (
        <PatientRosterList patients={filtered} columns={columns} groupBy={groupBy} />
      ) : (
        <PatientListCards patients={filtered} groupBy={groupBy} />
      )}
    </DoctorLayout>
  );
}
