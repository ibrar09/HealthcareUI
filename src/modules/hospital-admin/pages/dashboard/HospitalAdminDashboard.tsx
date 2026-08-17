import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BedDouble, CalendarDays, Siren, LogIn, LogOut, DollarSign, AlertOctagon,
  UserPlus, CalendarPlus, Boxes, FileBarChart, ShieldAlert, ChevronDown,
} from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { KPICard, Card, RadialGauge } from "@shared/design-system/components";
import { DonutChart } from "@modules/hospital-admin/components/DonutChart";
import { LiveStatusList } from "@modules/hospital-admin/components/dashboard/LiveStatusList";
import * as api from "@modules/hospital-admin/api";

const dateLabel = new Date(`${api.TODAY}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const quickActions = [
  { label: "Register Patient", icon: UserPlus, route: ROUTES.HOSPITAL_ADMIN.PATIENTS },
  { label: "New Appointment", icon: CalendarPlus, route: ROUTES.HOSPITAL_ADMIN.APPOINTMENTS },
  { label: "Admit Patient", icon: BedDouble, route: ROUTES.HOSPITAL_ADMIN.BEDS },
  { label: "Purchase Order", icon: Boxes, route: ROUTES.HOSPITAL_ADMIN.INVENTORY },
  { label: "Critical Alerts", icon: ShieldAlert, route: ROUTES.HOSPITAL_ADMIN.ALERTS },
  { label: "Generate Report", icon: FileBarChart, route: ROUTES.HOSPITAL_ADMIN.REPORTS },
];

const activityBarColor: Record<string, string> = {
  Admissions: "var(--signal-indigo)",
  Discharges: "var(--vital-green)",
  Appointments: "var(--module-radiology)",
  Emergency: "var(--pulse-coral)",
};

export function HospitalAdminDashboard() {
  const navigate = useNavigate();
  const [facilityOptions, setFacilityOptions] = useState<Awaited<ReturnType<typeof api.getFacilityOptions>>>([]);
  const [facilityId, setFacilityId] = useState<string | "all">("all");
  const [kpis, setKpis] = useState<api.AdminOverviewKpis | null>(null);
  const [activity, setActivity] = useState<api.TodaysActivityBreakdown | null>(null);
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof api.getTodaysPatientsByDepartment>>>([]);
  const [liveStatus, setLiveStatus] = useState<api.LiveStatusRow[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Awaited<ReturnType<typeof api.getCriticalAlerts>>>([]);
  const [occupancy, setOccupancy] = useState<Awaited<ReturnType<typeof api.getOccupancyAnalytics>> | null>(null);
  const [bedDashboard, setBedDashboard] = useState<Awaited<ReturnType<typeof api.getBedDashboard>> | null>(null);
  const [otDashboard, setOtDashboard] = useState<Awaited<ReturnType<typeof api.getOTDashboard>> | null>(null);
  const [labDashboard, setLabDashboard] = useState<Awaited<ReturnType<typeof api.getLabDashboard>> | null>(null);
  const [radiologyDashboard, setRadiologyDashboard] = useState<Awaited<ReturnType<typeof api.getRadiologyDashboard>> | null>(null);
  const [pharmacyDashboard, setPharmacyDashboard] = useState<Awaited<ReturnType<typeof api.getPharmacyDashboard>> | null>(null);
  const [billingDashboard, setBillingDashboard] = useState<Awaited<ReturnType<typeof api.getBillingDashboard>> | null>(null);
  const [claimsDashboard, setClaimsDashboard] = useState<Awaited<ReturnType<typeof api.getClaimsDashboard>> | null>(null);
  const [staffStatus, setStaffStatus] = useState<api.StaffStatusRow[]>([]);
  const [appointmentDashboard, setAppointmentDashboard] = useState<Awaited<ReturnType<typeof api.getAppointmentDashboard>> | null>(null);
  const [recentActivity, setRecentActivity] = useState<Awaited<ReturnType<typeof api.getAggregatedModuleAuditLog>>>([]);

  useEffect(() => {
    api.getFacilityOptions().then(setFacilityOptions);
    api.getTodaysPatientsByDepartment().then(setDepartments);
    api.getLiveHospitalStatus().then(setLiveStatus);
    api.getCriticalAlerts().then((rows) => setCriticalAlerts(rows.slice(0, 5)));
    api.getOccupancyAnalytics().then(setOccupancy);
    api.getBedDashboard().then(setBedDashboard);
    api.getOTDashboard().then(setOtDashboard);
    api.getLabDashboard().then(setLabDashboard);
    api.getRadiologyDashboard().then(setRadiologyDashboard);
    api.getPharmacyDashboard().then(setPharmacyDashboard);
    api.getBillingDashboard().then(setBillingDashboard);
    api.getClaimsDashboard().then(setClaimsDashboard);
    api.getStaffStatusSummary().then(setStaffStatus);
    api.getAppointmentDashboard().then(setAppointmentDashboard);
    api.getAggregatedModuleAuditLog().then((rows) => setRecentActivity(rows.slice(0, 6)));
    api.getTodaysActivityBreakdown().then(setActivity);
  }, []);

  useEffect(() => {
    api.getAdminOverviewKpis(facilityId === "all" ? undefined : facilityId).then(setKpis);
  }, [facilityId]);

  const maxActivity = activity ? Math.max(activity.admissions, activity.discharges, activity.appointments, activity.emergencyVisits, 1) : 1;

  return (
    <HospitalAdminLayout active="Admin Dashboard">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">{greeting()}, Admin</h1>
          <p className="text-sm text-on-surface-variant">Hospital Command Center</p>
          <p className="font-mono text-xs text-on-surface-variant/70 mt-1">{dateLabel}</p>
        </div>
        <div className="relative">
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="appearance-none rounded-input border border-line bg-white pl-4 pr-9 py-2.5 text-sm font-semibold text-on-surface outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
          >
            <option value="all">All Facilities</option>
            {facilityOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Total Patients"
            value={kpis.totalPatients}
            icon={<Users size={14} />}
            accentColor="var(--signal-indigo)"
            trendDelta={kpis.newPatientsToday > 0 ? `+${kpis.newPatientsToday} today` : undefined}
          />
          <KPICard label="Bed Occupancy" icon={<BedDouble size={14} />} accentColor="var(--caution-amber)">
            <div className="flex flex-1 items-center gap-3 py-1">
              <RadialGauge percent={kpis.bedOccupancyPercent} color="var(--caution-amber)" size={56} />
              <span className="font-mono text-sm text-on-surface-variant">{kpis.bedsOccupied} / {kpis.bedsTotal}</span>
            </div>
          </KPICard>
          <KPICard
            label="Appointments"
            value={kpis.appointmentsToday}
            icon={<CalendarDays size={14} />}
            accentColor="var(--module-radiology)"
            trendDelta={`${kpis.appointmentsWaiting} waiting`}
          />
          <KPICard
            label="Emergency"
            value={kpis.emergencyActive}
            icon={<Siren size={14} />}
            accentColor={kpis.emergencyCritical > 0 ? "var(--pulse-coral)" : "var(--signal-indigo)"}
            trendDelta={kpis.emergencyCritical > 0 ? `${kpis.emergencyCritical} critical` : `${kpis.emergencyInTreatment} in treatment`}
            trendDirection={kpis.emergencyCritical > 0 ? "up" : undefined}
            trendGood={kpis.emergencyCritical === 0}
          />
          <KPICard label="Admissions" value={kpis.admissionsToday} icon={<LogIn size={14} />} accentColor="var(--vital-green)" />
          <KPICard label="Discharges" value={kpis.dischargesPending} unit="pending" icon={<LogOut size={14} />} accentColor="var(--signal-indigo-light)" />
          <KPICard
            label="Today's Revenue"
            value={`SAR ${kpis.todaysRevenue >= 1000 ? `${(kpis.todaysRevenue / 1000).toFixed(1)}K` : kpis.todaysRevenue.toLocaleString()}`}
            icon={<DollarSign size={14} />}
            accentColor="var(--vital-green)"
          />
          <KPICard
            label="Critical Alerts"
            value={kpis.criticalAlertsCount}
            icon={<AlertOctagon size={14} />}
            accentColor="var(--pulse-coral)"
            trendDelta={`${kpis.unresolvedAlertsCount} unresolved`}
            trendDirection={kpis.unresolvedAlertsCount > 0 ? "up" : undefined}
            trendGood={kpis.unresolvedAlertsCount === 0}
          />
        </div>
      )}

      <div className="grid grid-cols-5 gap-6 mb-6">
        <Card hero accentColor="var(--signal-indigo)" className="col-span-3">
          <h2 className="font-display font-semibold text-on-surface mb-4">Today's Hospital Activity</h2>
          {activity && (
            <div className="flex flex-col gap-4">
              {([
                ["Admissions", activity.admissions],
                ["Discharges", activity.discharges],
                ["Appointments", activity.appointments],
                ["Emergency", activity.emergencyVisits],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-28 flex-shrink-0 text-sm font-medium text-on-surface-variant">{label}</span>
                  <div className="flex-1 h-3 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / maxActivity) * 100}%`, backgroundColor: activityBarColor[label] }} />
                  </div>
                  <span className="w-10 text-right font-mono font-bold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero className="col-span-2">
          <h2 className="font-display font-semibold text-on-surface mb-4">Today's Patients by Department</h2>
          {departments.length > 0 ? (
            <DonutChart centerLabel="patients" data={departments.map((d, i) => ({ name: d.name, value: d.value, color: ["var(--signal-indigo)", "var(--vital-green)", "var(--module-radiology)", "var(--caution-amber)", "var(--sunset-coral)", "var(--outline)"][i % 6] }))} />
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-10">No appointments today yet.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6">
        <Card hero accentColor="var(--pulse-coral)" className="col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface">Critical Alerts</h2>
            <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.ALERTS)} className="text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors">View All Alerts →</button>
          </div>
          {criticalAlerts.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">No open critical alerts.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {criticalAlerts.map((a) => (
                <button key={a.id} type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.ALERTS)} className="flex items-center justify-between gap-3 py-2.5 text-left hover:bg-surface-container-low rounded-lg px-1 -mx-1 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{a.title}</p>
                    <p className="text-xs text-on-surface-variant">{a.source}{a.patientName ? ` · ${a.patientName}` : ""}</p>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant/70 flex-shrink-0">{new Date(a.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card hero className="col-span-2">
          <h2 className="font-display font-semibold text-on-surface mb-4">Live Hospital Status</h2>
          <LiveStatusList rows={liveStatus} />
        </Card>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6">
        <Card hero className="col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface">Bed Occupancy</h2>
            <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.BEDS)} className="text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors">View Beds →</button>
          </div>
          {occupancy && (
            <div className="space-y-4">
              {occupancy.byWard.map((w) => (
                <div key={w.wardId}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-on-surface-variant font-medium">{w.wardName}</span>
                    <span className="text-on-surface font-bold">{w.occupancyRate}% · {w.occupied}/{w.totalBeds}</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-2.5 overflow-hidden">
                    <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${w.occupancyRate}%`, backgroundColor: w.occupancyRate >= 90 ? "var(--pulse-coral)" : w.occupancyRate >= 75 ? "var(--caution-amber)" : "var(--vital-green)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero className="col-span-2">
          <h2 className="font-display font-semibold text-on-surface mb-4">Today's Operations</h2>
          {bedDashboard && appointmentDashboard && otDashboard && labDashboard && radiologyDashboard && pharmacyDashboard && (
            <div className="flex flex-col divide-y divide-line">
              {([
                ["Admissions", bedDashboard.admissionsToday],
                ["Discharges", bedDashboard.expectedDischargesToday.length],
                ["Surgeries", otDashboard.todaysSurgeries],
                ["Lab Orders", labDashboard.ordersToday],
                ["Radiology Orders", radiologyDashboard.ordersToday],
                ["Prescriptions", pharmacyDashboard.prescriptionsToday],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-mono font-bold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card hero>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface">Financial Overview</h2>
            <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.BILLING)} className="text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors">View Billing →</button>
          </div>
          {billingDashboard && claimsDashboard && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">Today's Revenue</p>
                <p className="font-mono font-bold text-2xl text-on-surface">SAR {billingDashboard.todaysRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">Outstanding</p>
                <p className="font-mono font-bold text-2xl text-pulse-coral">SAR {billingDashboard.outstandingReceivables.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">Overdue Invoices</p>
                <p className="font-mono font-bold text-lg text-on-surface">{billingDashboard.overdueInvoices}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">Insurance Claims</p>
                <p className="font-mono font-bold text-lg text-on-surface">{Object.values(claimsDashboard.byStatus).reduce((a, b) => a + b, 0)}</p>
              </div>
            </div>
          )}
        </Card>

        <Card hero>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface">Appointment Overview</h2>
            <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.APPOINTMENTS)} className="text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors">View Appointments →</button>
          </div>
          {appointmentDashboard && (
            <div className="flex flex-col divide-y divide-line">
              {([
                ["Total Today", appointmentDashboard.todaysTotal],
                ["Completed", appointmentDashboard.byStatus.completed],
                ["Waiting", appointmentDashboard.waitingPatients],
                ["Cancelled", appointmentDashboard.byStatus.cancelled],
                ["No-Show", appointmentDashboard.byStatus["no-show"]],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-mono font-bold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card hero className="mb-6">
        <h2 className="font-display font-semibold text-on-surface mb-4">Staff Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {staffStatus.map((s) => (
            <div key={s.role} className="rounded-card border border-line p-3.5">
              <p className="text-xs text-on-surface-variant uppercase tracking-wide mb-1">{s.role}</p>
              <p className="font-mono font-bold text-lg text-on-surface">{s.onDuty} / {s.total}</p>
              <p className="text-xs text-on-surface-variant">on duty today</p>
            </div>
          ))}
        </div>
      </Card>

      <Card hero className="mb-6">
        <h2 className="font-display font-semibold text-on-surface mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.severity === "high" ? "var(--pulse-coral)" : a.severity === "medium" ? "var(--caution-amber)" : "var(--signal-indigo)" }} />
                <span className="flex-1 text-sm text-on-surface">
                  <span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()} — {a.module}{a.detail ? ` (${a.detail})` : ""}
                </span>
                <span className="font-mono text-xs text-on-surface-variant/70 whitespace-nowrap">{new Date(a.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card hero>
        <h2 className="font-display font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.route)}
              className="flex items-center gap-2.5 bg-white rounded-xl border border-line px-4 py-3 shadow-sm hover:shadow-card hover:-translate-y-0.5 hover:border-signal-indigo transition-all text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 bg-signal-indigo-tint text-signal-indigo">
                <action.icon size={16} />
              </span>
              <span className="text-sm font-semibold text-on-surface">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </HospitalAdminLayout>
  );
}
