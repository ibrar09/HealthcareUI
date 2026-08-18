import { useEffect, useMemo, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { EarningsSummary } from "@modules/doctor-portal/components/EarningsSummary";
import { EarningsBreakdown } from "@modules/doctor-portal/components/EarningsBreakdown";
import { PayoutHistory } from "@modules/doctor-portal/components/PayoutHistory";
import * as api from "@modules/doctor-portal/api";
import type { Appointment, ConsultationRate, PayoutRecord, VisitType } from "@modules/doctor-portal/api";

export function Payment() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rates, setRates] = useState<ConsultationRate[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);

  useEffect(() => {
    api.getAppointments().then(setAppointments);
    api.getConsultationRates().then(setRates);
    api.getPayoutHistory().then(setPayouts);
  }, []);

  const thisMonthPrefix = api.TODAY_ISO.slice(0, 7); // "2026-08"
  const completedThisMonth = useMemo(
    () => appointments.filter((a) => a.status === "Completed" && a.date.startsWith(thisMonthPrefix)),
    [appointments, thisMonthPrefix]
  );

  const rateFor = (visitType: VisitType) => rates.find((r) => r.visitType === visitType)?.rate ?? 0;

  const breakdownRows = useMemo(
    () =>
      rates.map((r) => ({
        visitType: r.visitType,
        count: completedThisMonth.filter((a) => a.visitType === r.visitType).length,
        rate: r.rate,
      })),
    [rates, completedThisMonth]
  );

  const thisMonthEarnings = completedThisMonth.reduce((sum, a) => sum + rateFor(a.visitType), 0);
  const lastPayout = payouts.length > 0 ? payouts[payouts.length - 1] : null;

  return (
    <DoctorLayout active="Payment">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">My Earnings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your consultation payouts from City General Hospital.</p>
      </div>

      <EarningsSummary thisMonthEarnings={thisMonthEarnings} thisMonthConsultations={completedThisMonth.length} lastPayout={lastPayout} />

      <EarningsBreakdown rows={breakdownRows} />

      <PayoutHistory payouts={payouts} />
    </DoctorLayout>
  );
}
