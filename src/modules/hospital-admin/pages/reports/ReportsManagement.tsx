import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ReportsOverviewPanel } from "@modules/hospital-admin/components/reports/ReportsOverviewPanel";
import { HospitalCensusPanel } from "@modules/hospital-admin/components/reports/HospitalCensusPanel";
import { PatientVolumePanel } from "@modules/hospital-admin/components/reports/PatientVolumePanel";
import { OpdReportPanel } from "@modules/hospital-admin/components/reports/OpdReportPanel";
import { AdmissionsDischargesPanel } from "@modules/hospital-admin/components/reports/AdmissionsDischargesPanel";
import { ReportsBillingPanel } from "@modules/hospital-admin/components/reports/ReportsBillingPanel";
import { HospitalAuditPanel } from "@modules/hospital-admin/components/reports/HospitalAuditPanel";
import { EmergencyReportsPanel } from "@modules/hospital-admin/components/emergency/EmergencyReportsPanel";
import { OccupancyAnalytics } from "@modules/hospital-admin/components/beds/OccupancyAnalytics";
import { LabAnalyticsPanel } from "@modules/hospital-admin/components/laboratory/LabAnalyticsPanel";
import { RadiologyAnalyticsPanel } from "@modules/hospital-admin/components/radiology/RadiologyAnalyticsPanel";
import { PharmacyReportsPanel } from "@modules/hospital-admin/components/pharmacy/PharmacyReportsPanel";
import { OTReportsPanel } from "@modules/hospital-admin/components/ot/OTReportsPanel";
import * as api from "@modules/hospital-admin/api";
import type { ReportsOverviewData, HospitalCensusData, PatientVolumePoint, OpdReportData, AdmissionsDischargesData, HospitalAuditRow, BillingRevenueByDepartment } from "@modules/hospital-admin/api";

type Tab = "overview" | "census" | "volume" | "opd" | "emergency" | "admissions" | "beds" | "laboratory" | "radiology" | "pharmacy" | "ot" | "billing" | "audit";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  overview: { label: "Overview", title: "Reports & Analytics", subtitle: "The overall hospital picture, right now — every number computed from real records." },
  census: { label: "Census", title: "Hospital Census", subtitle: "How many patients are currently in the hospital, by care area." },
  volume: { label: "Patient Volume", title: "Patient Volume", subtitle: "Registration, OPD, and Emergency activity over time." },
  opd: { label: "OPD", title: "OPD Reports", subtitle: "Visits, new vs. follow-up, department breakdown, no-show/cancellation." },
  emergency: { label: "Emergency", title: "Emergency Reports", subtitle: "Connects to the Emergency Department module's own real reporting." },
  admissions: { label: "Admissions & Discharges", title: "Admissions & Discharges", subtitle: "Real bed-audit admission/discharge/transfer events." },
  beds: { label: "Bed Occupancy", title: "Bed Occupancy", subtitle: "Connects to Bed Management's own real occupancy analytics." },
  laboratory: { label: "Laboratory", title: "Laboratory Reports", subtitle: "Connects to the Laboratory module's own real analytics." },
  radiology: { label: "Radiology", title: "Radiology Reports", subtitle: "Connects to the Radiology module's own real analytics." },
  pharmacy: { label: "Pharmacy", title: "Pharmacy Reports", subtitle: "Connects to the Pharmacy module's own real reports." },
  ot: { label: "OT / Surgery", title: "OT / Surgery Reports", subtitle: "Connects to the Operation Theatre module's own real reports." },
  billing: { label: "Billing", title: "Billing Reports", subtitle: "Revenue, receivables, aging, and revenue by department." },
  audit: { label: "Audit", title: "Audit Reports", subtitle: "Every module's own real audit log, merged into one hospital-wide timeline." },
};

/**
 * Reports & Analytics — MVP scope per the user's own explicit instruction
 * (~13 highest-value reports out of the full 65-section spec). This module
 * is deliberately a thin READ-ONLY layer: "Overview," "Census," "Patient
 * Volume," "OPD," "Admissions & Discharges," "Billing," and "Audit" are new
 * cross-module rollups computed in api/reports.ts; "Emergency," "Bed
 * Occupancy," "Laboratory," "Radiology," "Pharmacy," and "OT/Surgery" reuse
 * each module's own real dashboard/analytics component and data directly —
 * never a duplicate reporting system, per the spec's own "Operational
 * Systems -> Data -> Reporting Layer -> Reports" architecture note.
 */
export function ReportsManagement() {
  const [tab, setTab] = useState<Tab>("overview");

  const [overview, setOverview] = useState<ReportsOverviewData | null>(null);
  const [census, setCensus] = useState<HospitalCensusData | null>(null);
  const [volume, setVolume] = useState<PatientVolumePoint[]>([]);
  const [opd, setOpd] = useState<OpdReportData | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionsDischargesData | null>(null);

  const [emergencyReports, setEmergencyReports] = useState<Awaited<ReturnType<typeof api.getEmergencyReports>> | null>(null);
  const [occupancy, setOccupancy] = useState<Awaited<ReturnType<typeof api.getOccupancyAnalytics>> | null>(null);
  const [labAnalytics, setLabAnalytics] = useState<Awaited<ReturnType<typeof api.getLabAnalytics>> | null>(null);
  const [radiologyAnalytics, setRadiologyAnalytics] = useState<Awaited<ReturnType<typeof api.getRadiologyAnalytics>> | null>(null);
  const [pharmacyReports, setPharmacyReports] = useState<Awaited<ReturnType<typeof api.getPharmacyReports>> | null>(null);
  const [otReports, setOtReports] = useState<Awaited<ReturnType<typeof api.getOTReports>> | null>(null);

  const [billingDashboard, setBillingDashboard] = useState<Awaited<ReturnType<typeof api.getBillingDashboard>> | null>(null);
  const [revenueByDepartment, setRevenueByDepartment] = useState<BillingRevenueByDepartment[]>([]);

  const [auditLog, setAuditLog] = useState<HospitalAuditRow[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditModuleFilter, setAuditModuleFilter] = useState<string | "all">("all");

  useEffect(() => {
    api.getReportsOverview().then(setOverview);
    api.getHospitalCensus().then(setCensus);
    setVolume(api.getPatientVolumeTrend());
    setOpd(api.getOpdReport());
    api.getAdmissionsDischargesReport().then(setAdmissions);
    api.getEmergencyReports().then(setEmergencyReports);
    api.getOccupancyAnalytics().then(setOccupancy);
    api.getLabAnalytics().then(setLabAnalytics);
    api.getRadiologyAnalytics().then(setRadiologyAnalytics);
    api.getPharmacyReports().then(setPharmacyReports);
    api.getOTReports().then(setOtReports);
    api.getBillingDashboard().then(setBillingDashboard);
    api.getRevenueByDepartment().then(setRevenueByDepartment);
  }, []);

  useEffect(() => {
    api.getHospitalAuditLog({ module: auditModuleFilter === "all" ? undefined : auditModuleFilter, search: auditSearch }).then(setAuditLog);
  }, [auditSearch, auditModuleFilter]);

  return (
    <HospitalAdminLayout active="Reports">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--signal-indigo) 14%, transparent)", color: "var(--signal-indigo)" }}>
          <BarChart3 size={18} />
        </span>
        <h1 className="font-display font-bold text-2xl text-on-surface">{tabMeta[tab].title}</h1>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">{tabMeta[tab].subtitle}</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(tabMeta) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low bg-white border border-line"
            }`}
          >
            {tabMeta[t].label}
          </button>
        ))}
      </div>

      {tab === "overview" && <ReportsOverviewPanel data={overview} />}
      {tab === "census" && <HospitalCensusPanel data={census} />}
      {tab === "volume" && <PatientVolumePanel points={volume} />}
      {tab === "opd" && <OpdReportPanel data={opd} />}
      {tab === "emergency" && <EmergencyReportsPanel data={emergencyReports} />}
      {tab === "admissions" && <AdmissionsDischargesPanel data={admissions} />}
      {tab === "beds" && occupancy && <OccupancyAnalytics overallOccupancyRate={occupancy.overallOccupancyRate} byWard={occupancy.byWard} byBedType={occupancy.byBedType} genderAvailability={occupancy.genderAvailability} />}
      {tab === "laboratory" && labAnalytics && <LabAnalyticsPanel data={labAnalytics} />}
      {tab === "radiology" && <RadiologyAnalyticsPanel data={radiologyAnalytics} />}
      {tab === "pharmacy" && <PharmacyReportsPanel data={pharmacyReports} />}
      {tab === "ot" && <OTReportsPanel data={otReports} />}
      {tab === "billing" && <ReportsBillingPanel dashboard={billingDashboard} revenueByDepartment={revenueByDepartment} />}
      {tab === "audit" && (
        <HospitalAuditPanel entries={auditLog} search={auditSearch} onSearchChange={setAuditSearch} moduleFilter={auditModuleFilter} onModuleFilterChange={setAuditModuleFilter} modules={api.getReportModules()} />
      )}
    </HospitalAdminLayout>
  );
}
