import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, CalendarDays, ClipboardCheck, Footprints, UserPlus, CalendarPlus, Search as SearchIcon,
  Siren, CreditCard, Ticket,
} from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { ROUTES } from "@/constants/routes";
import { Card, KPICard, StatusChip, Button } from "@shared/design-system/components";
import { PatientSearchWidget } from "@modules/hospital-admin/components/dashboard/PatientSearchWidget";
import * as api from "@modules/hospital-admin/api";
import type { AppointmentStatus } from "@modules/hospital-admin/api";

const dateLabel = new Date(`${api.TODAY}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const statusTone: Record<AppointmentStatus, "success" | "warning" | "critical" | "info" | "neutral"> = {
  requested: "neutral",
  "pending-confirmation": "warning",
  confirmed: "info",
  "checked-in": "info",
  waiting: "warning",
  "in-progress": "success",
  completed: "success",
  cancelled: "critical",
  rescheduled: "neutral",
  "no-show": "critical",
};

const statusLabel: Record<AppointmentStatus, string> = {
  requested: "Requested",
  "pending-confirmation": "Pending Confirmation",
  confirmed: "Confirmed",
  "checked-in": "Checked In",
  waiting: "Waiting",
  "in-progress": "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
  "no-show": "No-Show",
};

const quickActions = [
  { label: "Register Patient", icon: UserPlus, route: ROUTES.HOSPITAL_ADMIN.PATIENTS },
  { label: "Book Appointment", icon: CalendarPlus, route: ROUTES.HOSPITAL_ADMIN.APPOINTMENTS },
  { label: "Walk-in Patient", icon: Footprints, route: ROUTES.HOSPITAL_ADMIN.APPOINTMENTS },
  { label: "Check-In", icon: ClipboardCheck, route: ROUTES.HOSPITAL_ADMIN.APPOINTMENTS },
  { label: "Find Patient", icon: SearchIcon, route: ROUTES.HOSPITAL_ADMIN.PATIENTS },
  { label: "Emergency Admit", icon: Siren, route: ROUTES.HOSPITAL_ADMIN.EMERGENCY },
  { label: "Billing", icon: CreditCard, route: ROUTES.HOSPITAL_ADMIN.BILLING },
  { label: "Beds", icon: Ticket, route: ROUTES.HOSPITAL_ADMIN.BEDS },
];

const doctorStatusMeta = {
  available: { label: "Available", color: "var(--vital-green)" },
  "with-patient": { label: "With Patient", color: "var(--pulse-coral)" },
  "off-duty": { label: "Off Duty", color: "var(--outline)" },
} as const;

export function ReceptionDashboard() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<api.ReceptionOverviewKpis | null>(null);
  const [appointments, setAppointments] = useState<Awaited<ReturnType<typeof api.getAppointments>>>([]);
  const [queue, setQueue] = useState<api.DepartmentQueueRow[]>([]);
  const [doctors, setDoctors] = useState<api.DoctorStatusRow[]>([]);
  const [attention, setAttention] = useState<api.AttentionItem[]>([]);
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof api.getFrontDeskAlerts>>>([]);

  function refreshAppointments() {
    api.getAppointments({ date: api.TODAY }).then(setAppointments);
  }
  function refreshAll() {
    api.getReceptionOverviewKpis().then(setKpis);
    refreshAppointments();
    api.getPatientQueueByDepartment().then(setQueue);
    api.getDoctorStatusBoard().then(setDoctors);
    api.getPatientsRequiringAttention().then(setAttention);
    api.getFrontDeskAlerts().then(setAlerts);
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckIn(id: string) {
    await api.checkInAppointment(id);
    refreshAppointments();
    api.getReceptionOverviewKpis().then(setKpis);
    api.getPatientQueueByDepartment().then(setQueue);
  }

  return (
    <HospitalAdminLayout active="Reception Dashboard">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">{greeting()}, {api.DEFAULT_ACTOR.split(" ")[0]}</h1>
          <p className="text-sm text-on-surface-variant">Front Desk · City General Health Network</p>
          <p className="font-mono text-xs text-on-surface-variant/70 mt-1">{dateLabel}</p>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard label="Waiting" value={kpis.waiting} icon={<Clock size={14} />} accentColor="var(--caution-amber)" trendDelta={kpis.waitingUrgent > 0 ? `${kpis.waitingUrgent} urgent` : undefined} trendDirection={kpis.waitingUrgent > 0 ? "up" : undefined} trendGood={kpis.waitingUrgent === 0} />
          <KPICard label="Appointments" value={kpis.appointmentsToday} icon={<CalendarDays size={14} />} accentColor="var(--signal-indigo)" trendDelta={`${kpis.appointmentsUpcoming} upcoming`} />
          <KPICard label="Checked-In" value={kpis.checkedIn} icon={<ClipboardCheck size={14} />} accentColor="var(--vital-green)" trendDelta={`${kpis.checkedInCompleted} completed`} />
          <KPICard label="Walk-Ins" value={kpis.walkIns} icon={<Footprints size={14} />} accentColor="var(--module-radiology)" trendDelta={kpis.walkInsUrgent > 0 ? `${kpis.walkInsUrgent} urgent` : undefined} trendDirection={kpis.walkInsUrgent > 0 ? "up" : undefined} trendGood={kpis.walkInsUrgent === 0} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PatientSearchWidget />
        </div>
        <Card hero>
          <h2 className="font-display font-semibold text-on-surface mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.route)}
                className="flex flex-col items-start gap-2 bg-white rounded-xl border border-line px-3 py-3 hover:shadow-card hover:-translate-y-0.5 hover:border-signal-indigo transition-all text-left"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-indigo-tint text-signal-indigo">
                  <action.icon size={14} />
                </span>
                <span className="text-xs font-semibold text-on-surface leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card hero className="mb-6">
        <h2 className="font-display font-semibold text-on-surface mb-4">Today's Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">No appointments today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Patient</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Doctor</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Department</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {appointments.slice(0, 8).map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 pr-3 font-mono font-bold text-on-surface whitespace-nowrap">{new Date(a.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</td>
                    <td className="py-2.5 pr-3 text-on-surface">{a.patientName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{a.practitionerName}</td>
                    <td className="py-2.5 pr-3 text-on-surface-variant">{a.departmentName ?? "—"}</td>
                    <td className="py-2.5 pr-3"><StatusChip tone={statusTone[a.status]}>{statusLabel[a.status]}</StatusChip></td>
                    <td className="py-2.5">
                      {a.status === "confirmed" || a.status === "pending-confirmation" ? (
                        <Button size="sm" variant="outline" onClick={() => handleCheckIn(a.id)}>Check-In</Button>
                      ) : (
                        <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.APPOINTMENTS)} className="text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors">View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card hero>
          <h2 className="font-display font-semibold text-on-surface mb-4">Patient Queue</h2>
          {queue.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">No one waiting right now.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {queue.map((q) => (
                <div key={q.departmentName} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-semibold text-on-surface">{q.departmentName}</span>
                  <span className="font-mono font-bold text-on-surface">{q.waiting} waiting</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero>
          <h2 className="font-display font-semibold text-on-surface mb-4">Doctor Status</h2>
          <div className="flex flex-col divide-y divide-line">
            {doctors.map((d) => {
              const meta = doctorStatusMeta[d.status];
              return (
                <div key={d.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-semibold text-on-surface">Dr. {d.name.replace(/^Dr\.?\s*/i, "")}</p>
                    <p className="text-xs text-on-surface-variant">{d.specialty}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: meta.color }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <Card hero>
          <h2 className="font-display font-semibold text-on-surface mb-4">Patients Requiring Attention</h2>
          {attention.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">Nothing needs attention right now.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {attention.map((item) => (
                <div key={item.type} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-on-surface">{item.label}</span>
                  <span className="font-mono font-bold text-caution-amber">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hero accentColor="var(--pulse-coral)">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface">Front Desk Alerts</h2>
            <button type="button" onClick={() => navigate(ROUTES.HOSPITAL_ADMIN.ALERTS)} className="text-xs font-semibold text-signal-indigo hover:text-signal-indigo-dark transition-colors">View All →</button>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">No active front-desk alerts.</p>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {alerts.map((a) => (
                <div key={a.id} className="py-2.5 text-sm">
                  <p className="font-semibold text-on-surface">{a.title}</p>
                  <p className="text-xs text-on-surface-variant">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </HospitalAdminLayout>
  );
}
