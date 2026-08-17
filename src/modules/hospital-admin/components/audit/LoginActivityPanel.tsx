import { Card } from "@shared/design-system/components";
import { resultMeta, statusPillStyle, formatDateTime } from "@modules/hospital-admin/components/audit/auditStatusMeta";
import type { LoginSession, FailedLoginSummary } from "@modules/hospital-admin/api";

interface LoginActivityPanelProps {
  sessions: LoginSession[];
  failedLogins: FailedLoginSummary[];
}

/** Module-local — Login History + Failed Login Analysis (spec §20-21), combined per this project's established consolidation discipline. */
export function LoginActivityPanel({ sessions, failedLogins }: LoginActivityPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card hero>
        <h2 className="text-lg font-bold text-on-surface mb-4">Login History</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">No login sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">User</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Login Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Logout Time</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">IP</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Device</th>
                  <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">MFA</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wide text-on-surface-variant font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sessions.map((s) => {
                  const result = resultMeta[s.result];
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 pr-3 font-semibold text-on-surface">{s.actorName}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{formatDateTime(s.loginTime)}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant whitespace-nowrap">{s.logoutTime ? formatDateTime(s.logoutTime) : "Active"}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant font-mono text-xs">{s.ipAddress}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.device} · {s.browser}</td>
                      <td className="py-2.5 pr-3 text-on-surface-variant">{s.mfaUsed ? "Yes" : "No"}</td>
                      <td className="py-2.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={statusPillStyle(result.color)}>{result.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card hero accentColor="var(--caution-amber)">
        <h2 className="text-lg font-bold text-on-surface mb-4">Failed Login Attempts</h2>
        {failedLogins.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">No failed login attempts recorded.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {failedLogins.map((f) => (
              <div key={f.actorName} className="py-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-on-surface">{f.actorName}</span>
                <span className="text-on-surface-variant">{f.attempts} attempt(s) · last {formatDateTime(f.lastAttempt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
