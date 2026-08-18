import { useEffect, useState } from "react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { WorkingHoursCard } from "@modules/doctor-portal/components/WorkingHoursCard";
import { BlockedTimeCard } from "@modules/doctor-portal/components/BlockedTimeCard";
import { SlotDurationCard } from "@modules/doctor-portal/components/SlotDurationCard";
import * as api from "@modules/doctor-portal/api";
import type { DayHours, BlockedTime, SlotDurationConfig } from "@modules/doctor-portal/api";

export function Schedule() {
  const [hours, setHours] = useState<DayHours[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [durations, setDurations] = useState<SlotDurationConfig[]>([]);

  useEffect(() => {
    api.getWorkingHours().then(setHours);
    api.getBlockedTimes().then(setBlockedTimes);
    api.getSlotDurations().then(setDurations);
  }, []);

  return (
    <DoctorLayout active="Schedules">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Schedule</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your working hours, breaks, blocked time, and default appointment durations.</p>
      </div>

      <WorkingHoursCard hours={hours} onChange={(day, updates) => api.updateDayHours(day, updates).then(setHours)} />

      <BlockedTimeCard
        blockedTimes={blockedTimes}
        onAdd={(input) => api.addBlockedTime(input).then(setBlockedTimes)}
        onRemove={(id) => api.removeBlockedTime(id).then(setBlockedTimes)}
      />

      <SlotDurationCard durations={durations} onChange={(visitType, minutes) => api.updateSlotDuration(visitType, minutes).then(setDurations)} />
    </DoctorLayout>
  );
}
