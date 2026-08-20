import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, CareTeamMember } from "@modules/nursing-ipd/api";

export function CareTeam() {
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [team, setTeam] = useState<CareTeamMember[]>([]);

  useEffect(() => {
    api.getMyPatients().then(setPatients);
    api.getCareTeam().then(setTeam);
  }, []);

  return (
    <NurseLayout active="Care Team">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Care Team</h1>
        <p className="text-xs text-slate-500 mt-0.5">Assigned care team members across your patients.</p>
      </div>

      <div className="flex flex-col gap-4">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <img src={patient.avatar} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                <p className="text-[11px] text-slate-400">Room {patient.room} · Bed {patient.bed}</p>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-slate-50">
              {team.filter((m) => m.patientId === patient.id).map((m) => (
                <div key={`${m.patientId}-${m.name}`} className="flex items-center gap-2.5 py-2">
                  <UserCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <p className="text-xs font-semibold text-slate-700">{m.name}</p>
                  <span className="text-[11px] text-slate-400">· {m.role}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </NurseLayout>
  );
}
