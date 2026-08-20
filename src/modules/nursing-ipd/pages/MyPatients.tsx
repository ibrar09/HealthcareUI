import { useEffect, useMemo, useState } from "react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { PatientListFilters, type QuickFilterKey, type QuickFilterChip } from "@modules/nursing-ipd/components/PatientListFilters";
import { PatientFiltersDrawer, EMPTY_FILTERS, type PatientListFilters as DrawerFilters } from "@modules/nursing-ipd/components/PatientFiltersDrawer";
import { NursePatientList } from "@modules/nursing-ipd/components/NursePatientList";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient } from "@modules/nursing-ipd/api";

const CHIP_LABELS: { key: QuickFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "medication-due", label: "Medication Due" },
  { key: "assessment-due", label: "Assessment Due" },
  { key: "discharge-pending", label: "Discharge Pending" },
];

function matchesQuickFilter(p: NursePatient, key: QuickFilterKey): boolean {
  switch (key) {
    case "all": return true;
    case "critical": return p.acuity === "Critical";
    case "medication-due": return Boolean(p.nextMedication);
    case "assessment-due": return p.assessmentDue;
    case "discharge-pending": return Boolean(p.dischargePending);
  }
}

export function MyPatients() {
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<QuickFilterKey>("all");
  const [drawerFilters, setDrawerFilters] = useState<DrawerFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api.getMyPatients().then(setPatients);
  }, []);

  const roomOptions = useMemo(() => Array.from(new Set(patients.map((p) => p.room))).sort(), [patients]);

  const chips: QuickFilterChip[] = useMemo(
    () => CHIP_LABELS.map(({ key, label }) => ({ key, label, count: patients.filter((p) => matchesQuickFilter(p, key)).length })),
    [patients]
  );

  const filtersActive = drawerFilters.rooms.length > 0 || drawerFilters.fallRisk.length > 0 || drawerFilters.isolationOnly;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return patients.filter((p) => {
      if (!matchesQuickFilter(p, activeChip)) return false;
      if (drawerFilters.rooms.length > 0 && !drawerFilters.rooms.includes(p.room)) return false;
      if (drawerFilters.fallRisk.length > 0 && !drawerFilters.fallRisk.includes(p.fallRisk)) return false;
      if (drawerFilters.isolationOnly && !p.isolation) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.room.toLowerCase().includes(query) ||
        p.bed.toLowerCase().includes(query) ||
        p.diagnosis.toLowerCase().includes(query)
      );
    });
  }, [patients, search, activeChip, drawerFilters]);

  return (
    <NurseLayout active="My Patients">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">My Patients</h1>
        <p className="text-xs text-slate-500 mt-0.5">{patients.length} patients assigned to you this shift.</p>
      </div>

      <PatientListFilters
        search={search}
        onSearchChange={setSearch}
        chips={chips}
        activeChip={activeChip}
        onChipChange={setActiveChip}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersActive}
      />

      {filtersOpen && (
        <PatientFiltersDrawer filters={drawerFilters} onChange={setDrawerFilters} roomOptions={roomOptions} onClear={() => setDrawerFilters(EMPTY_FILTERS)} />
      )}

      <NursePatientList patients={filtered} />
    </NurseLayout>
  );
}
