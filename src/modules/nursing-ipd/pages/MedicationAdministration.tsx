import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, CheckCircle2, PauseCircle, XCircle, PackageX } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { ROUTES } from "@/constants/routes";
import { MedicationReasonModal } from "@modules/nursing-ipd/components/MedicationReasonModal";
import * as api from "@modules/nursing-ipd/api";
import type { MedicationOrder, MedicationSummary, NursePatient, MedicationAdminStatus } from "@modules/nursing-ipd/api";

type FilterKey = "all" | "due" | "overdue" | "administered" | "scheduled";

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "due", label: "Due" },
  { key: "scheduled", label: "Scheduled" },
  { key: "administered", label: "Administered" },
];

const STATUS_STYLE: Record<MedicationAdminStatus, string> = {
  Scheduled: "bg-slate-100 text-slate-600 border-slate-200",
  Due: "bg-amber-50 text-amber-700 border-amber-100",
  Administered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Held: "bg-orange-50 text-orange-700 border-orange-100",
  Refused: "bg-rose-50 text-rose-700 border-rose-100",
  "Not Available": "bg-rose-50 text-rose-700 border-rose-100",
};

export function MedicationAdministration() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MedicationOrder[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [summary, setSummary] = useState<MedicationSummary | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [reasonTarget, setReasonTarget] = useState<{ order: MedicationOrder; mode: "Held" | "Refused" | "Not Available" } | null>(null);

  function refresh() {
    api.getMedicationOrders().then(setOrders);
    api.getMyPatients().then(setPatients);
    api.getMedicationSummary().then(setSummary);
  }

  useEffect(refresh, []);

  const filtered = useMemo(() => {
    return [...orders]
      .filter((o) => {
        if (filter === "all") return true;
        if (filter === "overdue") return api.isOverdue(o);
        if (filter === "due") return o.status === "Due" && !api.isOverdue(o);
        if (filter === "administered") return o.status === "Administered";
        if (filter === "scheduled") return o.status === "Scheduled";
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [orders, filter]);

  function handleAdminister(id: string) {
    api.administerMedication(id).then(() => refresh());
  }

  return (
    <NurseLayout active="Medications">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Medication Administration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Today's medication schedule across your assigned patients.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: "Overdue", value: summary?.overdue ?? 0, tone: "critical" as const },
          { label: "Due", value: summary?.due ?? 0, tone: "warning" as const },
          { label: "Administered", value: summary?.administered ?? 0, tone: "default" as const },
          { label: "Scheduled", value: summary?.scheduled ?? 0, tone: "default" as const },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex-1 min-w-[130px]">
            <p className={`text-xl font-bold ${s.tone === "critical" ? "text-rose-600" : s.tone === "warning" ? "text-amber-600" : "text-slate-800"}`}>{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.key === filter;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                isActive ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">No medications match this view.</p>
        ) : (
          filtered.map((order) => {
            const patient = patients.find((p) => p.id === order.patientId);
            if (!patient) return null;
            const overdue = api.isOverdue(order);

            return (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-14 flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">{order.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.NURSING.PATIENT_DETAIL(patient.id))}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-80"
                >
                  <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                    <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
                  </div>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5 text-slate-400" /> {order.name} {order.dose}</p>
                  <p className="text-[11px] text-slate-400 ml-5">{order.route}</p>
                  {order.reason && <p className="text-[11px] text-slate-400 ml-5 mt-0.5">Reason: {order.reason}</p>}
                  {order.administeredAt && <p className="text-[11px] text-emerald-600 ml-5 mt-0.5">Given at {order.administeredAt}</p>}
                </div>

                <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 ${overdue ? "bg-rose-50 text-rose-700 border-rose-100" : STATUS_STYLE[order.status]}`}>
                  {overdue ? "Overdue" : order.status}
                </span>

                {(order.status === "Due") && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button type="button" onClick={() => handleAdminister(order.id)} className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Administer
                    </button>
                    <button type="button" onClick={() => setReasonTarget({ order, mode: "Held" })} title="Hold" className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg">
                      <PauseCircle className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setReasonTarget({ order, mode: "Refused" })} title="Patient Refused" className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setReasonTarget({ order, mode: "Not Available" })} title="Not Available" className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg">
                      <PackageX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {reasonTarget && (
        <MedicationReasonModal
          mode={reasonTarget.mode}
          order={reasonTarget.order}
          patientName={patients.find((p) => p.id === reasonTarget.order.patientId)?.name ?? ""}
          onClose={() => setReasonTarget(null)}
          onConfirm={(reason) => {
            api.updateMedicationStatus(reasonTarget.order.id, reasonTarget.mode, reason).then(() => {
              refresh();
              setReasonTarget(null);
            });
          }}
        />
      )}
    </NurseLayout>
  );
}
