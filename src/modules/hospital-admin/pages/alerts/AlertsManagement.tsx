import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { AlertsDashboardPanel } from "@modules/hospital-admin/components/alerts/AlertsDashboardPanel";
import { AlertCenterPanel } from "@modules/hospital-admin/components/alerts/AlertCenterPanel";
import { CriticalAlertsPanel } from "@modules/hospital-admin/components/alerts/CriticalAlertsPanel";
import { MyAlertsPanel } from "@modules/hospital-admin/components/alerts/MyAlertsPanel";
import { AlertDetailDrawer } from "@modules/hospital-admin/components/alerts/AlertDetailDrawer";
import { NotificationCenterPanel } from "@modules/hospital-admin/components/alerts/NotificationCenterPanel";
import { NotificationHistoryPanel } from "@modules/hospital-admin/components/alerts/NotificationHistoryPanel";
import { TemplatesPanel } from "@modules/hospital-admin/components/alerts/TemplatesPanel";
import { AlertRulesPanel } from "@modules/hospital-admin/components/alerts/AlertRulesPanel";
import { NotificationRulesPanel } from "@modules/hospital-admin/components/alerts/NotificationRulesPanel";
import { EscalationPoliciesPanel } from "@modules/hospital-admin/components/alerts/EscalationPoliciesPanel";
import { ChannelsPanel } from "@modules/hospital-admin/components/alerts/ChannelsPanel";
import { UserPreferencesPanel } from "@modules/hospital-admin/components/alerts/UserPreferencesPanel";
import { DeliveryLogsPanel } from "@modules/hospital-admin/components/alerts/DeliveryLogsPanel";
import { FailedNotificationsPanel } from "@modules/hospital-admin/components/alerts/FailedNotificationsPanel";
import { AlertsReportsPanel } from "@modules/hospital-admin/components/alerts/AlertsReportsPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  Alert, AlertCategory, AlertSeverity, AlertStatus, NotificationChannel, NotificationDeliveryStatus, ChannelPreferenceSet,
} from "@modules/hospital-admin/api";

type Tab =
  | "dashboard" | "alert-center" | "critical-alerts" | "my-alerts" | "notification-center" | "notification-history"
  | "templates" | "alert-rules" | "notification-rules" | "escalation-policies" | "channels" | "preferences"
  | "delivery-logs" | "failed-notifications" | "reports";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Alerts & Notifications", subtitle: "Operational overview — every count computed from real alerts and deliveries." },
  "alert-center": { label: "Alert Center", title: "Alert Center", subtitle: "Every hospital alert in one place, fully filterable." },
  "critical-alerts": { label: "Critical Alerts", title: "Critical Alerts", subtitle: "Open critical-severity alerts requiring immediate action." },
  "my-alerts": { label: "My Alerts", title: "My Alerts", subtitle: "Alerts assigned to you." },
  "notification-center": { label: "Notification Center", title: "Notification Center", subtitle: "Your in-app notification feed." },
  "notification-history": { label: "Notification History", title: "Notification History", subtitle: "Every notification ever sent, filterable by channel and status." },
  templates: { label: "Templates", title: "Notification Templates", subtitle: "Per-event, per-channel, multi-language message templates." },
  "alert-rules": { label: "Alert Rules", title: "Alert Rules Builder", subtitle: "The no-code WHEN / AND / THEN rules engine that creates alerts." },
  "notification-rules": { label: "Notification Rules", title: "Notification Rules", subtitle: "Event → condition → channel → escalation routing." },
  "escalation-policies": { label: "Escalation Policies", title: "Escalation Management", subtitle: "Per-category, per-severity escalation chains." },
  channels: { label: "Channels", title: "Notification Channels", subtitle: "Provider connection status — owned by Configuration, read here." },
  preferences: { label: "User Preferences", title: "Notification Preferences", subtitle: "Per-severity, per-channel opt-in, plus Quiet Hours." },
  "delivery-logs": { label: "Delivery Logs", title: "Delivery Logs", subtitle: "Full delivery status trail for every notification." },
  "failed-notifications": { label: "Failed Notifications", title: "Failed Notifications", subtitle: "Failed or retrying deliveries, with channel-fallback retry." },
  reports: { label: "Reports", title: "Alerts & Notifications Report", subtitle: "Volume and performance broken down by severity, department, source, and channel." },
};

/**
 * Alerts & Notifications — full 39-section build per
 * ALERTS_NOTIFICATIONS_MODULE_SPEC.md, per the user's own explicit choice.
 * Replaces the old `AlertsCenter.tsx` placeholder. Tab structure follows
 * the spec's own §38 "most important frontend pages" list exactly.
 */
export function AlertsManagement() {
  const { user } = useAuth();
  const currentUserId = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<api.AlertsDashboardData | null>(null);
  const [alertsList, setAlertsList] = useState<Alert[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [myAlerts, setMyAlerts] = useState<Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");

  const [notificationCenter, setNotificationCenter] = useState<api.NotificationRecord[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<api.NotificationRecord[]>([]);
  const [historyChannelFilter, setHistoryChannelFilter] = useState<NotificationChannel | "all">("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<NotificationDeliveryStatus | "all">("all");

  const [templates, setTemplates] = useState<api.NotificationTemplate[]>([]);
  const [alertRulesList, setAlertRulesList] = useState<api.AlertRule[]>([]);
  const [notificationRulesList, setNotificationRulesList] = useState<api.NotificationRule[]>([]);
  const [escalationPolicies, setEscalationPolicies] = useState<api.EscalationPolicy[]>([]);
  const [providers, setProviders] = useState<api.CommunicationProviderConfig[]>([]);
  const [preference, setPreference] = useState<api.UserNotificationPreference | null>(null);
  const [quietHours, setQuietHours] = useState<api.QuietHoursConfig | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<api.NotificationRecord[]>([]);
  const [failedNotifications, setFailedNotifications] = useState<api.NotificationRecord[]>([]);
  const [report, setReport] = useState<api.AlertsReportData | null>(null);

  function refreshDashboard() { api.getAlertsDashboard().then(setDashboard); }
  function refreshAlerts() {
    api.getAlerts({
      search: search || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      severity: severityFilter === "all" ? undefined : severityFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }).then(setAlertsList);
  }
  function refreshCriticalAlerts() { api.getCriticalAlerts().then(setCriticalAlerts); }
  function refreshMyAlerts() { api.getMyAlerts(currentUserId).then(setMyAlerts); }
  function refreshNotificationCenter() { api.getNotificationCenter().then(setNotificationCenter); }
  function refreshNotificationHistory() {
    api.getNotificationHistory({
      channel: historyChannelFilter === "all" ? undefined : historyChannelFilter,
      status: historyStatusFilter === "all" ? undefined : historyStatusFilter,
    }).then(setNotificationHistory);
  }
  function refreshDeliveryLogs() { api.getDeliveryLogs().then(setDeliveryLogs); }
  function refreshFailedNotifications() { api.getFailedNotifications().then(setFailedNotifications); }
  function refreshReport() { api.getAlertsReport().then(setReport); }

  useEffect(() => {
    refreshDashboard();
    refreshAlerts();
    refreshCriticalAlerts();
    refreshMyAlerts();
    refreshNotificationCenter();
    refreshNotificationHistory();
    api.getNotificationTemplates().then(setTemplates);
    api.getAlertRules().then(setAlertRulesList);
    api.getNotificationRules().then(setNotificationRulesList);
    api.getEscalationPolicies().then(setEscalationPolicies);
    api.getCommunicationProviders().then(setProviders);
    api.getUserNotificationPreferences(currentUserId).then(setPreference);
    api.getQuietHoursConfig(currentUserId).then(setQuietHours);
    refreshDeliveryLogs();
    refreshFailedNotifications();
    refreshReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshAlerts(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [search, categoryFilter, severityFilter, statusFilter]);
  useEffect(() => { refreshNotificationHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [historyChannelFilter, historyStatusFilter]);

  useEffect(() => {
    if (!selectedAlertId) { setSelectedAlert(null); return; }
    api.getAlert(selectedAlertId).then((a) => setSelectedAlert(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlertId]);

  function refreshAllAlertViews() {
    refreshDashboard();
    refreshAlerts();
    refreshCriticalAlerts();
    refreshMyAlerts();
    refreshReport();
  }

  // `mockRequest()` resolves with the same object/array reference it was given
  // (see shared/lib/api/client.ts) — a setState call with that identical
  // reference and no other accompanying state change makes React bail out of
  // re-rendering (Object.is on the top-level reference sees no change, even
  // though a nested field was mutated). Every handler below spreads the
  // mutation's own return value into a fresh reference before setState so the
  // UI updates reliably on its own, rather than depending on an incidental
  // re-render triggered by some other state update happening alongside it.
  async function handleAcknowledge(note?: string) {
    if (!selectedAlertId) return;
    const updated = await api.acknowledgeAlert(selectedAlertId, currentUserId, note);
    setSelectedAlert(updated ? { ...updated } : null);
    refreshAllAlertViews();
  }
  async function handleAssign(assigneeId: string) {
    if (!selectedAlertId) return;
    const updated = await api.assignAlert(selectedAlertId, assigneeId, currentUserId);
    setSelectedAlert(updated ? { ...updated } : null);
    refreshAllAlertViews();
  }
  async function handleEscalate(note?: string) {
    if (!selectedAlertId) return;
    const updated = await api.escalateAlert(selectedAlertId, currentUserId, note);
    setSelectedAlert(updated ? { ...updated } : null);
    refreshAllAlertViews();
  }
  async function handleResolve(note: string) {
    if (!selectedAlertId) return;
    const updated = await api.resolveAlert(selectedAlertId, currentUserId, note);
    setSelectedAlert(updated ? { ...updated } : null);
    refreshAllAlertViews();
  }
  async function handleDismiss(reason: string) {
    if (!selectedAlertId) return;
    const updated = await api.dismissAlert(selectedAlertId, currentUserId, reason);
    setSelectedAlert(updated ? { ...updated } : null);
    refreshAllAlertViews();
  }

  async function handleToggleAlertRule(id: string, enabled: boolean) {
    const updated = await api.toggleAlertRule(id, enabled);
    if (updated) setAlertRulesList((prev) => prev.map((r) => (r.id === id ? { ...updated } : r)));
  }

  async function handleUpdateSeverityPreference(severity: "critical" | "high" | "medium" | "low", channels: ChannelPreferenceSet) {
    const updated = await api.updateUserNotificationPreferences(currentUserId, { [severity]: channels } as Partial<Pick<api.UserNotificationPreference, "high" | "medium" | "low">> & { critical?: Partial<ChannelPreferenceSet> });
    if (updated) setPreference({ ...updated });
  }
  async function handleUpdateQuietHours(updates: { enabled: boolean; startTime: string; endTime: string }) {
    const updated = await api.updateQuietHoursConfig(currentUserId, updates);
    setQuietHours({ ...updated });
  }

  async function handleRetryNotification(id: string) {
    await api.retryNotification(id);
    refreshFailedNotifications();
    refreshDeliveryLogs();
    refreshNotificationHistory();
    refreshDashboard();
  }

  return (
    <HospitalAdminLayout active="Alerts">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--pulse-coral) 16%, transparent)", color: "var(--pulse-coral)" }}>
          <Bell size={18} />
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

      {tab === "dashboard" && <AlertsDashboardPanel data={dashboard} />}
      {tab === "alert-center" && (
        <AlertCenterPanel
          alerts={alertsList} search={search} onSearchChange={setSearch}
          categoryFilter={categoryFilter} onCategoryFilterChange={setCategoryFilter}
          severityFilter={severityFilter} onSeverityFilterChange={setSeverityFilter}
          statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
          onSelect={setSelectedAlertId}
        />
      )}
      {tab === "critical-alerts" && <CriticalAlertsPanel alerts={criticalAlerts} onSelect={setSelectedAlertId} />}
      {tab === "my-alerts" && <MyAlertsPanel alerts={myAlerts} onSelect={setSelectedAlertId} />}
      {tab === "notification-center" && <NotificationCenterPanel notifications={notificationCenter} />}
      {tab === "notification-history" && (
        <NotificationHistoryPanel
          notifications={notificationHistory}
          channelFilter={historyChannelFilter} onChannelFilterChange={setHistoryChannelFilter}
          statusFilter={historyStatusFilter} onStatusFilterChange={setHistoryStatusFilter}
        />
      )}
      {tab === "templates" && <TemplatesPanel templates={templates} previewFor={api.previewNotificationTemplate} />}
      {tab === "alert-rules" && <AlertRulesPanel rules={alertRulesList} onToggle={handleToggleAlertRule} />}
      {tab === "notification-rules" && <NotificationRulesPanel rules={notificationRulesList} />}
      {tab === "escalation-policies" && <EscalationPoliciesPanel policies={escalationPolicies} />}
      {tab === "channels" && <ChannelsPanel providers={providers} />}
      {tab === "preferences" && (
        <UserPreferencesPanel preference={preference} quietHours={quietHours} onUpdateSeverity={handleUpdateSeverityPreference} onUpdateQuietHours={handleUpdateQuietHours} />
      )}
      {tab === "delivery-logs" && <DeliveryLogsPanel notifications={deliveryLogs} />}
      {tab === "failed-notifications" && <FailedNotificationsPanel notifications={failedNotifications} onRetry={handleRetryNotification} />}
      {tab === "reports" && <AlertsReportsPanel data={report} />}

      <AlertDetailDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlertId(null)}
        onAcknowledge={handleAcknowledge}
        onAssign={handleAssign}
        onEscalate={handleEscalate}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
      />
    </HospitalAdminLayout>
  );
}
