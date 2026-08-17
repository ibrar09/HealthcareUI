import { ReactNode } from "react";
import { AlertTriangle, Moon } from "lucide-react";
import type { ShiftCell, ShiftType, StaffRosterRow } from "@modules/hospital-admin/api";

interface RosterGridProps {
  staffList: { id: string; name: string; title: string; accentColor: string; initials: string; roleIcon: ReactNode }[];
  rosterRows: StaffRosterRow[];
  days: string[];
  todayLabel?: string;
  onCellClick?: (staffId: string, day: string) => void;
}

function ShiftCellView({ cell, onClick, isToday }: { cell?: ShiftCell; onClick?: () => void; isToday: boolean }) {
  const ring = isToday ? "ring-2 ring-signal-indigo/40 ring-offset-2 ring-offset-white" : "";

  if (!cell || cell.type === "gap") {
    return (
      <button
        onClick={onClick}
        className={`group/cell relative w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-pulse-coral border-2 border-dashed border-pulse-coral/50 bg-pulse-coral/[0.06] transition-all hover:border-pulse-coral hover:bg-pulse-coral/10 hover:-translate-y-0.5 ${ring}`}
      >
        <AlertTriangle size={14} className="animate-pulseGlow" />
        Coverage Gap
      </button>
    );
  }

  if (cell.type === "leave") {
    return (
      <button
        onClick={onClick}
        className={`w-full h-16 rounded-xl flex items-center justify-center text-xs font-semibold text-on-surface-variant border border-line transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${ring}`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--surface-container-low), var(--surface-container-low) 6px, var(--surface-container) 6px, var(--surface-container) 12px)",
        }}
      >
        On Leave
      </button>
    );
  }

  const isNight = cell.type === "night";
  const base = isNight ? "var(--ink-navy)" : "var(--signal-indigo)";
  const glow = isNight ? "rgba(15,23,42,0.35)" : "rgba(99,102,241,0.4)";

  return (
    <button
      onClick={onClick}
      className={`relative w-full h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold px-1 text-center text-white overflow-hidden transition-all hover:-translate-y-0.5 ${ring}`}
      style={{
        backgroundImage: `linear-gradient(140deg, ${base}, color-mix(in srgb, ${base} 70%, black))`,
        boxShadow: `0 6px 16px -8px ${glow}`,
      }}
    >
      {isNight && <Moon size={11} className="opacity-80" />}
      {cell.time}
    </button>
  );
}

/** Module-local — the weekly shift grid (Staff × Day) for Roster Management. */
export function RosterGrid({ staffList, rosterRows, days, todayLabel, onCellClick }: RosterGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: "0 10px" }}>
        <thead>
          <tr>
            <th className="text-left text-xs font-bold uppercase tracking-wide text-on-surface-variant pb-2 pl-2 w-56">Staff Member</th>
            {days.map((d) => {
              const isToday = d === todayLabel;
              return (
                <th key={d} className="pb-2 px-1">
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${
                      isToday ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant"
                    }`}
                  >
                    {d}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {staffList.map((s) => {
            const row = rosterRows.find((r) => r.staffId === s.id);
            return (
              <tr key={s.id} className="bg-white shadow-card">
                <td className="rounded-l-2xl border border-line border-r-0 pl-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold border-2"
                        style={{
                          backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${s.accentColor} 18%, white), color-mix(in srgb, ${s.accentColor} 8%, white))`,
                          color: s.accentColor,
                          borderColor: `color-mix(in srgb, ${s.accentColor} 35%, transparent)`,
                        }}
                      >
                        {s.initials}
                      </span>
                      <span
                        className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-line shadow-sm"
                        style={{ color: s.accentColor }}
                      >
                        {s.roleIcon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{s.title}</p>
                    </div>
                  </div>
                </td>
                {days.map((d, i) => {
                  const cell = row?.shifts.find((sh) => sh.day === d);
                  return (
                    <td
                      key={d}
                      className={`border-y border-line px-1.5 py-3 ${i === days.length - 1 ? "rounded-r-2xl border-r" : ""}`}
                    >
                      <ShiftCellView cell={cell} isToday={d === todayLabel} onClick={() => onCellClick?.(s.id, d)} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
