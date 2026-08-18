import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { ROUTES } from "@/constants/routes";
import { RequestsPanel } from "@modules/doctor-portal/components/RequestsPanel";
import { WaitlistPanel } from "@modules/doctor-portal/components/WaitlistPanel";
import { SlotPickerModal } from "@modules/doctor-portal/components/SlotPickerModal";
import { CancelAppointmentModal } from "@modules/doctor-portal/components/CancelAppointmentModal";
import { BookAppointmentModal } from "@modules/doctor-portal/components/BookAppointmentModal";
import * as api from "@modules/doctor-portal/api";
import type { Appointment, RosterPatient, WaitlistEntry } from "@modules/doctor-portal/api";

export function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [roster, setRoster] = useState<RosterPatient[]>([]);

  const [acceptTarget, setAcceptTarget] = useState<Appointment | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Appointment | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<WaitlistEntry | null>(null);

  function refresh() {
    api.getRequestedAppointments().then(setRequests);
    api.getWaitlist().then(setWaitlist);
  }

  useEffect(() => {
    refresh();
    api.getPatientRoster().then(setRoster);
  }, []);

  return (
    <DoctorLayout active="Appointments">
      <button
        type="button"
        onClick={() => navigate(ROUTES.DOCTOR.APPOINTMENTS)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Appointments
      </button>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Requests & Waitlist</h1>
        <p className="text-xs text-slate-500 mt-0.5">Patients asking for an appointment, and patients waiting for a slot to open up.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <RequestsPanel requests={requests} roster={roster} onAccept={setAcceptTarget} onDecline={setDeclineTarget} />
        <WaitlistPanel
          entries={waitlist}
          roster={roster}
          onSchedule={setScheduleTarget}
          onRemove={(id) => api.removeFromWaitlist(id).then(setWaitlist)}
        />
      </div>

      {acceptTarget && (
        <SlotPickerModal
          mode="accept"
          appointment={acceptTarget}
          patientName={roster.find((p) => p.id === acceptTarget.patientId)?.name ?? ""}
          onClose={() => setAcceptTarget(null)}
          onConfirm={(slot) => {
            api.acceptAppointmentRequest(acceptTarget.id, slot).then(() => { refresh(); setAcceptTarget(null); });
          }}
        />
      )}

      {declineTarget && (
        <CancelAppointmentModal
          mode="decline"
          appointment={declineTarget}
          patientName={roster.find((p) => p.id === declineTarget.patientId)?.name ?? ""}
          onClose={() => setDeclineTarget(null)}
          onConfirm={(reason) => {
            api.declineAppointmentRequest(declineTarget.id, reason).then(() => { refresh(); setDeclineTarget(null); });
          }}
        />
      )}

      {scheduleTarget && (
        <BookAppointmentModal
          roster={roster}
          defaultDate={api.TODAY_ISO}
          initialPatientId={scheduleTarget.patientId}
          initialReason={scheduleTarget.reason}
          onClose={() => setScheduleTarget(null)}
          onConfirm={(input) => {
            api.bookAppointment(input).then(() => {
              api.removeFromWaitlist(scheduleTarget.id).then(setWaitlist);
              setScheduleTarget(null);
            });
          }}
        />
      )}
    </DoctorLayout>
  );
}
