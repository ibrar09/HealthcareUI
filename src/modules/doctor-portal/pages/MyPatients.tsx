import { useEffect, useMemo, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { PatientRosterFilters, type RosterFilterChip } from "@modules/doctor-portal/components/PatientRosterFilters";
import { PatientRosterList } from "@modules/doctor-portal/components/PatientRosterList";
import * as api from "@modules/doctor-portal/api";
import type { PatientRosterCategory, RosterPatient } from "@modules/doctor-portal/api";

const CHIP_LABELS: { key: PatientRosterCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "follow-up-due", label: "Follow-Up Due" },
  { key: "ipd", label: "IPD" },
  { key: "emergency", label: "Emergency" },
  { key: "chronic-care", label: "Chronic Care" },
  { key: "high-risk", label: "High-Risk" },
];

export function MyPatients() {
  const [roster, setRoster] = useState<RosterPatient[]>([]);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<PatientRosterCategory | "all">("all");

  useEffect(() => {
    api.getPatientRoster().then(setRoster);
  }, []);

  const chips: RosterFilterChip[] = useMemo(
    () =>
      CHIP_LABELS.map(({ key, label }) => ({
        key,
        label,
        count: key === "all" ? roster.length : roster.filter((p) => p.categories.includes(key)).length,
      })),
    [roster]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roster.filter((p) => {
      if (activeChip !== "all" && !p.categories.includes(activeChip)) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.phone.toLowerCase().includes(query) ||
        p.dob.toLowerCase().includes(query) ||
        p.conditions.some((c) => c.toLowerCase().includes(query))
      );
    });
  }, [roster, search, activeChip]);

  return (
    <DoctorLayout active="Patients">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">My Patients</h1>
        <p className="text-xs text-slate-500 mt-0.5">{roster.length} patients under your care.</p>
      </div>

      <PatientRosterFilters
        search={search}
        onSearchChange={setSearch}
        chips={chips}
        activeChip={activeChip}
        onChipChange={setActiveChip}
      />

      <PatientRosterList patients={filtered} />
    </DoctorLayout>
  );
}
