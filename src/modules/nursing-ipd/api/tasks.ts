import { mockRequest } from "@shared/lib/api/client";
import { syncPendingTasks } from "./patients";

// Unified shift worklist — pulls the per-patient `pendingTasks` count (used
// by Dashboard/My Patients cards) into real, actionable items. This file is
// the source of truth for that count: completing a task here recomputes it,
// same discipline as medications.ts/assessments.ts syncing their own fields.

export type TaskCategory = "Mobility" | "Hygiene" | "Documentation" | "Other";
export type TaskStatus = "Pending" | "Completed";

export interface NurseTask {
  id: string;
  patientId: string;
  label: string;
  category: TaskCategory;
  dueTime: string;
  status: TaskStatus;
  completedAt?: string;
}

let tasks: NurseTask[] = [
  { id: "task-1", patientId: "np-1", label: "Reposition patient (2-hourly)", category: "Mobility", dueTime: "09:30", status: "Pending" },
  { id: "task-2", patientId: "np-1", label: "Change IV line dressing", category: "Hygiene", dueTime: "11:00", status: "Pending" },
  { id: "task-3", patientId: "np-1", label: "Sputum sample collection", category: "Other", dueTime: "12:00", status: "Pending" },

  { id: "task-4", patientId: "np-2", label: "Ambulate patient — post-op day 1", category: "Mobility", dueTime: "10:00", status: "Pending" },
  { id: "task-5", patientId: "np-2", label: "Surgical wound dressing check", category: "Hygiene", dueTime: "13:00", status: "Pending" },

  { id: "task-6", patientId: "np-3", label: "Incentive spirometry review", category: "Documentation", dueTime: "09:00", status: "Pending" },

  { id: "task-7", patientId: "np-5", label: "Daily weight measurement", category: "Other", dueTime: "08:30", status: "Pending" },
  { id: "task-8", patientId: "np-5", label: "Fluid intake/output chart update", category: "Documentation", dueTime: "14:00", status: "Pending" },

  { id: "task-9", patientId: "np-6", label: "Wound dressing change — cellulitis site", category: "Hygiene", dueTime: "11:00", status: "Pending" },
];

export const getTasks = () => mockRequest([...tasks]);

export interface TaskSummary {
  pending: number;
  completed: number;
}

export function getTaskSummary(): Promise<TaskSummary> {
  return mockRequest({
    pending: tasks.filter((t) => t.status === "Pending").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  });
}

function recomputePendingTasks(patientId: string) {
  const count = tasks.filter((t) => t.patientId === patientId && t.status === "Pending").length;
  syncPendingTasks(patientId, count);
}

export function completeTask(id: string) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.status = "Completed";
    task.completedAt = "just now";
    recomputePendingTasks(task.patientId);
  }
  tasks = [...tasks];
  return mockRequest([...tasks]);
}
