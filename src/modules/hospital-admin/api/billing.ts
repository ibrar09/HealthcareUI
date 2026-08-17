import { mockRequest } from "@shared/lib/api/client";
import { TODAY } from "./core";
import { beds } from "./facilities";
import { patients, getPatientFullName, getIdentifier } from "./patients";
import { appointments } from "./appointments";

// ============================================================================
// Billing & Revenue Cycle Management — Phase 1 (Core Billing)
// Full spec: BILLING_REVENUE_MODULE_SPEC.md (60 sections; build order §61).
// Phase 1 = Dashboard, Patient Financial Account, Charges, Charge Review,
// Invoices, Invoice Details, Payments, Payment Details, Receipts.
// Insurance/Claims/AR/Analytics/Configuration are Phases 2-6 — not built
// yet, so this layer deliberately keeps coverage/insurance amounts as
// billing-staff-entered estimates, never a fabricated adjudication result.
// ============================================================================

const DEFAULT_BILLING_ACTOR = "Zainab Qureshi";

function addDays(dateISO: string, days: number) {
  const d = new Date(`${dateISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(startISO: string, endISO: string) {
  const ms = new Date(`${endISO}T00:00:00`).getTime() - new Date(`${startISO}T00:00:00`).getTime();
  return Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)) + 1);
}

// --- Patient Financial Account (spec §4) ---------------------------------

export type CoverageType = "insurance" | "self-pay" | "corporate";

export interface PatientAccount {
  id: string;
  accountNumber: string;
  patientId: string;
  coverageType: CoverageType;
  payerName?: string;
  createdOn: string;
}

// A few seed patients diversified away from their registration-time
// insuranceProvider so the mock has real self-pay/corporate variety —
// having insurance on file doesn't mean every account bills through it.
const coverageOverrides: Record<string, { coverageType: CoverageType; payerName?: string }> = {
  "p-usman-khan": { coverageType: "self-pay" },
  "p-hassan-abbasi": { coverageType: "self-pay" },
  "p-saira-cheema": { coverageType: "corporate", payerName: "Systems Ltd — Corporate Health Plan" },
};

const patientAccounts: PatientAccount[] = [];

function getOrCreatePatientAccount(patientId: string): PatientAccount {
  const existing = patientAccounts.find((a) => a.patientId === patientId);
  if (existing) return existing;
  const patient = patients.find((p) => p.id === patientId);
  const override = coverageOverrides[patientId];
  const coverageType: CoverageType = override?.coverageType ?? (patient?.insuranceProvider ? "insurance" : "self-pay");
  const payerName = override ? override.payerName : patient?.insuranceProvider;
  const account: PatientAccount = {
    id: `pacc-${patientAccounts.length + 1}`,
    accountNumber: `ACC-${String(patientAccounts.length + 18000001).padStart(8, "0")}`,
    patientId,
    coverageType,
    payerName,
    createdOn: patient?.registeredOn ?? TODAY,
  };
  patientAccounts.push(account);
  return account;
}

// --- Charges (spec §5-6) ---------------------------------------------------
// Minimal internal service reference for Phase 1 charge capture. The
// configurable Service Catalog / Pricing admin screen (spec §8-9) is
// explicitly Phase 6 Administration, not Phase 1.

export type ChargeSourceType = "consultation" | "laboratory" | "radiology" | "pharmacy" | "bed" | "procedure";

export interface BillableService {
  code: string;
  name: string;
  department: string;
  sourceType: ChargeSourceType;
  standardPrice: number;
}

export const billableServices: BillableService[] = [
  { code: "CONS-001", name: "General Consultation", department: "Medicine", sourceType: "consultation", standardPrice: 150 },
  { code: "CONS-002", name: "Specialist Consultation", department: "Cardiology", sourceType: "consultation", standardPrice: 250 },
  { code: "LAB-001", name: "CBC", department: "Laboratory", sourceType: "laboratory", standardPrice: 80 },
  { code: "LAB-002", name: "Basic Metabolic Panel", department: "Laboratory", sourceType: "laboratory", standardPrice: 120 },
  { code: "RAD-001", name: "X-Ray", department: "Radiology", sourceType: "radiology", standardPrice: 250 },
  { code: "RAD-002", name: "MRI", department: "Radiology", sourceType: "radiology", standardPrice: 1800 },
  { code: "PHARM-001", name: "Medication Dispensing", department: "Pharmacy", sourceType: "pharmacy", standardPrice: 60 },
  { code: "BED-STD", name: "Standard Bed — Daily Charge", department: "Inpatient", sourceType: "bed", standardPrice: 500 },
  { code: "BED-ICU", name: "ICU Bed — Daily Charge", department: "Inpatient", sourceType: "bed", standardPrice: 1500 },
  { code: "BED-ER", name: "Emergency Bay — Daily Charge", department: "Emergency", sourceType: "bed", standardPrice: 700 },
  { code: "BED-POSTOP", name: "Post-Operative Bed — Daily Charge", department: "Inpatient", sourceType: "bed", standardPrice: 900 },
  { code: "PROC-001", name: "Minor Procedure", department: "Surgery", sourceType: "procedure", standardPrice: 400 },
];

export const getBillableServices = () => mockRequest(billableServices);

function resolveService(code: string) {
  return billableServices.find((s) => s.code === code);
}

function bedServiceCodeFor(bedTypeId: string): string {
  if (bedTypeId === "bt-icu") return "BED-ICU";
  if (bedTypeId === "bt-emergency") return "BED-ER";
  if (bedTypeId === "bt-post-op") return "BED-POSTOP";
  return "BED-STD";
}

export type ChargeStatus = "pending-review" | "validated" | "billed" | "reversed";

export interface Charge {
  id: string;
  patientId: string;
  appointmentId?: string;
  serviceCode: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  status: ChargeStatus;
  invoiceId?: string;
  capturedOn: string;
  capturedBy: string;
}

let chargeIdCounter = 0;
function nextChargeId() {
  chargeIdCounter += 1;
  return `chg-${chargeIdCounter}`;
}

const charges: Charge[] = [];

// Consultation charges auto-generated from today's completed encounters —
// this is the "clinical system generates the charge" pattern spec §6 asks
// for, not manual entry. Freshly captured, so they still need review.
appointments
  .filter((a) => a.status === "completed")
  .forEach((apt) => {
    const price = resolveService("CONS-001")!.standardPrice;
    charges.push({
      id: nextChargeId(),
      patientId: apt.patientId,
      appointmentId: apt.id,
      serviceCode: "CONS-001",
      quantity: 1,
      unitPrice: price,
      amount: price,
      status: "pending-review",
      capturedOn: TODAY,
      capturedBy: "Encounter Close-Out",
    });
  });

// Running daily bed charges generated from Bed Management's currently
// occupied beds (spec §43) — already coded/validated, since these are
// system-computed, not manually keyed.
beds
  .filter((b) => b.status === "occupied" && b.patientId && b.admissionDate)
  .forEach((b) => {
    const svcCode = bedServiceCodeFor(b.bedTypeId);
    const svc = resolveService(svcCode)!;
    const days = daysBetween(b.admissionDate!, TODAY);
    charges.push({
      id: nextChargeId(),
      patientId: b.patientId!,
      serviceCode: svcCode,
      quantity: days,
      unitPrice: svc.standardPrice,
      amount: days * svc.standardPrice,
      status: "validated",
      capturedOn: TODAY,
      capturedBy: "Bed Management — Running Charge",
    });
  });

charges.push(
  { id: nextChargeId(), patientId: "p-ayesha-raza", serviceCode: "LAB-001", quantity: 1, unitPrice: 80, amount: 80, status: "validated", capturedOn: "2026-08-13", capturedBy: "Laboratory — Auto Charge" },
  { id: nextChargeId(), patientId: "p-kamal-siddiqui", serviceCode: "RAD-001", quantity: 1, unitPrice: 250, amount: 250, status: "pending-review", capturedOn: TODAY, capturedBy: "Radiology — Auto Charge" }
);

// Historical, already-billed charges backing the two seed invoices below.
const rashidConsultCharge: Charge = { id: nextChargeId(), patientId: "p-rashid-qureshi", serviceCode: "CONS-001", quantity: 1, unitPrice: 150, amount: 150, status: "billed", invoiceId: "inv-1", capturedOn: "2026-08-01", capturedBy: "Encounter Close-Out" };
const rashidLabCharge: Charge = { id: nextChargeId(), patientId: "p-rashid-qureshi", serviceCode: "LAB-002", quantity: 1, unitPrice: 120, amount: 120, status: "billed", invoiceId: "inv-1", capturedOn: "2026-08-01", capturedBy: "Laboratory — Auto Charge" };
charges.push(rashidConsultCharge, rashidLabCharge);

const laylaConsultCharge: Charge = { id: nextChargeId(), patientId: "p-layla-awan", serviceCode: "CONS-002", quantity: 1, unitPrice: 250, amount: 250, status: "billed", invoiceId: "inv-2", capturedOn: "2026-07-20", capturedBy: "Encounter Close-Out" };
charges.push(laylaConsultCharge);

export interface ChargeView {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  appointmentId?: string;
  serviceCode: string;
  serviceName: string;
  department: string;
  sourceType: ChargeSourceType;
  quantity: number;
  unitPrice: number;
  amount: number;
  status: ChargeStatus;
  invoiceId?: string;
  capturedOn: string;
  capturedBy: string;
}

function toChargeView(c: Charge): ChargeView {
  const patient = patients.find((p) => p.id === c.patientId);
  const service = resolveService(c.serviceCode)!;
  return {
    id: c.id,
    patientId: c.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value ?? "—" : "—",
    appointmentId: c.appointmentId,
    serviceCode: c.serviceCode,
    serviceName: service.name,
    department: service.department,
    sourceType: service.sourceType,
    quantity: c.quantity,
    unitPrice: c.unitPrice,
    amount: c.amount,
    status: c.status,
    invoiceId: c.invoiceId,
    capturedOn: c.capturedOn,
    capturedBy: c.capturedBy,
  };
}

export function getCharges(filters: { patientId?: string; status?: ChargeStatus | "all" } = {}) {
  const rows = charges
    .filter((c) => !filters.patientId || c.patientId === filters.patientId)
    .filter((c) => !filters.status || filters.status === "all" || c.status === filters.status)
    .map(toChargeView)
    .sort((a, b) => (a.capturedOn < b.capturedOn ? 1 : -1));
  return mockRequest(rows);
}

export const getChargeReviewQueue = () => mockRequest(charges.filter((c) => c.status === "pending-review").map(toChargeView));

export interface CaptureChargeInput {
  patientId: string;
  serviceCode: string;
  quantity: number;
  appointmentId?: string;
}

/** Manual charge capture — for one-off/missed charges. Most charges should come from clinical systems automatically (spec §6), which the seed data models via the appointment/bed-derived charges above. */
export function captureCharge(input: CaptureChargeInput, performedBy?: string) {
  const service = resolveService(input.serviceCode);
  if (!service) throw new Error("Unknown service code");
  if (input.quantity <= 0) throw new Error("Quantity must be greater than zero");
  const charge: Charge = {
    id: nextChargeId(),
    patientId: input.patientId,
    appointmentId: input.appointmentId,
    serviceCode: input.serviceCode,
    quantity: input.quantity,
    unitPrice: service.standardPrice,
    amount: service.standardPrice * input.quantity,
    status: "pending-review",
    capturedOn: TODAY,
    capturedBy: performedBy ?? DEFAULT_BILLING_ACTOR,
  };
  charges.push(charge);
  return mockRequest(toChargeView(charge));
}

/** Charge Review (spec §7) — the gate a charge must pass before it can be added to an invoice. */
export function validateCharge(chargeId: string) {
  const charge = charges.find((c) => c.id === chargeId);
  if (!charge) throw new Error("Charge not found");
  if (charge.status !== "pending-review") throw new Error("Only a pending-review charge can be validated");
  charge.status = "validated";
  return mockRequest(toChargeView(charge));
}

export function reverseCharge(chargeId: string) {
  const charge = charges.find((c) => c.id === chargeId);
  if (!charge) throw new Error("Charge not found");
  if (charge.status === "billed") throw new Error("Cannot reverse a charge that's already on an invoice — cancel the invoice first");
  charge.status = "reversed";
  return mockRequest(toChargeView(charge));
}

// --- Invoices (spec §15-16) -------------------------------------------------

export type InvoiceStatus = "draft" | "pending-review" | "issued" | "partially-paid" | "paid" | "overdue" | "cancelled" | "void" | "refunded";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  chargeIds: string[];
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  grossAmount: number;
  discountAmount: number;
  /** Billing-staff-entered estimate — no eligibility/adjudication engine exists until Phase 2/3. */
  insuranceAmount: number;
  patientResponsibility: number;
  amountPaid: number;
  createdBy: string;
}

const invoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-000001",
    patientId: "p-rashid-qureshi",
    chargeIds: [rashidConsultCharge.id, rashidLabCharge.id],
    issuedDate: "2026-08-01",
    dueDate: addDays("2026-08-01", 30),
    status: "paid",
    grossAmount: 270,
    discountAmount: 0,
    insuranceAmount: 0,
    patientResponsibility: 270,
    amountPaid: 270,
    createdBy: DEFAULT_BILLING_ACTOR,
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-000002",
    patientId: "p-layla-awan",
    chargeIds: [laylaConsultCharge.id],
    issuedDate: "2026-07-20",
    dueDate: addDays("2026-07-20", 30),
    status: "partially-paid",
    grossAmount: 250,
    discountAmount: 0,
    insuranceAmount: 150,
    patientResponsibility: 100,
    amountPaid: 40,
    createdBy: DEFAULT_BILLING_ACTOR,
  },
];

let invoiceSeq = invoices.length;
function nextInvoiceNumber() {
  invoiceSeq += 1;
  return `INV-2026-${String(invoiceSeq).padStart(6, "0")}`;
}

function effectiveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if ((invoice.status === "issued" || invoice.status === "partially-paid") && TODAY > invoice.dueDate) return "overdue";
  return invoice.status;
}

export interface InvoiceLineItem {
  chargeId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceView {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  lineItems: InvoiceLineItem[];
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  grossAmount: number;
  discountAmount: number;
  insuranceAmount: number;
  patientResponsibility: number;
  amountPaid: number;
  balance: number;
  createdBy: string;
}

function toInvoiceView(inv: Invoice): InvoiceView {
  const patient = patients.find((p) => p.id === inv.patientId);
  const lineItems: InvoiceLineItem[] = inv.chargeIds.map((cid) => {
    const c = charges.find((ch) => ch.id === cid)!;
    const service = resolveService(c.serviceCode)!;
    return { chargeId: c.id, serviceName: service.name, quantity: c.quantity, unitPrice: c.unitPrice, amount: c.amount };
  });
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    patientId: inv.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value ?? "—" : "—",
    lineItems,
    issuedDate: inv.issuedDate,
    dueDate: inv.dueDate,
    status: effectiveInvoiceStatus(inv),
    grossAmount: inv.grossAmount,
    discountAmount: inv.discountAmount,
    insuranceAmount: inv.insuranceAmount,
    patientResponsibility: inv.patientResponsibility,
    amountPaid: inv.amountPaid,
    balance: Math.max(0, inv.patientResponsibility - inv.amountPaid),
    createdBy: inv.createdBy,
  };
}

export function getInvoices(filters: { patientId?: string; status?: InvoiceStatus | "all" } = {}) {
  const rows = invoices
    .filter((i) => !filters.patientId || i.patientId === filters.patientId)
    .filter((i) => !filters.status || filters.status === "all" || effectiveInvoiceStatus(i) === filters.status)
    .map(toInvoiceView)
    .sort((a, b) => (a.issuedDate < b.issuedDate ? 1 : -1));
  return mockRequest(rows);
}

export function getInvoice(id: string) {
  const inv = invoices.find((i) => i.id === id);
  return mockRequest(inv ? toInvoiceView(inv) : null);
}

export interface CreateInvoiceInput {
  patientId: string;
  chargeIds: string[];
  discountAmount?: number;
  insuranceAmount?: number;
}

/** Bills a patient's validated (spec §7 "Billing Ready") charges into a new invoice. */
export function createInvoiceFromCharges(input: CreateInvoiceInput, performedBy?: string) {
  const eligible = charges.filter((c) => input.chargeIds.includes(c.id) && c.patientId === input.patientId && c.status === "validated");
  if (eligible.length === 0) throw new Error("No validated charges selected for this patient");
  const grossAmount = eligible.reduce((sum, c) => sum + c.amount, 0);
  const discountAmount = Math.min(Math.max(0, input.discountAmount ?? 0), grossAmount);
  const insuranceAmount = Math.min(Math.max(0, input.insuranceAmount ?? 0), grossAmount - discountAmount);
  const patientResponsibility = grossAmount - discountAmount - insuranceAmount;
  const invoice: Invoice = {
    id: `inv-${invoices.length + 1}`,
    invoiceNumber: nextInvoiceNumber(),
    patientId: input.patientId,
    chargeIds: eligible.map((c) => c.id),
    issuedDate: TODAY,
    dueDate: addDays(TODAY, 30),
    status: "issued",
    grossAmount,
    discountAmount,
    insuranceAmount,
    patientResponsibility,
    amountPaid: 0,
    createdBy: performedBy ?? DEFAULT_BILLING_ACTOR,
  };
  invoices.push(invoice);
  eligible.forEach((c) => {
    c.status = "billed";
    c.invoiceId = invoice.id;
  });
  return mockRequest(toInvoiceView(invoice));
}

export function cancelInvoice(invoiceId: string, reason: string) {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.amountPaid > 0) throw new Error("Cannot cancel an invoice that already has payments recorded");
  invoice.status = "cancelled";
  charges
    .filter((c) => c.invoiceId === invoiceId)
    .forEach((c) => {
      c.status = "validated";
      c.invoiceId = undefined;
    });
  void reason;
  return mockRequest(toInvoiceView(invoice));
}

// --- Payments (spec §17-19) -------------------------------------------------

export type PaymentMethod = "cash" | "card" | "bank-transfer" | "online" | "insurance" | "corporate";
export type PaymentStatus = "success" | "failed" | "pending";

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  date: string;
  recordedBy: string;
}

const payments: Payment[] = [
  { id: "pay-1", paymentNumber: "PAY-0000001", invoiceId: "inv-1", patientId: "p-rashid-qureshi", amount: 270, method: "card", status: "success", transactionReference: "TXN-88213", date: "2026-08-03", recordedBy: DEFAULT_BILLING_ACTOR },
  { id: "pay-2", paymentNumber: "PAY-0000002", invoiceId: "inv-2", patientId: "p-layla-awan", amount: 40, method: "cash", status: "success", date: "2026-07-25", recordedBy: DEFAULT_BILLING_ACTOR },
];

let paymentSeq = payments.length;
function nextPaymentNumber() {
  paymentSeq += 1;
  return `PAY-${String(paymentSeq).padStart(7, "0")}`;
}

export interface PaymentView {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  date: string;
  recordedBy: string;
}

function toPaymentView(p: Payment): PaymentView {
  const invoice = invoices.find((i) => i.id === p.invoiceId);
  const patient = patients.find((pp) => pp.id === p.patientId);
  return {
    id: p.id,
    paymentNumber: p.paymentNumber,
    invoiceId: p.invoiceId,
    invoiceNumber: invoice?.invoiceNumber ?? "—",
    patientId: p.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    amount: p.amount,
    method: p.method,
    status: p.status,
    transactionReference: p.transactionReference,
    date: p.date,
    recordedBy: p.recordedBy,
  };
}

export function getPayments(filters: { invoiceId?: string; patientId?: string } = {}) {
  const rows = payments
    .filter((p) => !filters.invoiceId || p.invoiceId === filters.invoiceId)
    .filter((p) => !filters.patientId || p.patientId === filters.patientId)
    .map(toPaymentView)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return mockRequest(rows);
}

export function getPayment(id: string) {
  const p = payments.find((pp) => pp.id === id);
  return mockRequest(p ? toPaymentView(p) : null);
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
}

/** Records a payment against an invoice (spec §17-19) — supports partial payment. */
export function recordPayment(input: RecordPaymentInput, performedBy?: string) {
  const invoice = invoices.find((i) => i.id === input.invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (input.amount <= 0) throw new Error("Payment amount must be greater than zero");
  const remaining = invoice.patientResponsibility - invoice.amountPaid;
  if (input.amount > remaining) throw new Error(`Payment exceeds outstanding balance of ${remaining}`);
  const payment: Payment = {
    id: `pay-${payments.length + 1}`,
    paymentNumber: nextPaymentNumber(),
    invoiceId: invoice.id,
    patientId: invoice.patientId,
    amount: input.amount,
    method: input.method,
    status: "success",
    transactionReference: input.transactionReference,
    date: TODAY,
    recordedBy: performedBy ?? DEFAULT_BILLING_ACTOR,
  };
  payments.push(payment);
  invoice.amountPaid += input.amount;
  invoice.status = invoice.amountPaid >= invoice.patientResponsibility ? "paid" : "partially-paid";
  return mockRequest(toPaymentView(payment));
}

// --- Patient Financial Account views (spec §4) ------------------------------

export interface PatientAccountView {
  id: string;
  accountNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  coverageType: CoverageType;
  payerName?: string;
  currentBalance: number;
  insurancePending: number;
  patientResponsibility: number;
  createdOn: string;
}

function buildPatientAccountView(patientId: string): PatientAccountView {
  const account = getOrCreatePatientAccount(patientId);
  const patient = patients.find((p) => p.id === patientId);
  const patientInvoices = invoices.filter((i) => i.patientId === patientId);
  const activeInvoices = patientInvoices.filter((i) => i.status !== "cancelled" && i.status !== "void");
  const currentBalance = activeInvoices.reduce((sum, i) => sum + Math.max(0, i.patientResponsibility - i.amountPaid), 0);
  const insurancePending = account.coverageType === "insurance" ? activeInvoices.reduce((sum, i) => sum + i.insuranceAmount, 0) : 0;
  const patientResponsibility = activeInvoices.reduce((sum, i) => sum + i.patientResponsibility, 0);
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value ?? "—" : "—",
    coverageType: account.coverageType,
    payerName: account.payerName,
    currentBalance,
    insurancePending,
    patientResponsibility,
    createdOn: account.createdOn,
  };
}

export function getPatientAccount(patientId: string) {
  return mockRequest(buildPatientAccountView(patientId));
}

export function getPatientAccounts(search = "") {
  const q = search.trim().toLowerCase();
  const activePatientIds = new Set([...charges.map((c) => c.patientId), ...invoices.map((i) => i.patientId), ...patientAccounts.map((a) => a.patientId)]);
  const rows = Array.from(activePatientIds)
    .map((pid) => buildPatientAccountView(pid))
    .filter((row) => !q || row.patientName.toLowerCase().includes(q) || row.patientMrn.toLowerCase().includes(q) || row.accountNumber.toLowerCase().includes(q))
    .sort((a, b) => b.currentBalance - a.currentBalance);
  return mockRequest(rows);
}

// --- Billing Dashboard (spec §2) --------------------------------------------

export interface BillingDashboardData {
  todaysRevenue: number;
  outstandingReceivables: number;
  patientReceivables: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  partiallyPaidInvoices: number;
  overdueInvoices: number;
  pendingChargeReview: number;
  averageDaysToPayment: number | null;
  agingBuckets: { label: string; amount: number }[];
}

/** Only KPIs Phase 1 data can genuinely support — no fabricated Claims figures (Insurance Claims $, Pending/Rejected/Denied Claims) since Claims don't exist until Phase 3. */
export function getBillingDashboard() {
  const views = invoices.map(toInvoiceView);
  const todaysRevenue = payments.filter((p) => p.date === TODAY && p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const activeViews = views.filter((v) => v.status !== "cancelled" && v.status !== "void");
  const outstandingReceivables = activeViews.reduce((sum, v) => sum + v.balance, 0);

  const daysToPaymentSamples = invoices
    .filter((inv) => inv.status === "paid")
    .map((inv) => {
      const settlingPayment = payments.filter((p) => p.invoiceId === inv.id).sort((a, b) => (a.date > b.date ? -1 : 1))[0];
      if (!settlingPayment) return null;
      return Math.max(0, Math.round((new Date(settlingPayment.date).getTime() - new Date(inv.issuedDate).getTime()) / (24 * 60 * 60 * 1000)));
    })
    .filter((d): d is number => d !== null);
  const averageDaysToPayment = daysToPaymentSamples.length ? Math.round(daysToPaymentSamples.reduce((a, b) => a + b, 0) / daysToPaymentSamples.length) : null;

  const bucketLabels = ["0–30 days", "31–60 days", "61–90 days", "91–120 days", "120+ days"];
  const bucketFor = (days: number) => (days <= 30 ? bucketLabels[0] : days <= 60 ? bucketLabels[1] : days <= 90 ? bucketLabels[2] : days <= 120 ? bucketLabels[3] : bucketLabels[4]);
  const agingMap: Record<string, number> = Object.fromEntries(bucketLabels.map((l) => [l, 0]));
  activeViews
    .filter((v) => v.balance > 0)
    .forEach((v) => {
      const days = Math.round((new Date(`${TODAY}T00:00:00`).getTime() - new Date(`${v.issuedDate}T00:00:00`).getTime()) / (24 * 60 * 60 * 1000));
      agingMap[bucketFor(days)] += v.balance;
    });

  return mockRequest({
    todaysRevenue,
    outstandingReceivables,
    patientReceivables: outstandingReceivables,
    totalInvoices: views.length,
    paidInvoices: views.filter((v) => v.status === "paid").length,
    unpaidInvoices: views.filter((v) => v.status === "issued").length,
    partiallyPaidInvoices: views.filter((v) => v.status === "partially-paid").length,
    overdueInvoices: views.filter((v) => v.status === "overdue").length,
    pendingChargeReview: charges.filter((c) => c.status === "pending-review").length,
    averageDaysToPayment,
    agingBuckets: bucketLabels.map((label) => ({ label, amount: agingMap[label] })),
  } satisfies BillingDashboardData);
}

// ============================================================================
// Billing & Revenue Cycle Management — Phase 2 (Insurance)
// Spec §61 Phase 2: Payers, Insurance Plans, Patient Coverage, Eligibility,
// Authorization, Contracts, Service Pricing. Coverage/Eligibility live inside
// the Patient Account drawer (patient-scoped, per spec §11-12) rather than as
// standalone top-level lists — Payers, Authorizations, and Contracts get
// their own tabs since those are genuinely payer/hospital-scoped registries.
// ============================================================================

// --- Payers & Plans (spec §10) ----------------------------------------------

export type PayerType = "insurance-company" | "government" | "employer-corporate" | "third-party-administrator";

export interface Payer {
  id: string;
  name: string;
  type: PayerType;
  contactPhone?: string;
  contactEmail?: string;
  status: "active" | "inactive";
}

const payers: Payer[] = [
  { id: "payer-state-life", name: "State Life Health", type: "insurance-company", contactPhone: "+92 42 111 000 100", contactEmail: "providers@statelifehealth.example", status: "active" },
  { id: "payer-jubilee", name: "Jubilee Health", type: "insurance-company", contactPhone: "+92 42 111 000 200", contactEmail: "network@jubileehealth.example", status: "active" },
  { id: "payer-efu", name: "EFU Health", type: "insurance-company", contactPhone: "+92 42 111 000 300", contactEmail: "claims@efuhealth.example", status: "active" },
  { id: "payer-systems-ltd", name: "Systems Ltd — Corporate Health Plan", type: "employer-corporate", contactPhone: "+92 42 111 000 400", contactEmail: "benefits@systemsltd.example", status: "active" },
];

export interface NewPayerInput {
  name: string;
  type: PayerType;
  contactPhone?: string;
  contactEmail?: string;
}

export const getPayers = (filters: { includeInactive?: boolean } = {}) => mockRequest(filters.includeInactive ? payers : payers.filter((p) => p.status === "active"));

export function getPayer(id: string) {
  return mockRequest(payers.find((p) => p.id === id) ?? null);
}

export function createPayer(input: NewPayerInput) {
  const payer: Payer = { id: `payer-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${payers.length}`, ...input, status: "active" };
  payers.push(payer);
  return mockRequest(payer);
}

export function updatePayer(id: string, updates: Partial<NewPayerInput>) {
  const payer = payers.find((p) => p.id === id);
  if (payer) Object.assign(payer, updates);
  return mockRequest(payer ?? null);
}

export function setPayerActive(id: string, active: boolean) {
  const payer = payers.find((p) => p.id === id);
  if (payer) payer.status = active ? "active" : "inactive";
  return mockRequest(payer ?? null);
}

export interface InsurancePlan {
  id: string;
  payerId: string;
  name: string;
  planType: string;
  status: "active" | "inactive";
}

const insurancePlans: InsurancePlan[] = [
  { id: "plan-state-life-standard", payerId: "payer-state-life", name: "Standard Plan", planType: "PPO", status: "active" },
  { id: "plan-jubilee-ppo", payerId: "payer-jubilee", name: "PPO Plan", planType: "PPO", status: "active" },
  { id: "plan-efu-standard", payerId: "payer-efu", name: "Standard Plan", planType: "HMO", status: "active" },
  { id: "plan-systems-ltd-corporate", payerId: "payer-systems-ltd", name: "Corporate Employee Plan", planType: "Corporate", status: "active" },
];

export interface InsurancePlanView extends InsurancePlan {
  payerName: string;
}

function toInsurancePlanView(p: InsurancePlan): InsurancePlanView {
  return { ...p, payerName: payers.find((py) => py.id === p.payerId)?.name ?? "Unknown" };
}

export function getInsurancePlans(payerId?: string) {
  return mockRequest(insurancePlans.filter((p) => !payerId || p.payerId === payerId).map(toInsurancePlanView));
}

export interface NewInsurancePlanInput {
  payerId: string;
  name: string;
  planType: string;
}

export function createInsurancePlan(input: NewInsurancePlanInput) {
  const plan: InsurancePlan = { id: `plan-${insurancePlans.length + 1}`, ...input, status: "active" };
  insurancePlans.push(plan);
  return mockRequest(toInsurancePlanView(plan));
}

export function setInsurancePlanActive(id: string, active: boolean) {
  const plan = insurancePlans.find((p) => p.id === id);
  if (plan) plan.status = active ? "active" : "inactive";
  return mockRequest(plan ? toInsurancePlanView(plan) : null);
}

// --- Patient Coverage (spec §11, FHIR Coverage) -----------------------------

export type CoverageRank = "primary" | "secondary";
export type CoverageRecordStatus = "active" | "inactive" | "expired" | "cancelled";
export type SubscriberRelationship = "self" | "spouse" | "child" | "other";

export interface PatientCoverage {
  id: string;
  patientId: string;
  payerId: string;
  planId: string;
  memberId: string;
  policyNumber: string;
  subscriberName: string;
  relationshipToSubscriber: SubscriberRelationship;
  rank: CoverageRank;
  effectiveDate: string;
  expiryDate: string;
  status: CoverageRecordStatus;
}

const patientCoverages: PatientCoverage[] = [
  { id: "cov-1", patientId: "p-rashid-qureshi", payerId: "payer-state-life", planId: "plan-state-life-standard", memberId: "SLH-M-88213", policyNumber: "SLH-30219-S", subscriberName: "Rashid Qureshi", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-2", patientId: "p-layla-awan", payerId: "payer-efu", planId: "plan-efu-standard", memberId: "EFU-M-66210", policyNumber: "EFU-66210-R", subscriberName: "Layla Awan", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-3", patientId: "p-ayesha-raza", payerId: "payer-efu", planId: "plan-efu-standard", memberId: "EFU-M-33021", policyNumber: "EFU-33021-I", subscriberName: "Ayesha Raza", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-4", patientId: "p-kamal-siddiqui", payerId: "payer-state-life", planId: "plan-state-life-standard", memberId: "SLH-M-66432", policyNumber: "SLH-66432-J", subscriberName: "Kamal Siddiqui", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-5", patientId: "p-saira-cheema", payerId: "payer-systems-ltd", planId: "plan-systems-ltd-corporate", memberId: "SYS-M-00147", policyNumber: "SYS-CORP-00147", subscriberName: "Saira Cheema", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-6", patientId: "p-bilal-hussain", payerId: "payer-jubilee", planId: "plan-jubilee-ppo", memberId: "JH-M-90911", policyNumber: "JH-90911-H", subscriberName: "Bilal Hussain", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-7", patientId: "p-ibrar-ahmad", payerId: "payer-state-life", planId: "plan-state-life-standard", memberId: "SLH-M-91820", policyNumber: "SLH-91820-D", subscriberName: "Ibrar Ahmad", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
  { id: "cov-8", patientId: "p-elena-rodriguez", payerId: "payer-efu", planId: "plan-efu-standard", memberId: "EFU-M-22310", policyNumber: "EFU-22310-C", subscriberName: "Elena Rodriguez", relationshipToSubscriber: "self", rank: "primary", effectiveDate: "2026-01-01", expiryDate: "2026-12-31", status: "active" },
];

export interface PatientCoverageView extends PatientCoverage {
  payerName: string;
  planName: string;
}

function toPatientCoverageView(c: PatientCoverage): PatientCoverageView {
  return {
    ...c,
    payerName: payers.find((p) => p.id === c.payerId)?.name ?? "Unknown",
    planName: insurancePlans.find((p) => p.id === c.planId)?.name ?? "Unknown",
  };
}

export function getPatientCoverage(patientId: string) {
  return mockRequest(
    patientCoverages
      .filter((c) => c.patientId === patientId)
      .map(toPatientCoverageView)
      .sort((a, b) => Number(b.rank === "primary") - Number(a.rank === "primary"))
  );
}

export interface NewCoverageInput {
  patientId: string;
  payerId: string;
  planId: string;
  memberId: string;
  policyNumber: string;
  subscriberName: string;
  relationshipToSubscriber: SubscriberRelationship;
  rank: CoverageRank;
  effectiveDate: string;
  expiryDate: string;
}

export function createCoverage(input: NewCoverageInput) {
  const coverage: PatientCoverage = { id: `cov-${patientCoverages.length + 1}`, ...input, status: "active" };
  patientCoverages.push(coverage);
  return mockRequest(toPatientCoverageView(coverage));
}

export function cancelCoverage(id: string) {
  const coverage = patientCoverages.find((c) => c.id === id);
  if (coverage) coverage.status = "cancelled";
  return mockRequest(coverage ? toPatientCoverageView(coverage) : null);
}

// --- Eligibility Verification (spec §12, FHIR CoverageEligibilityRequest/Response) --

export interface EligibilityCheck {
  id: string;
  coverageId: string;
  checkedOn: string;
  eligible: boolean;
  copay: number;
  deductible: number;
  authorizationRequiredServices: string[];
}

const eligibilityChecks: EligibilityCheck[] = [
  { id: "elig-1", coverageId: "cov-1", checkedOn: "2026-08-10", eligible: true, copay: 50, deductible: 500, authorizationRequiredServices: ["MRI", "Surgery"] },
  { id: "elig-2", coverageId: "cov-2", checkedOn: "2026-07-18", eligible: true, copay: 30, deductible: 300, authorizationRequiredServices: ["MRI"] },
];

export function getLatestEligibilityCheck(coverageId: string) {
  const matches = eligibilityChecks.filter((e) => e.coverageId === coverageId).sort((a, b) => (a.checkedOn < b.checkedOn ? 1 : -1));
  return mockRequest(matches[0] ?? null);
}

/** Simulates an eligibility request/response round-trip (spec §12) — deterministic from the coverage's own validity window, since there's no real payer connection to call. */
export function runEligibilityCheck(coverageId: string) {
  const coverage = patientCoverages.find((c) => c.id === coverageId);
  if (!coverage) throw new Error("Coverage not found");
  const eligible = coverage.status === "active" && TODAY >= coverage.effectiveDate && TODAY <= coverage.expiryDate;
  const check: EligibilityCheck = {
    id: `elig-${eligibilityChecks.length + 1}`,
    coverageId,
    checkedOn: TODAY,
    eligible,
    copay: eligible ? 50 : 0,
    deductible: eligible ? 500 : 0,
    authorizationRequiredServices: eligible ? ["MRI", "Surgery"] : [],
  };
  eligibilityChecks.push(check);
  return mockRequest(check);
}

// --- Authorization / Preauthorization (spec §13) ----------------------------

export type AuthorizationStatus = "pending" | "approved" | "rejected" | "expired";

export interface PreAuthorization {
  id: string;
  authNumber: string;
  patientId: string;
  coverageId: string;
  serviceCode: string;
  requestedBy: string;
  requestedOn: string;
  status: AuthorizationStatus;
  decidedOn?: string;
  decisionNotes?: string;
  expiryDate?: string;
}

const preAuthorizations: PreAuthorization[] = [
  { id: "auth-1", authNumber: "AUTH-2026-0001", patientId: "p-bilal-hussain", coverageId: "cov-6", serviceCode: "RAD-002", requestedBy: "Dr. Sarah Jenkins", requestedOn: "2026-08-13", status: "pending" },
  { id: "auth-2", authNumber: "AUTH-2026-0002", patientId: "p-kamal-siddiqui", coverageId: "cov-4", serviceCode: "RAD-001", requestedBy: "Dr. Elena Rostova", requestedOn: "2026-08-12", status: "approved", decidedOn: "2026-08-13", expiryDate: "2026-09-13" },
  { id: "auth-3", authNumber: "AUTH-2026-0003", patientId: "p-rashid-qureshi", coverageId: "cov-1", serviceCode: "PROC-001", requestedBy: "Dr. Robert Vance", requestedOn: "2026-08-05", status: "rejected", decidedOn: "2026-08-06", decisionNotes: "Not medically necessary per payer review" },
  { id: "auth-4", authNumber: "AUTH-2026-0004", patientId: "p-layla-awan", coverageId: "cov-2", serviceCode: "RAD-002", requestedBy: "Dr. Robert Vance", requestedOn: "2026-06-01", status: "expired", decidedOn: "2026-06-02", expiryDate: "2026-07-02" },
];

export interface PreAuthorizationView extends PreAuthorization {
  patientName: string;
  patientMrn: string;
  payerName: string;
  serviceName: string;
}

function toPreAuthorizationView(a: PreAuthorization): PreAuthorizationView {
  const patient = patients.find((p) => p.id === a.patientId);
  const coverage = patientCoverages.find((c) => c.id === a.coverageId);
  const service = resolveService(a.serviceCode);
  return {
    ...a,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value ?? "—" : "—",
    payerName: coverage ? payers.find((p) => p.id === coverage.payerId)?.name ?? "Unknown" : "Unknown",
    serviceName: service?.name ?? a.serviceCode,
  };
}

export function getAuthorizations(filters: { status?: AuthorizationStatus | "all" } = {}) {
  return mockRequest(
    preAuthorizations
      .filter((a) => !filters.status || filters.status === "all" || a.status === filters.status)
      .map(toPreAuthorizationView)
      .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1))
  );
}

export function getAuthorizationStats() {
  return mockRequest({
    pending: preAuthorizations.filter((a) => a.status === "pending").length,
    approved: preAuthorizations.filter((a) => a.status === "approved").length,
    rejected: preAuthorizations.filter((a) => a.status === "rejected").length,
    expired: preAuthorizations.filter((a) => a.status === "expired").length,
  });
}

export interface NewAuthorizationInput {
  patientId: string;
  coverageId: string;
  serviceCode: string;
  requestedBy: string;
}

export function requestAuthorization(input: NewAuthorizationInput) {
  const auth: PreAuthorization = {
    id: `auth-${preAuthorizations.length + 1}`,
    authNumber: `AUTH-2026-${String(preAuthorizations.length + 1).padStart(4, "0")}`,
    ...input,
    requestedOn: TODAY,
    status: "pending",
  };
  preAuthorizations.push(auth);
  return mockRequest(toPreAuthorizationView(auth));
}

export function decideAuthorization(id: string, approve: boolean, notes?: string) {
  const auth = preAuthorizations.find((a) => a.id === id);
  if (!auth) throw new Error("Authorization not found");
  if (auth.status !== "pending") throw new Error("Only a pending authorization can be decided");
  auth.status = approve ? "approved" : "rejected";
  auth.decidedOn = TODAY;
  auth.decisionNotes = notes;
  if (approve) auth.expiryDate = addDays(TODAY, 30);
  return mockRequest(toPreAuthorizationView(auth));
}

// --- Contract Management (spec §45-46) + Service Pricing (spec §8-9) -------

export interface ContractRate {
  serviceCode: string;
  price: number;
}

export interface PayerContract {
  id: string;
  contractNumber: string;
  payerId: string;
  effectiveDate: string;
  expiryDate: string;
  paymentTermsDays: number;
  rates: ContractRate[];
  status: "active" | "expired" | "pending";
}

const payerContracts: PayerContract[] = [
  {
    id: "contract-1",
    contractNumber: "CON-2026-001",
    payerId: "payer-state-life",
    effectiveDate: "2026-01-01",
    expiryDate: "2026-12-31",
    paymentTermsDays: 30,
    rates: [
      { serviceCode: "CONS-001", price: 130 },
      { serviceCode: "LAB-001", price: 70 },
      { serviceCode: "LAB-002", price: 100 },
      { serviceCode: "RAD-001", price: 220 },
      { serviceCode: "BED-STD", price: 450 },
      { serviceCode: "BED-ICU", price: 1400 },
    ],
    status: "active",
  },
  {
    id: "contract-2",
    contractNumber: "CON-2026-002",
    payerId: "payer-efu",
    effectiveDate: "2026-01-01",
    expiryDate: "2026-12-31",
    paymentTermsDays: 30,
    rates: [
      { serviceCode: "CONS-001", price: 140 },
      { serviceCode: "CONS-002", price: 230 },
      { serviceCode: "LAB-001", price: 75 },
      { serviceCode: "BED-STD", price: 480 },
    ],
    status: "active",
  },
  {
    id: "contract-3",
    contractNumber: "CON-2026-003",
    payerId: "payer-jubilee",
    effectiveDate: "2026-01-01",
    expiryDate: "2026-12-31",
    paymentTermsDays: 45,
    rates: [
      { serviceCode: "CONS-001", price: 145 },
      { serviceCode: "BED-ICU", price: 1450 },
    ],
    status: "active",
  },
];

export interface PayerContractView extends PayerContract {
  payerName: string;
}

function toContractView(c: PayerContract): PayerContractView {
  return { ...c, payerName: payers.find((p) => p.id === c.payerId)?.name ?? "Unknown" };
}

export function getContracts(payerId?: string) {
  return mockRequest(payerContracts.filter((c) => !payerId || c.payerId === payerId).map(toContractView));
}

export function getContract(id: string) {
  const contract = payerContracts.find((c) => c.id === id);
  return mockRequest(contract ? toContractView(contract) : null);
}

export interface NewContractInput {
  payerId: string;
  contractNumber: string;
  effectiveDate: string;
  expiryDate: string;
  paymentTermsDays: number;
  rates: ContractRate[];
}

export function createContract(input: NewContractInput) {
  const contract: PayerContract = { id: `contract-${payerContracts.length + 1}`, ...input, status: "active" };
  payerContracts.push(contract);
  return mockRequest(toContractView(contract));
}

export function updateContractRates(id: string, rates: ContractRate[]) {
  const contract = payerContracts.find((c) => c.id === id);
  if (!contract) throw new Error("Contract not found");
  contract.rates = rates;
  return mockRequest(toContractView(contract));
}

/** Cross-payer pricing reference (spec §8-9): each billable service against its standard price and every active contract's negotiated rate. */
export interface ServicePricingRow {
  serviceCode: string;
  serviceName: string;
  department: string;
  standardPrice: number;
  contractRates: { payerId: string; payerName: string; contractNumber: string; price: number }[];
}

export function getServicePricing() {
  const activeContracts = payerContracts.filter((c) => c.status === "active");
  const rows: ServicePricingRow[] = billableServices.map((svc) => ({
    serviceCode: svc.code,
    serviceName: svc.name,
    department: svc.department,
    standardPrice: svc.standardPrice,
    contractRates: activeContracts
      .flatMap((c) => c.rates.filter((r) => r.serviceCode === svc.code).map((r) => ({ payerId: c.payerId, payerName: payers.find((p) => p.id === c.payerId)?.name ?? "Unknown", contractNumber: c.contractNumber, price: r.price })))
      .sort((a, b) => a.price - b.price),
  }));
  return mockRequest(rows);
}

/**
 * Suggests an insurance amount for a set of charges from the patient's active
 * primary coverage's active contract rates — a real, computed estimate from
 * configured contract data, never a fabricated adjudication result (spec §14).
 * Returns 0 when the patient has no active insurance/corporate coverage with
 * a matching contract, leaving the field for manual entry as before.
 */
export function estimateInsuranceAmount(patientId: string, chargeIds: string[]) {
  const coverage = patientCoverages.find((c) => c.patientId === patientId && c.rank === "primary" && c.status === "active");
  if (!coverage) return mockRequest({ amount: 0, payerName: undefined, contractNumber: undefined });
  const contract = payerContracts.find((c) => c.payerId === coverage.payerId && c.status === "active");
  if (!contract) return mockRequest({ amount: 0, payerName: payers.find((p) => p.id === coverage.payerId)?.name, contractNumber: undefined });
  const selected = charges.filter((c) => chargeIds.includes(c.id));
  const amount = selected.reduce((sum, c) => {
    const rate = contract.rates.find((r) => r.serviceCode === c.serviceCode);
    return sum + (rate ? rate.price * c.quantity : 0);
  }, 0);
  return mockRequest({ amount, payerName: payers.find((p) => p.id === coverage.payerId)?.name, contractNumber: contract.contractNumber });
}

// ============================================================================
// Billing & Revenue Cycle Management — Phase 3 (Claims)
// Spec §61 Phase 3: Claims Dashboard, Claim List, Claim Details, Claim
// Validation, Rejections, Denials, Resubmission, Claim History. Claims
// Dashboard is folded into the Claims tab's own KPI row (same call made for
// Service Pricing/Contracts and Coverage/Eligibility/Patient Account in
// Phase 1-2) rather than a separate screen. Rejections don't get a separate
// tab either — a rejected claim is just a Claim status with a Resubmit
// action; Denials get their own tab since spec §28 gives it a genuinely
// separate multi-stage workflow.
//
// Simplification, stated plainly: the spec's dashboard mockup (§24) shows
// "Pending" as a count distinct from "Submitted" with no defined difference
// in this document. Modeling a synthetic status with no real distinct
// behavior would be exactly the kind of decorative field this project
// avoids, so claims here use seven real lifecycle states — draft, ready,
// submitted, accepted, rejected, denied, paid — and skip a separate
// "pending" bucket.
// ============================================================================

export type ClaimStatus = "draft" | "ready" | "submitted" | "accepted" | "rejected" | "denied" | "paid";

export interface Claim {
  id: string;
  claimNumber: string;
  invoiceId: string;
  patientId: string;
  coverageId: string;
  amount: number;
  status: ClaimStatus;
  createdOn: string;
  submittedOn?: string;
  respondedOn?: string;
  rejectionReason?: string;
  paidAmount?: number;
}

const claims: Claim[] = [];

export interface ClaimEvent {
  id: string;
  claimId: string;
  action: string;
  actor: string;
  timestamp: string;
  detail?: string;
}

const claimEvents: ClaimEvent[] = [];

function recordClaimEvent(claim: Claim, action: string, actor: string | undefined, detail?: string) {
  claimEvents.unshift({ id: `clev-${claimEvents.length + 1}`, claimId: claim.id, action, actor: actor ?? DEFAULT_BILLING_ACTOR, timestamp: TODAY, detail });
}

export function getClaimHistory(claimId: string) {
  return mockRequest(claimEvents.filter((e) => e.claimId === claimId));
}

export interface ClaimView {
  id: string;
  claimNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  payerName: string;
  amount: number;
  status: ClaimStatus;
  createdOn: string;
  submittedOn?: string;
  respondedOn?: string;
  rejectionReason?: string;
  paidAmount?: number;
}

function toClaimView(c: Claim): ClaimView {
  const patient = patients.find((p) => p.id === c.patientId);
  const invoice = invoices.find((i) => i.id === c.invoiceId);
  const coverage = patientCoverages.find((cov) => cov.id === c.coverageId);
  return {
    id: c.id,
    claimNumber: c.claimNumber,
    invoiceId: c.invoiceId,
    invoiceNumber: invoice?.invoiceNumber ?? "—",
    patientId: c.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    patientMrn: patient ? getIdentifier(patient.identifiers, "mrn")?.value ?? "—" : "—",
    payerName: coverage ? payers.find((p) => p.id === coverage.payerId)?.name ?? "Unknown" : "Unknown",
    amount: c.amount,
    status: c.status,
    createdOn: c.createdOn,
    submittedOn: c.submittedOn,
    respondedOn: c.respondedOn,
    rejectionReason: c.rejectionReason,
    paidAmount: c.paidAmount,
  };
}

export function getClaims(filters: { status?: ClaimStatus | "all" } = {}) {
  return mockRequest(
    claims
      .filter((c) => !filters.status || filters.status === "all" || c.status === filters.status)
      .map(toClaimView)
      .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
  );
}

export function getClaim(id: string) {
  const claim = claims.find((c) => c.id === id);
  return mockRequest(claim ? toClaimView(claim) : null);
}

/** The invoice's claim, if any (any status — a rejected claim is recovered via Resubmit, not a second claim) — used to gate the "Create Claim" action on Invoice Details. */
export function getClaimByInvoiceId(invoiceId: string) {
  const claim = claims.find((c) => c.invoiceId === invoiceId);
  return mockRequest(claim ? toClaimView(claim) : null);
}

export function getClaimsDashboard() {
  const statuses: ClaimStatus[] = ["draft", "ready", "submitted", "accepted", "rejected", "denied", "paid"];
  const byStatus = Object.fromEntries(statuses.map((s) => [s, claims.filter((c) => c.status === s).length])) as Record<ClaimStatus, number>;
  const totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = claims.reduce((sum, c) => sum + (c.paidAmount ?? 0), 0);
  return mockRequest({ byStatus, totalClaimed, totalPaid });
}

/** Creates a draft Claim for an invoice's insurance-covered portion (spec §23) — the invoice must have an active coverage and a positive insurance amount, and not already have a non-rejected claim. */
export function createClaimFromInvoice(invoiceId: string, performedBy?: string) {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.insuranceAmount <= 0) throw new Error("This invoice has no insurance amount to claim");
  const coverage = patientCoverages.find((c) => c.patientId === invoice.patientId && c.rank === "primary" && c.status === "active");
  if (!coverage) throw new Error("Patient has no active primary coverage");
  const existing = claims.find((c) => c.invoiceId === invoiceId);
  if (existing) throw new Error("This invoice already has a claim — resubmit it instead of creating a new one");
  const claim: Claim = {
    id: `claim-${claims.length + 1}`,
    claimNumber: `CLM-2026-${String(claims.length + 1).padStart(6, "0")}`,
    invoiceId,
    patientId: invoice.patientId,
    coverageId: coverage.id,
    amount: invoice.insuranceAmount,
    status: "draft",
    createdOn: TODAY,
  };
  claims.push(claim);
  recordClaimEvent(claim, "Claim Created", performedBy, `From ${invoice.invoiceNumber}`);
  return mockRequest(toClaimView(claim));
}

export interface ClaimValidationCheck {
  label: string;
  pass: boolean;
  detail?: string;
}

/** Claim Validation (spec §26) — every check is real and independently verifiable; no Documentation check, since nothing in this system tracks clinical documentation completeness yet. */
export function getClaimValidation(claimId: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) return mockRequest([] as ClaimValidationCheck[]);
  const patient = patients.find((p) => p.id === claim.patientId);
  const invoice = invoices.find((i) => i.id === claim.invoiceId);
  const coverage = patientCoverages.find((c) => c.id === claim.coverageId);
  const lineItems = invoice?.chargeIds.map((cid) => charges.find((c) => c.id === cid)).filter((c): c is Charge => Boolean(c)) ?? [];
  const latestEligibility = eligibilityChecks.filter((e) => e.coverageId === claim.coverageId).sort((a, b) => (a.checkedOn < b.checkedOn ? 1 : -1))[0];
  const requiredAuthServiceNames = latestEligibility?.authorizationRequiredServices ?? [];
  const servicesRequiringAuth = lineItems.filter((li) => requiredAuthServiceNames.includes(resolveService(li.serviceCode)?.name ?? ""));
  const authOk = servicesRequiringAuth.every((li) =>
    preAuthorizations.some((a) => a.patientId === claim.patientId && a.serviceCode === li.serviceCode && a.status === "approved")
  );

  const checks: ClaimValidationCheck[] = [
    { label: "Patient", pass: Boolean(patient) },
    { label: "Coverage", pass: Boolean(coverage && coverage.status === "active" && TODAY >= coverage.effectiveDate && TODAY <= coverage.expiryDate) },
    { label: "Provider", pass: lineItems.every((li) => Boolean(li.capturedBy)) && lineItems.length > 0 },
    { label: "Service", pass: lineItems.length > 0 },
    { label: "Coding", pass: lineItems.every((li) => Boolean(resolveService(li.serviceCode))) },
    {
      label: "Authorization",
      pass: authOk,
      detail: servicesRequiringAuth.length > 0 ? `Requires approved authorization for: ${servicesRequiringAuth.map((li) => resolveService(li.serviceCode)?.name).join(", ")}` : undefined,
    },
  ];
  return mockRequest(checks);
}

export async function markClaimReady(claimId: string, performedBy?: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "draft") throw new Error("Only a draft claim can be marked ready");
  const checks = await getClaimValidation(claimId);
  if (!checks.every((c) => c.pass)) throw new Error("Claim failed validation — resolve the failing checks first");
  claim.status = "ready";
  recordClaimEvent(claim, "Marked Ready", performedBy);
  return mockRequest(toClaimView(claim));
}

export function submitClaim(claimId: string, performedBy?: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "ready") throw new Error("Only a ready claim can be submitted");
  claim.status = "submitted";
  claim.submittedOn = TODAY;
  recordClaimEvent(claim, "Submitted to Payer", performedBy);
  return mockRequest(toClaimView(claim));
}

export type DenialStage = "new" | "assigned" | "investigating" | "corrected" | "resubmitted" | "appealed" | "approved" | "denied-again" | "closed";

export interface Denial {
  id: string;
  claimId: string;
  reason: string;
  amount: number;
  assignedTo?: string;
  rootCause?: string;
  appealDeadline?: string;
  stage: DenialStage;
  createdOn: string;
}

const denials: Denial[] = [];

export interface DenialView extends Denial {
  claimNumber: string;
  patientName: string;
  payerName: string;
}

function toDenialView(d: Denial): DenialView {
  const claim = claims.find((c) => c.id === d.claimId);
  const patient = claim ? patients.find((p) => p.id === claim.patientId) : undefined;
  const coverage = claim ? patientCoverages.find((c) => c.id === claim.coverageId) : undefined;
  return {
    ...d,
    claimNumber: claim?.claimNumber ?? "—",
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    payerName: coverage ? payers.find((p) => p.id === coverage.payerId)?.name ?? "Unknown" : "Unknown",
  };
}

export function getDenials(filters: { stage?: DenialStage | "all" } = {}) {
  return mockRequest(denials.filter((d) => !filters.stage || filters.stage === "all" || d.stage === filters.stage).map(toDenialView));
}

const denialStageOrder: DenialStage[] = ["new", "assigned", "investigating", "corrected", "resubmitted", "appealed", "approved", "denied-again", "closed"];

export function advanceDenialStage(denialId: string, stage: DenialStage) {
  const denial = denials.find((d) => d.id === denialId);
  if (!denial) throw new Error("Denial not found");
  denial.stage = stage;
  return mockRequest(toDenialView(denial));
}

export function assignDenial(denialId: string, assignedTo: string) {
  const denial = denials.find((d) => d.id === denialId);
  if (!denial) throw new Error("Denial not found");
  denial.assignedTo = assignedTo;
  if (denial.stage === "new") denial.stage = "assigned";
  return mockRequest(toDenialView(denial));
}

export { denialStageOrder };

/** Records the payer's response to a submitted claim (spec §27): accepted, rejected (data issue — fix + resubmit), or denied (adjudicated, unpaid in whole/part — enters Denial Management). */
export function recordClaimResponse(claimId: string, outcome: "accepted" | "rejected" | "denied", reason?: string, performedBy?: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "submitted") throw new Error("Only a submitted claim can receive a response");
  claim.status = outcome;
  claim.respondedOn = TODAY;
  if (outcome === "rejected") {
    claim.rejectionReason = reason;
    recordClaimEvent(claim, "Rejected by Payer", performedBy, reason);
  } else if (outcome === "denied") {
    recordClaimEvent(claim, "Denied by Payer", performedBy, reason);
    denials.push({ id: `denial-${denials.length + 1}`, claimId: claim.id, reason: reason ?? "Not specified", amount: claim.amount, stage: "new", createdOn: TODAY });
  } else {
    recordClaimEvent(claim, "Accepted by Payer", performedBy);
  }
  return mockRequest(toClaimView(claim));
}

/** Fix → Resubmit (spec §27) — a rejected claim goes back into the submission queue. */
export function resubmitClaim(claimId: string, correctionNote: string, performedBy?: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "rejected") throw new Error("Only a rejected claim can be resubmitted");
  claim.status = "submitted";
  claim.submittedOn = TODAY;
  claim.rejectionReason = undefined;
  recordClaimEvent(claim, "Resubmitted", performedBy, correctionNote);
  return mockRequest(toClaimView(claim));
}

/**
 * Records the payer's payment against an accepted claim — and applies it as
 * a real "insurance" Payment against the underlying Invoice, the same way a
 * manual payment would be, so the Patient Financial Account and Dashboard
 * stay consistent instead of drifting from a claim-only number.
 */
export function recordClaimPayment(claimId: string, paidAmount: number, performedBy?: string) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) throw new Error("Claim not found");
  if (claim.status !== "accepted") throw new Error("Only an accepted claim can be paid");
  if (paidAmount <= 0 || paidAmount > claim.amount) throw new Error("Paid amount must be between 0 and the claimed amount");
  claim.status = "paid";
  claim.paidAmount = paidAmount;
  recordClaimEvent(claim, "Payment Received from Payer", performedBy, formatCurrencyForAudit(paidAmount));

  const invoice = invoices.find((i) => i.id === claim.invoiceId);
  if (invoice) {
    const remaining = invoice.patientResponsibility - invoice.amountPaid;
    const applied = Math.min(paidAmount, Math.max(0, remaining));
    if (applied > 0) {
      payments.push({
        id: `pay-${payments.length + 1}`,
        paymentNumber: nextPaymentNumber(),
        invoiceId: invoice.id,
        patientId: invoice.patientId,
        amount: applied,
        method: "insurance",
        status: "success",
        transactionReference: claim.claimNumber,
        date: TODAY,
        recordedBy: "Claims — Auto-Applied",
      });
      invoice.amountPaid += applied;
      invoice.status = invoice.amountPaid >= invoice.patientResponsibility ? "paid" : "partially-paid";
    }
  }
  return mockRequest(toClaimView(claim));
}

function formatCurrencyForAudit(amount: number) {
  return `SAR ${amount.toLocaleString()}`;
}

// Seed claims across every lifecycle stage, built through the module's own
// functions (not hand-typed totals) so every derived field stays consistent
// with the real invoice/contract math. Bills one already-validated,
// unbilled charge per patient — each of these patients has active coverage
// seeded above.
(function seedClaimsPhase3() {
  function billAndClaim(patientId: string, insuranceRate: number, outcome: "submitted" | "accepted-paid" | "rejected" | "denied") {
    const charge = charges.find((c) => c.patientId === patientId && c.status === "validated");
    if (!charge) return;
    createInvoiceFromCharges({ patientId, chargeIds: [charge.id], insuranceAmount: insuranceRate * charge.quantity });
    const invoice = invoices[invoices.length - 1];
    createClaimFromInvoice(invoice.id, DEFAULT_BILLING_ACTOR);
    const claim = claims[claims.length - 1];
    claim.status = "ready";
    claim.createdOn = "2026-08-10";
    submitClaim(claim.id, DEFAULT_BILLING_ACTOR);
    claim.submittedOn = "2026-08-11";
    if (outcome === "submitted") return;
    if (outcome === "accepted-paid") {
      recordClaimResponse(claim.id, "accepted", undefined, DEFAULT_BILLING_ACTOR);
      claim.respondedOn = "2026-08-13";
      recordClaimPayment(claim.id, claim.amount, DEFAULT_BILLING_ACTOR);
    } else if (outcome === "rejected") {
      recordClaimResponse(claim.id, "rejected", "Missing provider identifier on submission", DEFAULT_BILLING_ACTOR);
      claim.respondedOn = "2026-08-13";
    } else if (outcome === "denied") {
      recordClaimResponse(claim.id, "denied", "Service not covered under plan benefits", DEFAULT_BILLING_ACTOR);
      claim.respondedOn = "2026-08-13";
    }
  }

  billAndClaim("p-ayesha-raza", 75, "submitted");
  billAndClaim("p-ibrar-ahmad", 450, "accepted-paid");
  billAndClaim("p-elena-rodriguez", 480, "rejected");
  billAndClaim("p-bilal-hussain", 1450, "denied");
})();

// ============================================================================
// Billing & Revenue Cycle Management — Phase 4 (Finance)
// Spec §61 Phase 4: Accounts Receivable, Aging, Payment Reconciliation,
// Refunds, Credit Notes, Adjustments, Write-Offs. AR + Aging share one
// ledger view (spec §31's own column list — Payer/Patient/Invoice/Claim/
// Original/Paid/Outstanding/Days Outstanding/Aging Bucket/Collector/Status
// — already IS the aging table), rather than two separate near-duplicate
// screens.
//
// `InvoiceView.balance` (Phase 1) stays payment-only and untouched — every
// existing Payments/Receipts/Dashboard call site keeps working exactly as
// before. Adjustments and write-offs are netted in only where they matter
// (the AR ledger's `outstanding`, and Invoice Details' adjustment history),
// per spec §21's own instruction: never rewrite a historical invoice's
// stored totals — net corrections in at read time instead.
// ============================================================================

// --- Refunds (spec §20) -----------------------------------------------------

export type RefundStatus = "requested" | "approved" | "completed" | "rejected";

export interface Refund {
  id: string;
  refundNumber: string;
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedBy: string;
  requestedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  processedOn?: string;
  paymentReference?: string;
}

const refunds: Refund[] = [];
let refundSeq = 0;
function nextRefundNumber() {
  refundSeq += 1;
  return `REF-${String(refundSeq).padStart(7, "0")}`;
}

export interface RefundView extends Refund {
  paymentNumber: string;
  invoiceNumber: string;
  patientName: string;
}

function toRefundView(r: Refund): RefundView {
  const payment = payments.find((p) => p.id === r.paymentId);
  const invoice = invoices.find((i) => i.id === r.invoiceId);
  const patient = patients.find((p) => p.id === r.patientId);
  return { ...r, paymentNumber: payment?.paymentNumber ?? "—", invoiceNumber: invoice?.invoiceNumber ?? "—", patientName: patient ? getPatientFullName(patient.name) : "Unknown" };
}

export function getRefunds(filters: { status?: RefundStatus | "all" } = {}) {
  return mockRequest(
    refunds
      .filter((r) => !filters.status || filters.status === "all" || r.status === filters.status)
      .map(toRefundView)
      .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1))
  );
}

export interface RequestRefundInput {
  paymentId: string;
  amount: number;
  reason: string;
}

export function requestRefund(input: RequestRefundInput, performedBy?: string) {
  const payment = payments.find((p) => p.id === input.paymentId);
  if (!payment) throw new Error("Payment not found");
  if (input.amount <= 0 || input.amount > payment.amount) throw new Error("Refund amount must be between 0 and the original payment amount");
  const alreadyRefunded = refunds.filter((r) => r.paymentId === input.paymentId && r.status !== "rejected").reduce((sum, r) => sum + r.amount, 0);
  if (alreadyRefunded + input.amount > payment.amount) throw new Error("Refund amount exceeds what's left to refund on this payment");
  const refund: Refund = {
    id: `refund-${refunds.length + 1}`,
    refundNumber: nextRefundNumber(),
    paymentId: payment.id,
    invoiceId: payment.invoiceId,
    patientId: payment.patientId,
    amount: input.amount,
    reason: input.reason,
    status: "requested",
    requestedBy: performedBy ?? DEFAULT_BILLING_ACTOR,
    requestedOn: TODAY,
  };
  refunds.push(refund);
  return mockRequest(toRefundView(refund));
}

export function approveRefund(id: string, performedBy?: string) {
  const refund = refunds.find((r) => r.id === id);
  if (!refund) throw new Error("Refund not found");
  if (refund.status !== "requested") throw new Error("Only a requested refund can be approved");
  refund.status = "approved";
  refund.approvedBy = performedBy ?? DEFAULT_BILLING_ACTOR;
  refund.approvedOn = TODAY;
  return mockRequest(toRefundView(refund));
}

export function rejectRefund(id: string, reason: string) {
  const refund = refunds.find((r) => r.id === id);
  if (!refund) throw new Error("Refund not found");
  if (refund.status !== "requested") throw new Error("Only a requested refund can be rejected");
  refund.status = "rejected";
  refund.reason = `${refund.reason} — Rejected: ${reason}`;
  return mockRequest(toRefundView(refund));
}

/** Refund Processing (spec §20) — the only step that actually moves money, so it's the only step that reverses the underlying Invoice's amountPaid. */
export function processRefund(id: string, paymentReference: string) {
  const refund = refunds.find((r) => r.id === id);
  if (!refund) throw new Error("Refund not found");
  if (refund.status !== "approved") throw new Error("Only an approved refund can be processed");
  refund.status = "completed";
  refund.processedOn = TODAY;
  refund.paymentReference = paymentReference;
  const invoice = invoices.find((i) => i.id === refund.invoiceId);
  if (invoice) {
    invoice.amountPaid = Math.max(0, invoice.amountPaid - refund.amount);
    invoice.status = invoice.amountPaid <= 0 ? "issued" : invoice.amountPaid >= invoice.patientResponsibility ? "paid" : "partially-paid";
  }
  return mockRequest(toRefundView(refund));
}

// --- Credit Notes / Adjustments (spec §21) ----------------------------------

export type AdjustmentType = "credit" | "debit";

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  invoiceId: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
  createdBy: string;
  createdOn: string;
}

const adjustments: Adjustment[] = [];
let adjustmentSeq = 0;
function nextAdjustmentNumber(type: AdjustmentType) {
  adjustmentSeq += 1;
  return `${type === "credit" ? "CN" : "DN"}-${String(adjustmentSeq).padStart(6, "0")}`;
}

export interface AdjustmentView extends Adjustment {
  invoiceNumber: string;
  patientName: string;
}

function toAdjustmentView(a: Adjustment): AdjustmentView {
  const invoice = invoices.find((i) => i.id === a.invoiceId);
  const patient = invoice ? patients.find((p) => p.id === invoice.patientId) : undefined;
  return { ...a, invoiceNumber: invoice?.invoiceNumber ?? "—", patientName: patient ? getPatientFullName(patient.name) : "Unknown" };
}

export function getAdjustments(invoiceId?: string) {
  return mockRequest(
    adjustments
      .filter((a) => !invoiceId || a.invoiceId === invoiceId)
      .map(toAdjustmentView)
      .sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1))
  );
}

export interface NewAdjustmentInput {
  invoiceId: string;
  type: AdjustmentType;
  amount: number;
  reason: string;
}

/** Credit Note / Debit Adjustment (spec §21) — never edits the original invoice's stored totals; netted in at read time (AR ledger, Invoice Details), which is exactly what "preserves financial history" means in practice. */
export function createAdjustment(input: NewAdjustmentInput, performedBy?: string) {
  const invoice = invoices.find((i) => i.id === input.invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (input.amount <= 0) throw new Error("Adjustment amount must be greater than zero");
  const adjustment: Adjustment = {
    id: `adj-${adjustments.length + 1}`,
    adjustmentNumber: nextAdjustmentNumber(input.type),
    invoiceId: input.invoiceId,
    type: input.type,
    amount: input.amount,
    reason: input.reason,
    createdBy: performedBy ?? DEFAULT_BILLING_ACTOR,
    createdOn: TODAY,
  };
  adjustments.push(adjustment);
  return mockRequest(toAdjustmentView(adjustment));
}

// --- Write-Off Management (spec §51) ----------------------------------------

export type WriteOffStatus = "requested" | "approved" | "rejected";

export interface WriteOff {
  id: string;
  writeOffNumber: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: WriteOffStatus;
  requestedBy: string;
  requestedOn: string;
  approvedBy?: string;
  approvedOn?: string;
}

const writeOffs: WriteOff[] = [];
let writeOffSeq = 0;
function nextWriteOffNumber() {
  writeOffSeq += 1;
  return `WO-${String(writeOffSeq).padStart(6, "0")}`;
}

export interface WriteOffView extends WriteOff {
  invoiceNumber: string;
  patientName: string;
}

function toWriteOffView(w: WriteOff): WriteOffView {
  const invoice = invoices.find((i) => i.id === w.invoiceId);
  const patient = invoice ? patients.find((p) => p.id === invoice.patientId) : undefined;
  return { ...w, invoiceNumber: invoice?.invoiceNumber ?? "—", patientName: patient ? getPatientFullName(patient.name) : "Unknown" };
}

export function getWriteOffs(filters: { status?: WriteOffStatus | "all"; invoiceId?: string } = {}) {
  return mockRequest(
    writeOffs
      .filter((w) => !filters.status || filters.status === "all" || w.status === filters.status)
      .filter((w) => !filters.invoiceId || w.invoiceId === filters.invoiceId)
      .map(toWriteOffView)
      .sort((a, b) => (a.requestedOn < b.requestedOn ? 1 : -1))
  );
}

export interface RequestWriteOffInput {
  invoiceId: string;
  amount: number;
  reason: string;
}

/** Don't just set Outstanding = 0 (spec §51) — this is the auditable request/approval path; getARLedger nets approved write-offs into outstanding at read time. */
export function requestWriteOff(input: RequestWriteOffInput, performedBy?: string) {
  const invoice = invoices.find((i) => i.id === input.invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (input.amount <= 0) throw new Error("Write-off amount must be greater than zero");
  const writeOff: WriteOff = {
    id: `wo-${writeOffs.length + 1}`,
    writeOffNumber: nextWriteOffNumber(),
    invoiceId: input.invoiceId,
    amount: input.amount,
    reason: input.reason,
    status: "requested",
    requestedBy: performedBy ?? DEFAULT_BILLING_ACTOR,
    requestedOn: TODAY,
  };
  writeOffs.push(writeOff);
  return mockRequest(toWriteOffView(writeOff));
}

export function approveWriteOff(id: string, performedBy?: string) {
  const writeOff = writeOffs.find((w) => w.id === id);
  if (!writeOff) throw new Error("Write-off not found");
  if (writeOff.status !== "requested") throw new Error("Only a requested write-off can be approved");
  writeOff.status = "approved";
  writeOff.approvedBy = performedBy ?? DEFAULT_BILLING_ACTOR;
  writeOff.approvedOn = TODAY;
  return mockRequest(toWriteOffView(writeOff));
}

export function rejectWriteOff(id: string, reason: string) {
  const writeOff = writeOffs.find((w) => w.id === id);
  if (!writeOff) throw new Error("Write-off not found");
  if (writeOff.status !== "requested") throw new Error("Only a requested write-off can be rejected");
  writeOff.status = "rejected";
  writeOff.reason = `${writeOff.reason} — Rejected: ${reason}`;
  return mockRequest(toWriteOffView(writeOff));
}

// --- Accounts Receivable + Aging (spec §30-31) ------------------------------

function invoiceARCategory(invoice: Invoice): "insurance" | "patient" | "corporate" | "government" {
  const account = getOrCreatePatientAccount(invoice.patientId);
  if (account.coverageType === "corporate") return "corporate";
  if (account.coverageType === "insurance") return "insurance";
  return "patient";
}

const arCollectors: Record<string, string> = {};

const AGING_BUCKET_LABELS = ["0–30 days", "31–60 days", "61–90 days", "91–120 days", "120+ days"];
function agingBucketFor(days: number) {
  if (days <= 30) return AGING_BUCKET_LABELS[0];
  if (days <= 60) return AGING_BUCKET_LABELS[1];
  if (days <= 90) return AGING_BUCKET_LABELS[2];
  if (days <= 120) return AGING_BUCKET_LABELS[3];
  return AGING_BUCKET_LABELS[4];
}

export interface ARLedgerRow {
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  payerName?: string;
  claimId?: string;
  claimNumber?: string;
  category: "insurance" | "patient" | "corporate" | "government";
  originalAmount: number;
  paidAmount: number;
  outstanding: number;
  daysOutstanding: number;
  agingBucket: string;
  assignedCollector?: string;
  status: InvoiceStatus;
}

function buildARLedgerRow(invoice: Invoice): ARLedgerRow | null {
  if (invoice.status === "cancelled" || invoice.status === "void") return null;
  const view = toInvoiceView(invoice);
  const netAdjustment = adjustments.filter((a) => a.invoiceId === invoice.id).reduce((sum, a) => sum + (a.type === "credit" ? a.amount : -a.amount), 0);
  const writtenOff = writeOffs.filter((w) => w.invoiceId === invoice.id && w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
  const outstanding = Math.max(0, view.balance - netAdjustment - writtenOff);
  if (outstanding <= 0) return null;
  const patient = patients.find((p) => p.id === invoice.patientId);
  const claim = claims.find((c) => c.invoiceId === invoice.id);
  const coverage = patientCoverages.find((c) => c.patientId === invoice.patientId && c.rank === "primary" && c.status === "active");
  const days = Math.round((new Date(`${TODAY}T00:00:00`).getTime() - new Date(`${invoice.issuedDate}T00:00:00`).getTime()) / (24 * 60 * 60 * 1000));
  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    patientId: invoice.patientId,
    patientName: patient ? getPatientFullName(patient.name) : "Unknown",
    payerName: coverage ? payers.find((p) => p.id === coverage.payerId)?.name : undefined,
    claimId: claim?.id,
    claimNumber: claim?.claimNumber,
    category: invoiceARCategory(invoice),
    originalAmount: invoice.patientResponsibility,
    paidAmount: invoice.amountPaid,
    outstanding,
    daysOutstanding: days,
    agingBucket: agingBucketFor(days),
    assignedCollector: arCollectors[invoice.id],
    status: view.status,
  };
}

export function getARLedger(filters: { category?: string; agingBucket?: string } = {}) {
  const rows = invoices
    .map(buildARLedgerRow)
    .filter((r): r is ARLedgerRow => r !== null)
    .filter((r) => !filters.category || filters.category === "all" || r.category === filters.category)
    .filter((r) => !filters.agingBucket || filters.agingBucket === "all" || r.agingBucket === filters.agingBucket)
    .sort((a, b) => b.daysOutstanding - a.daysOutstanding);
  return mockRequest(rows);
}

export function getARSummary() {
  const rows = invoices.map(buildARLedgerRow).filter((r): r is ARLedgerRow => r !== null);
  const totalAR = rows.reduce((sum, r) => sum + r.outstanding, 0);
  const byCategory = {
    insurance: rows.filter((r) => r.category === "insurance").reduce((sum, r) => sum + r.outstanding, 0),
    patient: rows.filter((r) => r.category === "patient").reduce((sum, r) => sum + r.outstanding, 0),
    corporate: rows.filter((r) => r.category === "corporate").reduce((sum, r) => sum + r.outstanding, 0),
    government: rows.filter((r) => r.category === "government").reduce((sum, r) => sum + r.outstanding, 0),
  };
  const agingMap: Record<string, number> = Object.fromEntries(AGING_BUCKET_LABELS.map((l) => [l, 0]));
  rows.forEach((r) => {
    agingMap[r.agingBucket] += r.outstanding;
  });
  return mockRequest({ totalAR, byCategory, agingBuckets: AGING_BUCKET_LABELS.map((label) => ({ label, amount: agingMap[label] })) });
}

export function assignCollector(invoiceId: string, collectorName: string) {
  arCollectors[invoiceId] = collectorName;
  return mockRequest(null);
}

// --- Payment Reconciliation (spec §32) --------------------------------------

export interface ReconciliationBatch {
  id: string;
  batchNumber: string;
  payerId: string;
  reference: string;
  totalAmount: number;
  date: string;
  status: "open" | "reconciled";
  createdBy: string;
}

export interface ReconciliationAllocation {
  id: string;
  batchId: string;
  claimId: string;
  amount: number;
}

const reconciliationBatches: ReconciliationBatch[] = [];
const reconciliationAllocations: ReconciliationAllocation[] = [];
let batchSeq = 0;
function nextBatchNumber() {
  batchSeq += 1;
  return `RCN-${String(batchSeq).padStart(6, "0")}`;
}

export interface ReconciliationBatchView extends ReconciliationBatch {
  payerName: string;
  allocatedAmount: number;
  remainingAmount: number;
}

function toBatchView(b: ReconciliationBatch): ReconciliationBatchView {
  const allocatedAmount = reconciliationAllocations.filter((a) => a.batchId === b.id).reduce((sum, a) => sum + a.amount, 0);
  return { ...b, payerName: payers.find((p) => p.id === b.payerId)?.name ?? "Unknown", allocatedAmount, remainingAmount: b.totalAmount - allocatedAmount };
}

export function getReconciliationBatches() {
  return mockRequest(reconciliationBatches.map(toBatchView).sort((a, b) => (a.date < b.date ? 1 : -1)));
}

export interface NewReconciliationBatchInput {
  payerId: string;
  reference: string;
  totalAmount: number;
}

/** Payer Payment → Payment File / Reference (spec §32) — the batch is created first, then matched against individual claims via allocateToBatch. */
export function createReconciliationBatch(input: NewReconciliationBatchInput, performedBy?: string) {
  const batch: ReconciliationBatch = { id: `batch-${reconciliationBatches.length + 1}`, batchNumber: nextBatchNumber(), ...input, date: TODAY, status: "open", createdBy: performedBy ?? DEFAULT_BILLING_ACTOR };
  reconciliationBatches.push(batch);
  return mockRequest(toBatchView(batch));
}

/** Match Claims (spec §32) — this batch's payer's accepted, not-yet-paid claims. */
export function getEligibleClaimsForBatch(batchId: string) {
  const batch = reconciliationBatches.find((b) => b.id === batchId);
  if (!batch) return mockRequest([] as ClaimView[]);
  const eligible = claims.filter((c) => c.status === "accepted").filter((c) => {
    const coverage = patientCoverages.find((cov) => cov.id === c.coverageId);
    return coverage?.payerId === batch.payerId;
  });
  return mockRequest(eligible.map(toClaimView));
}

export interface AllocateBatchInput {
  batchId: string;
  claimId: string;
  amount: number;
}

/** Allocate Amounts → Reconcile (spec §32) — reuses recordClaimPayment, the same logic a direct claim payment uses, so the invoice/patient account never drift depending on which path a payment arrived through. */
export function allocateToBatch(input: AllocateBatchInput, performedBy?: string) {
  const batch = reconciliationBatches.find((b) => b.id === input.batchId);
  if (!batch) throw new Error("Batch not found");
  const view = toBatchView(batch);
  if (input.amount <= 0 || input.amount > view.remainingAmount) throw new Error(`Allocation must be between 0 and the batch's remaining ${view.remainingAmount}`);
  reconciliationAllocations.push({ id: `alloc-${reconciliationAllocations.length + 1}`, batchId: input.batchId, claimId: input.claimId, amount: input.amount });
  recordClaimPayment(input.claimId, input.amount, performedBy ?? `Reconciliation ${batch.batchNumber}`);
  return mockRequest(toBatchView(batch));
}

/** Closes the batch even with Remaining Exceptions (spec §32 names this explicitly — not everything nets to zero). */
export function closeBatch(batchId: string) {
  const batch = reconciliationBatches.find((b) => b.id === batchId);
  if (!batch) throw new Error("Batch not found");
  batch.status = "reconciled";
  return mockRequest(toBatchView(batch));
}

export interface ReconciliationAllocationView extends ReconciliationAllocation {
  claimNumber: string;
  patientName: string;
}

export function getBatchAllocations(batchId: string) {
  const rows: ReconciliationAllocationView[] = reconciliationAllocations
    .filter((a) => a.batchId === batchId)
    .map((a) => {
      const claim = claims.find((c) => c.id === a.claimId);
      const patient = claim ? patients.find((p) => p.id === claim.patientId) : undefined;
      return { ...a, claimNumber: claim?.claimNumber ?? "—", patientName: patient ? getPatientFullName(patient.name) : "Unknown" };
    });
  return mockRequest(rows);
}

// Seed a small, realistic set of Phase 4 records via the module's own
// functions, matching the seeding discipline used for Phase 3's claims.
(function seedFinancePhase4() {
  createAdjustment({ invoiceId: "inv-2", type: "credit", amount: 20, reason: "Courtesy discount for extended wait time" }, DEFAULT_BILLING_ACTOR);

  requestRefund({ paymentId: "pay-1", amount: 20, reason: "Overpayment correction" }, DEFAULT_BILLING_ACTOR);
  const refund = refunds[refunds.length - 1];
  approveRefund(refund.id, DEFAULT_BILLING_ACTOR);
  processRefund(refund.id, "TXN-REFUND-88213");

  const bilalInvoice = invoices.find((i) => i.patientId === "p-bilal-hussain");
  if (bilalInvoice) {
    requestWriteOff({ invoiceId: bilalInvoice.id, amount: bilalInvoice.patientResponsibility, reason: "Denial upheld on appeal — deemed uncollectible" }, DEFAULT_BILLING_ACTOR);
  }

  createReconciliationBatch({ payerId: "payer-state-life", reference: "BATCH-Q3-2026-0417", totalAmount: 5000 }, DEFAULT_BILLING_ACTOR);
})();

