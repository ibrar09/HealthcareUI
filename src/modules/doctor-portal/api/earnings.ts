import { mockRequest } from "@shared/lib/api/client";
import type { VisitType } from "./index";

// Doctor Portal's Earnings module — the doctor's own compensation, not the
// hospital's revenue cycle (that's Hospital Admin's Billing module, which
// this deliberately doesn't duplicate). Rates are set by the hospital, so
// they're read-only here — a doctor doesn't self-set their own consultation
// fee. "This month" figures are computed live in the page from actual
// completed appointments rather than stored, so they can never drift out of
// sync with the real schedule.

export interface ConsultationRate {
  visitType: VisitType;
  rate: number; // PKR
}

export type PayoutStatus = "Paid" | "Processing";

export interface PayoutRecord {
  id: string;
  period: string; // "Jul 2026"
  consultationCount: number;
  amount: number;
  status: PayoutStatus;
  paidOn?: string;
}

const consultationRates: ConsultationRate[] = [
  { visitType: "New Consultation", rate: 3000 },
  { visitType: "Follow-up", rate: 1500 },
  { visitType: "Second Opinion", rate: 3500 },
  { visitType: "Chronic Disease Review", rate: 2000 },
  { visitType: "Post-Operative Follow-up", rate: 1800 },
  { visitType: "Procedure", rate: 6000 },
  { visitType: "Lab Consultation", rate: 1200 },
  { visitType: "Imaging Review", rate: 1200 },
  { visitType: "Telemedicine", rate: 1500 },
  { visitType: "Annual Check-up", rate: 2500 },
];

const payoutHistory: PayoutRecord[] = [
  { id: "payout-1", period: "Jun 2026", consultationCount: 41, amount: 87500, status: "Paid", paidOn: "05 Jul 2026" },
  { id: "payout-2", period: "Jul 2026", consultationCount: 46, amount: 96200, status: "Paid", paidOn: "05 Aug 2026" },
];

export const getConsultationRates = () => mockRequest([...consultationRates]);
export const getPayoutHistory = () => mockRequest([...payoutHistory]);
