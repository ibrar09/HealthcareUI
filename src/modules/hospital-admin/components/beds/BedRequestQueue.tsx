import { CSSProperties } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { BedRequestView } from "@modules/hospital-admin/api";

const priorityMeta: Record<BedRequestView["priority"], { label: string; color: string }> = {
  routine: { label: "Routine", color: "var(--signal-indigo)" },
  urgent: { label: "Urgent", color: "var(--caution-amber)" },
  emergency: { label: "Emergency", color: "var(--pulse-coral)" },
};

const statusMeta: Record<BedRequestView["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "var(--caution-amber)" },
  assigned: { label: "Assigned", color: "var(--vital-green)" },
  rejected: { label: "Rejected", color: "var(--outline)" },
};

interface BedRequestQueueProps {
  requests: BedRequestView[];
  onAssign: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

/** Module-local — Bed Management "Requests" tab (spec §14). */
export function BedRequestQueue({ requests, onAssign, onReject }: BedRequestQueueProps) {
  if (requests.length === 0) {
    return <p className="text-center text-sm text-on-surface-variant py-12">No bed requests yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((r) => {
        const priority = priorityMeta[r.priority];
        const status = statusMeta[r.status];
        return (
          <div
            key={r.id}
            className="relative w-full bg-white rounded-2xl border border-line pl-6 pr-5 py-4 flex items-center gap-5 overflow-hidden shadow-card"
            style={{ "--row-glow": `color-mix(in srgb, ${priority.color} 30%, transparent)` } as CSSProperties}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: priority.color }} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-on-surface truncate">{r.patientName}</h3>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide flex-shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${priority.color} 14%, transparent)`, color: priority.color }}
                >
                  {priority.label}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate">
                {r.bedTypeName}
                {r.departmentName ? ` · ${r.departmentName}` : ""} · Requested by {r.requestedByName}
              </p>
              {r.status === "rejected" && r.rejectionReason && (
                <p className="text-xs text-pulse-coral mt-1">Rejected: {r.rejectionReason}</p>
              )}
              {r.status === "assigned" && r.assignedBedIdentifier && (
                <p className="text-xs text-vital-green mt-1">Assigned to bed {r.assignedBedIdentifier}</p>
              )}
            </div>

            <div className="hidden md:block text-right flex-shrink-0 w-24">
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant mb-0.5">Requested</p>
              <p className="text-xs font-semibold text-on-surface">{r.requestedOn}</p>
            </div>

            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${status.color} 14%, transparent)`, color: status.color }}
            >
              {status.label}
            </span>

            {r.status === "pending" && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onAssign(r.id)}
                  className="flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-glow hover:brightness-110 transition-all"
                >
                  <CheckCircle2 size={13} /> Assign
                </button>
                <button
                  type="button"
                  onClick={() => onReject(r.id)}
                  className="flex items-center gap-1.5 border border-line bg-white text-on-surface-variant text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-surface-container-low transition-all"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
