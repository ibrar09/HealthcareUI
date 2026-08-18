import { mockRequest } from "@shared/lib/api/client";

export type HelpCategory =
  | "Getting Started" | "Patients & Records" | "Prescriptions & Orders"
  | "Appointments & Scheduling" | "Billing" | "Account & Security";

export interface HelpArticle {
  id: string;
  category: HelpCategory;
  question: string;
  answer: string;
}

// Answers reference the real Doctor Portal screens already built, not
// generic filler — this is meant to actually help someone using this app.
const helpArticles: HelpArticle[] = [
  {
    id: "help-1", category: "Getting Started", question: "Where do I see my day at a glance?",
    answer: "The Overview dashboard shows today's appointments, the ongoing consultation, follow-up patients, and reports awaiting your review. Appointments also has its own \"Today's Clinical Brief\" panel with critical alerts and abnormal results.",
  },
  {
    id: "help-2", category: "Getting Started", question: "What do the patient status colors mean?",
    answer: "🟢 Stable, 🟡 Attention (something needs review), 🟠 High Risk (needs closer monitoring), 🔴 Critical, 🔵 Follow-up (a scheduled review is due). These appear on My Patients, Quick View, and Patient Detail.",
  },
  {
    id: "help-3", category: "Patients & Records", question: "How do I see a patient's full medical history?",
    answer: "Open My Patients, click a row to open Quick View for a fast summary, or click \"Open Patient\" for the full Patient Detail record — visits, diagnoses, medications, orders, labs, and notes as one filterable timeline.",
  },
  {
    id: "help-4", category: "Patients & Records", question: "Why can't I find a patient's DOB or phone in the main list?",
    answer: "My Patients searches across name, MRN, patient ID, encounter number, phone, DOB, diagnosis, and medication — even if those columns aren't visible. Use the search bar, or add the column via the \"Columns\" button.",
  },
  {
    id: "help-5", category: "Patients & Records", question: "How do allergies show up?",
    answer: "Allergies are never hidden behind a menu — they show directly on the patient row, Quick View, and Patient Detail as a red-highlighted banner or badge whenever present.",
  },
  {
    id: "help-6", category: "Prescriptions & Orders", question: "How do I start a clinical encounter?",
    answer: "From Patient Detail, click \"Start Encounter\"; from a patient row's quick actions or the dashboard's ongoing consultation card, the same workspace opens. Diagnosis, prescription, and lab/imaging orders are separate sections since they're different clinical objects.",
  },
  {
    id: "help-7", category: "Prescriptions & Orders", question: "How do I check if a medication is in stock before prescribing?",
    answer: "Product & Stock has a searchable formulary with live availability. While writing a prescription in the Encounter Workspace, typing the medication name shows its stock status inline, with an alternative suggested if it's low or out of stock.",
  },
  {
    id: "help-8", category: "Prescriptions & Orders", question: "Can I finish an encounter without adding anything?",
    answer: "No — Finish Encounter is disabled until at least one diagnosis, prescription, order, or note has been recorded, so an encounter always leaves a real clinical trace.",
  },
  {
    id: "help-9", category: "Appointments & Scheduling", question: "How do I reschedule or cancel an appointment?",
    answer: "Open the appointment's \"⋮\" menu from the Appointments list, Calendar, or Queue view. Cancelling always asks for a reason, which is kept for the record.",
  },
  {
    id: "help-10", category: "Appointments & Scheduling", question: "Where do pending appointment requests show up?",
    answer: "Requests & Waitlist, reachable from Appointments — pending requests appear there regardless of what date they're tentatively proposed for, so you don't have to browse to a future date to find them.",
  },
  {
    id: "help-11", category: "Appointments & Scheduling", question: "How do I set my working hours or block time off?",
    answer: "Schedule (sidebar) lets you set weekly working hours, breaks, and blocked time/leave. Booking a slot outside your working hours or on a blocked date shows a warning, but doesn't block it — some exceptions are legitimate.",
  },
  {
    id: "help-12", category: "Appointments & Scheduling", question: "What's the difference between the Queue and the Appointments list?",
    answer: "The Appointments list shows any day's schedule with full detail and every status. Queue is a live, today-only view built for the moment you're in clinic: who's now, who's next, and who's still waiting.",
  },
  {
    id: "help-13", category: "Billing", question: "How is my monthly payout calculated?",
    answer: "Payment shows your earnings computed live from actual completed appointments joined with your per-visit-type consultation rate. Rates are set by City General Hospital and aren't self-editable.",
  },
  {
    id: "help-14", category: "Billing", question: "Can I see past payouts?",
    answer: "Yes — Payment includes a Payout History section listing each past paid period, most recent first. The current month's not-yet-paid earnings show as \"Pending Payout\" instead of a history row.",
  },
  {
    id: "help-15", category: "Account & Security", question: "How do I reset my password?",
    answer: "Contact IT Support — password resets go through them, not self-service, to keep account recovery auditable.",
  },
  {
    id: "help-16", category: "Account & Security", question: "Is my patient data secure?",
    answer: "Sessions are HIPAA-compliant with auto-logout after 15 minutes of inactivity. Never share your login, and always sign out on a shared device.",
  },
];

export const getHelpArticles = () => mockRequest([...helpArticles]);

export interface SupportTicketInput {
  subject: string;
  description: string;
}

export function submitSupportTicket(input: SupportTicketInput) {
  return mockRequest({ ...input, id: `ticket-${Date.now()}`, submittedAt: "just now" });
}
