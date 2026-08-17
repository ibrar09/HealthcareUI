import { useEffect, useState } from "react";
import { Drawer, Button } from "@shared/design-system/components";
import { FormField, FormSection, formInputClass } from "@modules/hospital-admin/components/FormPrimitives";
import * as api from "@modules/hospital-admin/api";
import type { BedListRow, BedRequestView } from "@modules/hospital-admin/api";

interface AssignRequestDrawerProps {
  request: BedRequestView | null;
  onClose: () => void;
  onComplete: () => void;
  staffOptions: { id: string; name: string }[];
  currentUserName?: string;
}

/** Module-local — fulfils a pending Bed Request by picking a matching available bed. */
export function AssignRequestDrawer({ request, onClose, onComplete, staffOptions, currentUserName }: AssignRequestDrawerProps) {
  const [matches, setMatches] = useState<BedListRow[]>([]);
  const [bedId, setBedId] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");

  useEffect(() => {
    if (!request) return;
    setBedId("");
    setAssignedStaffId("");
    api.getAvailableBeds({ bedTypeId: request.bedTypeId }).then(setMatches);
  }, [request]);

  async function handleSubmit() {
    if (!request || !bedId) return;
    await api.assignRequestToBed(request.id, bedId, assignedStaffId || undefined, currentUserName);
    onComplete();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(request)}
      onClose={onClose}
      title="Assign Bed to Request"
      subtitle={request ? `${request.patientName} · ${request.bedTypeName}` : undefined}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!bedId}>
            Assign Bed
          </Button>
        </div>
      }
    >
      {request && (
        <FormSection title="Matching Available Beds">
          {matches.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No available {request.bedTypeName} beds right now. Try reassigning the request to a different bed type, or wait for a bed to
              free up.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-2">
                {matches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBedId(b.id)}
                    className={`flex items-center justify-between gap-3 rounded-input border px-3.5 py-2.5 text-left transition-all ${
                      bedId === b.id ? "border-signal-indigo bg-signal-indigo-tint" : "border-line hover:bg-surface-container-low"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{b.identifier}</p>
                      <p className="text-xs text-on-surface-variant">
                        {b.wardName} / {b.roomName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <FormField label="Attending Doctor (optional)">
                <select className={formInputClass} value={assignedStaffId} onChange={(e) => setAssignedStaffId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          )}
        </FormSection>
      )}
    </Drawer>
  );
}
