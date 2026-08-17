/**
 * Shared status vocabularies used across modules — e.g. an Appointment's
 * status, a Lab Result's status. Centralizing these avoids one module
 * typing "In-Progress" and another "in_progress" for the same concept.
 */
export const APPOINTMENT_STATUS = {
  REQUESTED: "requested",
  BOOKED: "booked",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
} as const;

export const LAB_RESULT_STATUS = {
  PRELIMINARY: "preliminary",
  FINAL: "final",
  CORRECTED: "corrected",
  CANCELLED: "cancelled",
  ENTERED_IN_ERROR: "entered-in-error",
} as const;

export const ORDER_STATUS = {
  CREATED: "created",
  SENT: "sent",
  IN_PROGRESS: "in-progress",
  RESULT_READY: "result-ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;
