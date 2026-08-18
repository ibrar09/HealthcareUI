import { ShieldCheck, LogOut } from "lucide-react";

interface SecuritySettingsCardProps {
  onSignOut: () => void;
}

/** Module-local — session/security info and sign-out. Password reset is deliberately not self-service (see Help Center) — routed to IT Support instead, to keep account recovery auditable. */
export function SecuritySettingsCard({ onSignOut }: SecuritySettingsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-800 mb-4">Security</h2>

      <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-4 py-3 mb-4">
        <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-slate-700">HIPAA-compliant session</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Auto-logout after 15 minutes of inactivity.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-700">Password</p>
          <p className="text-[11px] text-slate-400">Resets go through IT Support, not self-service.</p>
        </div>
        <a href="mailto:it-support@citygeneral.org" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex-shrink-0">
          Contact IT Support
        </a>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-100 hover:bg-rose-50 rounded-lg px-4 py-2"
      >
        <LogOut className="w-3.5 h-3.5" /> Sign Out
      </button>
    </div>
  );
}
