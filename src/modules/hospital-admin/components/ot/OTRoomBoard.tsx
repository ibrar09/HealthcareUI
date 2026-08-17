import { Pencil, Plus } from "lucide-react";
import { Card, Button } from "@shared/design-system/components";
import { otRoomStatusMeta } from "@modules/hospital-admin/components/ot/otStatusMeta";
import type { OTRoomRow, OTRoomStatus } from "@modules/hospital-admin/api";

const statusCycle: OTRoomStatus[] = ["available", "reserved", "preparation", "cleaning", "maintenance", "blocked"];

interface OTRoomBoardProps {
  rooms: OTRoomRow[];
  onAdd?: () => void;
  onEdit?: (room: OTRoomRow) => void;
  onSetStatus?: (room: OTRoomRow, status: OTRoomStatus) => void;
  compact?: boolean;
}

/** Module-local — OT Room Status board (spec §5) and Room Management (spec §28). `compact` renders the dashboard card-grid variant; the full Rooms tab adds edit/status-cycle controls. */
export function OTRoomBoard({ rooms, onAdd, onEdit, onSetStatus, compact }: OTRoomBoardProps) {
  return (
    <div className="flex flex-col gap-4">
      {!compact && onAdd && (
        <div className="flex items-center justify-end">
          <Button size="sm" onClick={onAdd} icon={<Plus size={14} />}>
            Add OT Room
          </Button>
        </div>
      )}
      <div className={`grid gap-4 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
        {rooms.map((r) => {
          const meta = otRoomStatusMeta[r.status];
          return (
            <Card key={r.id} hero accentColor={meta.color}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-on-surface">{r.number}</h3>
                {!compact && onEdit && (
                  <button type="button" onClick={() => onEdit(r)} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all" title="Edit">
                    <Pencil size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mb-3">{r.type}</p>
              <div className="flex items-center gap-1.5 mb-3">
                <span>{meta.dot}</span>
                <span className="text-sm font-bold" style={{ color: meta.color }}>
                  {meta.label.toUpperCase()}
                </span>
              </div>
              {r.currentCase ? (
                <div className="text-xs text-on-surface-variant space-y-0.5">
                  <p className="text-on-surface font-medium truncate">{r.currentCase.procedureName}</p>
                  <p className="truncate">{r.currentCase.surgeonName ?? "Unassigned"}</p>
                </div>
              ) : (
                !compact && <p className="text-xs text-on-surface-variant">No active case</p>
              )}
              {!compact && onSetStatus && (
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {statusCycle
                    .filter((s) => s !== r.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSetStatus(r, s)}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold border border-line text-on-surface-variant hover:bg-surface-container-low transition-all"
                      >
                        {otRoomStatusMeta[s].label}
                      </button>
                    ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
