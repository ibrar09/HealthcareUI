import { useEffect, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { SummaryCards } from "@modules/doctor-portal/components/SummaryCards";
import { AppointmentsTimeline } from "@modules/doctor-portal/components/AppointmentsTimeline";
import { OngoingConsultationCard } from "@modules/doctor-portal/components/OngoingConsultationCard";
import { FollowUpPatientsPanel } from "@modules/doctor-portal/components/FollowUpPatientsPanel";
import { ReviewReportsPanel } from "@modules/doctor-portal/components/ReviewReportsPanel";
import * as api from "@modules/doctor-portal/api";
import type { DoctorAppointment, SummaryCardData, FollowUpPatient, ReviewReport, AttendedProgress } from "@modules/doctor-portal/api";

export function DoctorDashboard() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpPatient[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [progress, setProgress] = useState<AttendedProgress | null>(null);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  function refreshAppointments() {
    api.getDoctorAppointments().then(setAppointments);
  }

  useEffect(() => {
    refreshAppointments();
    api.getSummaryCards().then(setSummaryCards);
    api.getFollowUpPatients().then(setFollowUps);
    api.getReviewReports().then(setReports);
    api.getAttendedProgress().then(setProgress);
  }, []);

  useEffect(() => {
    const ongoing = appointments.find((a) => a.status === "ongoing");
    if (ongoing && !activePatientId) setActivePatientId(ongoing.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments]);

  const activePatient = appointments.find((a) => a.id === activePatientId) ?? null;

  async function handleSaveNotes(appointmentId: string, notes: string) {
    await api.saveConsultationNotes(appointmentId, notes);
    refreshAppointments();
  }

  async function handleFinish(appointmentId: string) {
    await api.completeConsultation(appointmentId);
    refreshAppointments();
  }

  return (
    <DoctorLayout active="Overview">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Good morning, Dr. Raza</h1>
        <p className="text-xs text-slate-500 mt-0.5">Here's what's happening with your patients today.</p>
      </div>

      <SummaryCards cards={summaryCards} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 xl:order-1">
          <OngoingConsultationCard patient={activePatient} onSaveNotes={handleSaveNotes} onFinish={handleFinish} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FollowUpPatientsPanel patients={followUps} />
            <ReviewReportsPanel reports={reports} />
          </div>
        </div>

        <div className="xl:col-span-2 xl:order-2">
          <AppointmentsTimeline appointments={appointments} progress={progress} activePatientId={activePatientId} onSelectPatient={setActivePatientId} />
        </div>
      </div>
    </DoctorLayout>
  );
}
