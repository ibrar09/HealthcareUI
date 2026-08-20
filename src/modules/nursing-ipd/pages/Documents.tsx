import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { NurseLayout } from "@/layouts/NurseLayout";
import * as api from "@modules/nursing-ipd/api";
import type { NursePatient, PatientDocument } from "@modules/nursing-ipd/api";

export function Documents() {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [patients, setPatients] = useState<NursePatient[]>([]);

  useEffect(() => {
    api.getDocuments().then(setDocuments);
    api.getMyPatients().then(setPatients);
  }, []);

  return (
    <NurseLayout active="Documents">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Documents</h1>
        <p className="text-xs text-slate-500 mt-0.5">Patient documents across your assigned patients.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {documents.map((doc) => {
          const patient = patients.find((p) => p.id === doc.patientId);
          if (!patient) return null;
          return (
            <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{doc.title}</p>
                <p className="text-[11px] text-slate-400">{patient.name} · Room {patient.room}</p>
              </div>
              <span className="text-[11px] font-semibold border rounded-full px-2.5 py-1 flex-shrink-0 bg-slate-100 text-slate-600 border-slate-200">{doc.type}</span>
              <span className="text-[11px] text-slate-400 flex-shrink-0">{doc.date}</span>
            </div>
          );
        })}
      </div>
    </NurseLayout>
  );
}
