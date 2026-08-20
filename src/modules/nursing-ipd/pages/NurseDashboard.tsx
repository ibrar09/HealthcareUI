import { useEffect, useMemo, useState } from "react";
import { NurseLayout } from "@/layouts/NurseLayout";
import { NurseGreetingHero } from "@modules/nursing-ipd/components/NurseGreetingHero";
import { NurseStatsRow } from "@modules/nursing-ipd/components/NurseStatsRow";
import { MyPatientsPreview } from "@modules/nursing-ipd/components/MyPatientsPreview";
import { NeedsAttentionPanel } from "@modules/nursing-ipd/components/NeedsAttentionPanel";
import * as api from "@modules/nursing-ipd/api";
import type { NurseShift, NursePatient, AttentionItem } from "@modules/nursing-ipd/api";

interface DashboardStats {
  myPatients: number;
  critical: number;
  medicationsDue: number;
  tasksDue: number;
  vitalsDue: number;
  pending: number;
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2 };

export function NurseDashboard() {
  const [shift, setShift] = useState<NurseShift | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);

  useEffect(() => {
    api.getShift().then(setShift);
    api.getDashboardStats().then(setStats);
    api.getMyPatients().then(setPatients);
    api.getAttentionItems().then(setAttentionItems);
  }, []);

  const topAttention = useMemo(
    () => [...attentionItems].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])[0] ?? null,
    [attentionItems]
  );
  const topAttentionPatient = topAttention ? patients.find((p) => p.id === topAttention.patientId) ?? null : null;

  return (
    <NurseLayout active="Dashboard">
      <NurseGreetingHero shift={shift} topAttention={topAttention} topAttentionPatient={topAttentionPatient} />

      <NurseStatsRow stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <MyPatientsPreview patients={patients} />
        </div>
        <NeedsAttentionPanel items={attentionItems} />
      </div>
    </NurseLayout>
  );
}
