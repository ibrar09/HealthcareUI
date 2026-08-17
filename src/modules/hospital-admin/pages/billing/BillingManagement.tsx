import { useEffect, useState } from "react";
import { Plus, Receipt as ReceiptIcon } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { BillingDashboardOverview } from "@modules/hospital-admin/components/billing/BillingDashboardOverview";
import { PatientAccountList } from "@modules/hospital-admin/components/billing/PatientAccountList";
import { PatientAccountDrawer } from "@modules/hospital-admin/components/billing/PatientAccountDrawer";
import { ChargeList } from "@modules/hospital-admin/components/billing/ChargeList";
import { CaptureChargeDrawer } from "@modules/hospital-admin/components/billing/CaptureChargeDrawer";
import { ChargeReviewQueue } from "@modules/hospital-admin/components/billing/ChargeReviewQueue";
import { InvoiceList } from "@modules/hospital-admin/components/billing/InvoiceList";
import { CreateInvoiceDrawer } from "@modules/hospital-admin/components/billing/CreateInvoiceDrawer";
import { InvoiceDetailsDrawer } from "@modules/hospital-admin/components/billing/InvoiceDetailsDrawer";
import { RecordPaymentDrawer } from "@modules/hospital-admin/components/billing/RecordPaymentDrawer";
import { CancelInvoiceDrawer } from "@modules/hospital-admin/components/billing/CancelInvoiceDrawer";
import { PaymentList } from "@modules/hospital-admin/components/billing/PaymentList";
import { ReceiptView } from "@modules/hospital-admin/components/billing/ReceiptView";
import { PayersPanel } from "@modules/hospital-admin/components/billing/PayersPanel";
import { PayerFormDrawer } from "@modules/hospital-admin/components/billing/PayerFormDrawer";
import { InsurancePlanFormDrawer } from "@modules/hospital-admin/components/billing/InsurancePlanFormDrawer";
import { AuthorizationsPanel } from "@modules/hospital-admin/components/billing/AuthorizationsPanel";
import { RequestAuthorizationDrawer } from "@modules/hospital-admin/components/billing/RequestAuthorizationDrawer";
import { RejectAuthorizationDrawer } from "@modules/hospital-admin/components/billing/RejectAuthorizationDrawer";
import { ContractsPanel } from "@modules/hospital-admin/components/billing/ContractsPanel";
import { ContractFormDrawer } from "@modules/hospital-admin/components/billing/ContractFormDrawer";
import { CoverageFormDrawer } from "@modules/hospital-admin/components/billing/CoverageFormDrawer";
import { ClaimsPanel } from "@modules/hospital-admin/components/billing/ClaimsPanel";
import { ClaimDetailsDrawer } from "@modules/hospital-admin/components/billing/ClaimDetailsDrawer";
import { RecordClaimResponseDrawer } from "@modules/hospital-admin/components/billing/RecordClaimResponseDrawer";
import { ResubmitClaimDrawer } from "@modules/hospital-admin/components/billing/ResubmitClaimDrawer";
import { RecordClaimPaymentDrawer } from "@modules/hospital-admin/components/billing/RecordClaimPaymentDrawer";
import { DenialsPanel } from "@modules/hospital-admin/components/billing/DenialsPanel";
import { AssignDenialDrawer } from "@modules/hospital-admin/components/billing/AssignDenialDrawer";
import { ARLedgerPanel } from "@modules/hospital-admin/components/billing/ARLedgerPanel";
import { AssignCollectorDrawer } from "@modules/hospital-admin/components/billing/AssignCollectorDrawer";
import { RefundsPanel } from "@modules/hospital-admin/components/billing/RefundsPanel";
import { RequestRefundDrawer } from "@modules/hospital-admin/components/billing/RequestRefundDrawer";
import { ProcessRefundDrawer } from "@modules/hospital-admin/components/billing/ProcessRefundDrawer";
import { RejectRefundDrawer } from "@modules/hospital-admin/components/billing/RejectRefundDrawer";
import { AdjustmentsPanel } from "@modules/hospital-admin/components/billing/AdjustmentsPanel";
import { CreateAdjustmentDrawer } from "@modules/hospital-admin/components/billing/CreateAdjustmentDrawer";
import { RequestWriteOffDrawer } from "@modules/hospital-admin/components/billing/RequestWriteOffDrawer";
import { RejectWriteOffDrawer } from "@modules/hospital-admin/components/billing/RejectWriteOffDrawer";
import { ReconciliationPanel } from "@modules/hospital-admin/components/billing/ReconciliationPanel";
import { CreateReconciliationBatchDrawer } from "@modules/hospital-admin/components/billing/CreateReconciliationBatchDrawer";
import { BatchAllocationDrawer } from "@modules/hospital-admin/components/billing/BatchAllocationDrawer";
import * as api from "@modules/hospital-admin/api";
import type {
  BillingDashboardData,
  PatientAccountView,
  InvoiceView,
  ChargeView,
  PaymentView,
  ChargeStatus,
  InvoiceStatus,
  BillableService,
  Payer,
  InsurancePlanView,
  PreAuthorizationView,
  AuthorizationStatus,
  PayerContractView,
  ServicePricingRow,
  NewPayerInput,
  ClaimView,
  ClaimStatus,
  DenialView,
  DenialStage,
  ARLedgerRow,
  RefundView,
  AdjustmentView,
  WriteOffView,
  ReconciliationBatchView,
  NewReconciliationBatchInput,
} from "@modules/hospital-admin/api";

type Tab =
  | "dashboard"
  | "accounts"
  | "charges"
  | "review"
  | "invoices"
  | "payments"
  | "payers"
  | "authorizations"
  | "contracts"
  | "claims"
  | "denials"
  | "ar"
  | "refunds"
  | "adjustments"
  | "reconciliation";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Billing", subtitle: "Revenue, receivables, and invoice status at a glance." },
  accounts: { label: "Patient Accounts", title: "Patient Financial Accounts", subtitle: "Every patient's aggregated balance and coverage." },
  charges: { label: "Charges", title: "Charges", subtitle: "Every captured charge, across statuses." },
  review: { label: "Charge Review", title: "Charge Review", subtitle: "Validate charges before they can be billed." },
  invoices: { label: "Invoices", title: "Invoices", subtitle: "Bill patients from validated charges, track balances." },
  payments: { label: "Payments", title: "Payments", subtitle: "Every payment recorded against an invoice." },
  payers: { label: "Payers", title: "Payers & Plans", subtitle: "Insurance companies, government payers, and corporate plans." },
  authorizations: { label: "Authorizations", title: "Authorizations", subtitle: "Preauthorization requests and their outcomes." },
  contracts: { label: "Contracts", title: "Contracts & Pricing", subtitle: "Negotiated payer rates and cross-payer service pricing." },
  claims: { label: "Claims", title: "Claims", subtitle: "Insurance claims from creation through payer response." },
  denials: { label: "Denials", title: "Denials", subtitle: "Denied claims moving through investigation, appeal, and resolution." },
  ar: { label: "Accounts Receivable", title: "Accounts Receivable", subtitle: "Outstanding balances by category and aging bucket." },
  refunds: { label: "Refunds", title: "Refunds", subtitle: "Payment refunds from request through completion." },
  adjustments: { label: "Adjustments", title: "Adjustments", subtitle: "Credit notes, debit adjustments, and write-offs." },
  reconciliation: { label: "Reconciliation", title: "Payment Reconciliation", subtitle: "Match payer payments against claims and reconcile." },
};

export function BillingManagement() {
  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<BillingDashboardData | null>(null);
  const [accounts, setAccounts] = useState<PatientAccountView[]>([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountPatientId, setSelectedAccountPatientId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PatientAccountView | null>(null);
  const [selectedAccountInvoices, setSelectedAccountInvoices] = useState<InvoiceView[]>([]);

  const [charges, setCharges] = useState<ChargeView[]>([]);
  const [chargeStatusFilter, setChargeStatusFilter] = useState<ChargeStatus | "all">("all");
  const [reviewQueue, setReviewQueue] = useState<ChargeView[]>([]);
  const [services, setServices] = useState<BillableService[]>([]);
  const [captureChargeOpen, setCaptureChargeOpen] = useState(false);

  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceView | null>(null);
  const [selectedInvoicePayments, setSelectedInvoicePayments] = useState<PaymentView[]>([]);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [recordPaymentTarget, setRecordPaymentTarget] = useState<InvoiceView | null>(null);
  const [cancelInvoiceTarget, setCancelInvoiceTarget] = useState<InvoiceView | null>(null);

  const [payments, setPayments] = useState<PaymentView[]>([]);
  const [receiptPayment, setReceiptPayment] = useState<PaymentView | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<InvoiceView | null>(null);

  const [staffOptions, setStaffOptions] = useState<{ id: string; name: string }[]>([]);

  const [payers, setPayers] = useState<Payer[]>([]);
  const [plansByPayer, setPlansByPayer] = useState<Record<string, InsurancePlanView[]>>({});
  const [payerFormOpen, setPayerFormOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<(NewPayerInput & { id: string }) | null>(null);
  const [planFormTarget, setPlanFormTarget] = useState<{ payerId: string; payerName: string } | null>(null);
  const [coverageFormTarget, setCoverageFormTarget] = useState<{ patientId: string; patientName: string } | null>(null);

  const [authorizations, setAuthorizations] = useState<PreAuthorizationView[]>([]);
  const [authStats, setAuthStats] = useState({ pending: 0, approved: 0, rejected: 0, expired: 0 });
  const [authStatusFilter, setAuthStatusFilter] = useState<AuthorizationStatus | "all">("all");
  const [requestAuthOpen, setRequestAuthOpen] = useState(false);
  const [rejectAuthTarget, setRejectAuthTarget] = useState<string | null>(null);

  const [contracts, setContracts] = useState<PayerContractView[]>([]);
  const [pricing, setPricing] = useState<ServicePricingRow[]>([]);
  const [contractFormOpen, setContractFormOpen] = useState(false);

  const [claims, setClaims] = useState<ClaimView[]>([]);
  const [claimsDashboard, setClaimsDashboard] = useState<{ byStatus: Record<ClaimStatus, number>; totalClaimed: number; totalPaid: number } | null>(null);
  const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatus | "all">("all");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ClaimView | null>(null);
  const [selectedInvoiceClaim, setSelectedInvoiceClaim] = useState<ClaimView | null>(null);
  const [responseTarget, setResponseTarget] = useState<ClaimView | null>(null);
  const [resubmitTarget, setResubmitTarget] = useState<ClaimView | null>(null);
  const [claimPaymentTarget, setClaimPaymentTarget] = useState<ClaimView | null>(null);

  const [denials, setDenials] = useState<DenialView[]>([]);
  const [denialStageFilter, setDenialStageFilter] = useState<DenialStage | "all">("all");
  const [assignDenialTarget, setAssignDenialTarget] = useState<DenialView | null>(null);

  const [arRows, setArRows] = useState<ARLedgerRow[]>([]);
  const [arSummary, setArSummary] = useState<{ totalAR: number; byCategory: { insurance: number; patient: number; corporate: number; government: number }; agingBuckets: { label: string; amount: number }[] } | null>(null);
  const [arCategoryFilter, setArCategoryFilter] = useState("all");
  const [arAgingFilter, setArAgingFilter] = useState("all");
  const [assignCollectorTarget, setAssignCollectorTarget] = useState<ARLedgerRow | null>(null);

  const [refundsList, setRefundsList] = useState<RefundView[]>([]);
  const [refundRequestTarget, setRefundRequestTarget] = useState<PaymentView | null>(null);
  const [refundRejectTarget, setRefundRejectTarget] = useState<RefundView | null>(null);
  const [refundProcessTarget, setRefundProcessTarget] = useState<RefundView | null>(null);

  const [adjustmentsList, setAdjustmentsList] = useState<AdjustmentView[]>([]);
  const [writeOffsList, setWriteOffsList] = useState<WriteOffView[]>([]);
  const [selectedInvoiceAdjustments, setSelectedInvoiceAdjustments] = useState<AdjustmentView[]>([]);
  const [selectedInvoiceWriteOffs, setSelectedInvoiceWriteOffs] = useState<WriteOffView[]>([]);
  const [addAdjustmentOpen, setAddAdjustmentOpen] = useState(false);
  const [requestWriteOffOpen, setRequestWriteOffOpen] = useState(false);
  const [writeOffRejectTarget, setWriteOffRejectTarget] = useState<WriteOffView | null>(null);

  const [reconciliationBatches, setReconciliationBatches] = useState<ReconciliationBatchView[]>([]);
  const [createBatchOpen, setCreateBatchOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<ReconciliationBatchView | null>(null);

  // Split so actions that intentionally clear a selection (e.g. cancelling an
  // invoice) can refresh list data without racing a stale-id refetch that
  // would repopulate and reopen the drawer that was just closed — the same
  // class of bug caught in Appointments' refreshLists()/refreshSelected() split.
  function refreshLists() {
    api.getBillingDashboard().then(setDashboard);
    api.getPatientAccounts(accountSearch).then(setAccounts);
    api.getCharges({ status: chargeStatusFilter }).then(setCharges);
    api.getChargeReviewQueue().then(setReviewQueue);
    api.getInvoices({ status: invoiceStatusFilter }).then(setInvoices);
    api.getPayments().then(setPayments);
    if (tab === "claims") loadClaims();
    if (tab === "denials") loadDenials();
    if (tab === "ar") loadAR();
    if (tab === "refunds") loadRefunds();
    if (tab === "adjustments") loadAdjustmentsAndWriteOffs();
    if (tab === "reconciliation") loadReconciliation();
  }

  function refreshSelected() {
    if (selectedAccountPatientId) {
      api.getPatientAccount(selectedAccountPatientId).then(setSelectedAccount);
      api.getInvoices({ patientId: selectedAccountPatientId }).then(setSelectedAccountInvoices);
    }
    if (selectedInvoiceId) {
      api.getInvoice(selectedInvoiceId).then(setSelectedInvoice);
      api.getPayments({ invoiceId: selectedInvoiceId }).then(setSelectedInvoicePayments);
      api.getClaimByInvoiceId(selectedInvoiceId).then(setSelectedInvoiceClaim);
      api.getAdjustments(selectedInvoiceId).then(setSelectedInvoiceAdjustments);
      api.getWriteOffs({ invoiceId: selectedInvoiceId }).then(setSelectedInvoiceWriteOffs);
    }
    if (selectedClaimId) {
      api.getClaim(selectedClaimId).then(setSelectedClaim);
    }
    if (selectedBatchId) {
      api.getReconciliationBatches().then((rows) => setSelectedBatch(rows.find((b) => b.id === selectedBatchId) ?? null));
    }
  }

  function refreshAll() {
    refreshLists();
    refreshSelected();
  }

  function loadPayersAndPlans() {
    api.getPayers({ includeInactive: true }).then((rows) => {
      setPayers(rows);
      Promise.all(rows.map((p) => api.getInsurancePlans(p.id).then((plans) => [p.id, plans] as const))).then((entries) => {
        setPlansByPayer(Object.fromEntries(entries));
      });
    });
  }

  function loadAuthorizations() {
    api.getAuthorizations({ status: authStatusFilter }).then(setAuthorizations);
    api.getAuthorizationStats().then(setAuthStats);
  }

  function loadContracts() {
    api.getContracts().then(setContracts);
    api.getServicePricing().then(setPricing);
  }

  function loadClaims() {
    api.getClaims({ status: claimStatusFilter }).then(setClaims);
    api.getClaimsDashboard().then(setClaimsDashboard);
  }

  function loadDenials() {
    api.getDenials({ stage: denialStageFilter }).then(setDenials);
  }

  function loadAR() {
    api.getARLedger({ category: arCategoryFilter, agingBucket: arAgingFilter }).then(setArRows);
    api.getARSummary().then(setArSummary);
  }

  function loadRefunds() {
    api.getRefunds().then(setRefundsList);
  }

  function loadAdjustmentsAndWriteOffs() {
    api.getAdjustments().then(setAdjustmentsList);
    api.getWriteOffs().then(setWriteOffsList);
  }

  function loadReconciliation() {
    api.getReconciliationBatches().then(setReconciliationBatches);
  }

  useEffect(() => {
    api.getBillingDashboard().then(setDashboard);
    api.getPatientAccounts().then(setAccounts);
    api.getChargeReviewQueue().then(setReviewQueue);
    api.getBillableServices().then(setServices);
    api.getPayments().then(setPayments);
    api.getStaffMembers().then((rows) => setStaffOptions(rows.map((s) => ({ id: s.id, name: s.name }))));
    api.getAuthorizationStats().then(setAuthStats);
    loadPayersAndPlans();
  }, []);

  useEffect(() => {
    if (tab === "authorizations") loadAuthorizations();
    else if (tab === "contracts") loadContracts();
    else if (tab === "payers") loadPayersAndPlans();
    else if (tab === "claims") loadClaims();
    else if (tab === "denials") loadDenials();
    else if (tab === "ar") loadAR();
    else if (tab === "refunds") loadRefunds();
    else if (tab === "adjustments") loadAdjustmentsAndWriteOffs();
    else if (tab === "reconciliation") loadReconciliation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "authorizations") loadAuthorizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatusFilter]);

  useEffect(() => {
    if (tab === "claims") loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimStatusFilter]);

  useEffect(() => {
    if (tab === "denials") loadDenials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [denialStageFilter]);

  useEffect(() => {
    if (tab === "ar") loadAR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arCategoryFilter, arAgingFilter]);

  useEffect(() => {
    api.getPatientAccounts(accountSearch).then(setAccounts);
  }, [accountSearch]);

  useEffect(() => {
    api.getCharges({ status: chargeStatusFilter }).then(setCharges);
  }, [chargeStatusFilter]);

  useEffect(() => {
    api.getInvoices({ status: invoiceStatusFilter }).then(setInvoices);
  }, [invoiceStatusFilter]);

  useEffect(() => {
    if (!selectedAccountPatientId) {
      setSelectedAccount(null);
      setSelectedAccountInvoices([]);
      return;
    }
    api.getPatientAccount(selectedAccountPatientId).then(setSelectedAccount);
    api.getInvoices({ patientId: selectedAccountPatientId }).then(setSelectedAccountInvoices);
  }, [selectedAccountPatientId]);

  useEffect(() => {
    if (!selectedInvoiceId) {
      setSelectedInvoice(null);
      setSelectedInvoicePayments([]);
      setSelectedInvoiceClaim(null);
      setSelectedInvoiceAdjustments([]);
      setSelectedInvoiceWriteOffs([]);
      return;
    }
    api.getInvoice(selectedInvoiceId).then(setSelectedInvoice);
    api.getPayments({ invoiceId: selectedInvoiceId }).then(setSelectedInvoicePayments);
    api.getClaimByInvoiceId(selectedInvoiceId).then(setSelectedInvoiceClaim);
    api.getAdjustments(selectedInvoiceId).then(setSelectedInvoiceAdjustments);
    api.getWriteOffs({ invoiceId: selectedInvoiceId }).then(setSelectedInvoiceWriteOffs);
  }, [selectedInvoiceId]);

  useEffect(() => {
    if (!selectedClaimId) {
      setSelectedClaim(null);
      return;
    }
    api.getClaim(selectedClaimId).then(setSelectedClaim);
  }, [selectedClaimId]);

  useEffect(() => {
    if (!selectedBatchId) {
      setSelectedBatch(null);
      return;
    }
    api.getReconciliationBatches().then((rows) => setSelectedBatch(rows.find((b) => b.id === selectedBatchId) ?? null));
  }, [selectedBatchId]);

  async function handleValidateCharge(chargeId: string) {
    await api.validateCharge(chargeId);
    refreshLists();
  }

  async function handleReverseCharge(chargeId: string) {
    await api.reverseCharge(chargeId);
    refreshLists();
  }

  async function handlePayerSubmit(values: NewPayerInput) {
    if (editingPayer) await api.updatePayer(editingPayer.id, values);
    else await api.createPayer(values);
    loadPayersAndPlans();
  }

  async function handleTogglePayerActive(payer: Payer) {
    await api.setPayerActive(payer.id, payer.status !== "active");
    loadPayersAndPlans();
  }

  async function handlePlanSubmit(values: { name: string; planType: string }) {
    if (!planFormTarget) return;
    await api.createInsurancePlan({ payerId: planFormTarget.payerId, ...values });
    loadPayersAndPlans();
  }

  async function handleApproveAuth(id: string) {
    await api.decideAuthorization(id, true);
    loadAuthorizations();
  }

  async function handleRejectAuth(id: string, reason: string) {
    await api.decideAuthorization(id, false, reason);
    loadAuthorizations();
  }

  async function handleContractSubmit(values: Parameters<typeof api.createContract>[0]) {
    await api.createContract(values);
    loadContracts();
  }

  async function handleCreateClaim() {
    if (!selectedInvoice) return;
    await api.createClaimFromInvoice(selectedInvoice.id);
    refreshAll();
  }

  function handleViewClaim(claimId: string) {
    setSelectedInvoiceId(null);
    setSelectedClaimId(claimId);
  }

  async function handleRecordClaimResponse(claimId: string, outcome: "accepted" | "rejected" | "denied", reason?: string) {
    await api.recordClaimResponse(claimId, outcome, reason);
    refreshAll();
  }

  async function handleResubmitClaim(claimId: string, note: string) {
    await api.resubmitClaim(claimId, note);
    refreshAll();
  }

  async function handleRecordClaimPayment(claimId: string, amount: number) {
    await api.recordClaimPayment(claimId, amount);
    refreshAll();
  }

  async function handleAdvanceDenialStage(id: string, stage: DenialStage) {
    await api.advanceDenialStage(id, stage);
    loadDenials();
  }

  async function handleAssignDenial(id: string, assignedTo: string) {
    await api.assignDenial(id, assignedTo);
    loadDenials();
  }

  async function handleAssignCollector(invoiceId: string, collectorName: string) {
    await api.assignCollector(invoiceId, collectorName);
    loadAR();
  }

  function refreshAfterRefundRequest() {
    refreshAll();
    if (tab === "refunds") loadRefunds();
  }

  async function handleApproveRefund(id: string) {
    await api.approveRefund(id);
    loadRefunds();
  }

  async function handleRejectRefund(id: string, reason: string) {
    await api.rejectRefund(id, reason);
    loadRefunds();
  }

  async function handleProcessRefund(id: string, paymentReference: string) {
    await api.processRefund(id, paymentReference);
    loadRefunds();
    refreshSelected();
  }

  function refreshAfterAdjustment() {
    refreshSelected();
    if (tab === "adjustments") loadAdjustmentsAndWriteOffs();
    if (tab === "ar") loadAR();
  }

  function refreshAfterWriteOffRequest() {
    refreshSelected();
    if (tab === "adjustments") loadAdjustmentsAndWriteOffs();
  }

  async function handleApproveWriteOff(id: string) {
    await api.approveWriteOff(id);
    loadAdjustmentsAndWriteOffs();
    refreshSelected();
    if (tab === "ar") loadAR();
  }

  async function handleRejectWriteOff(id: string, reason: string) {
    await api.rejectWriteOff(id, reason);
    loadAdjustmentsAndWriteOffs();
    refreshSelected();
  }

  async function handleCreateBatch(input: NewReconciliationBatchInput) {
    await api.createReconciliationBatch(input);
    loadReconciliation();
  }

  function openReceipt(paymentId: string) {
    api.getPayment(paymentId).then((p) => {
      if (!p) return;
      setReceiptPayment(p);
      api.getInvoice(p.invoiceId).then(setReceiptInvoice);
    });
  }

  const reviewCount = reviewQueue.length;

  return (
    <HospitalAdminLayout active="Billing">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
            <span>Billing</span>
            {tab !== "dashboard" && (
              <>
                <span>›</span>
                <span className="text-signal-indigo font-medium">{tabMeta[tab].label}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{tabMeta[tab].title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{tabMeta[tab].subtitle}</p>
        </div>
        {tab === "charges" && (
          <button
            type="button"
            onClick={() => setCaptureChargeOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
          >
            <Plus size={16} /> Capture Charge
          </button>
        )}
        {tab === "invoices" && (
          <button
            type="button"
            onClick={() => setCreateInvoiceOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:brightness-110 transition-all"
          >
            <ReceiptIcon size={16} /> Create Invoice
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {(
          [
            "dashboard",
            "accounts",
            "charges",
            "review",
            "invoices",
            "payments",
            "payers",
            "authorizations",
            "contracts",
            "claims",
            "denials",
            "ar",
            "refunds",
            "adjustments",
            "reconciliation",
          ] as const
        ).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {tabMeta[t].label}
            {t === "review" && reviewCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-caution-amber px-1 text-[10px] font-bold text-white">
                {reviewCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "charges" && (
        <div className="flex gap-2 flex-wrap mb-2">
          {(["all", "pending-review", "validated", "billed", "reversed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setChargeStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                chargeStatusFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "all" ? "All" : s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {tab === "invoices" && (
        <div className="flex gap-2 flex-wrap mb-2">
          {(["all", "issued", "partially-paid", "paid", "overdue", "cancelled"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInvoiceStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                invoiceStatusFilter === s ? "bg-gradient-brand text-white shadow-glow" : "bg-white border border-line text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "all" ? "All" : s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {tab === "dashboard" && dashboard && <BillingDashboardOverview data={dashboard} />}

      {tab === "accounts" && (
        <PatientAccountList accounts={accounts} search={accountSearch} onSearchChange={setAccountSearch} onSelect={setSelectedAccountPatientId} />
      )}

      {tab === "charges" && (
        <div className="pb-8">
          <ChargeList charges={charges} />
        </div>
      )}

      {tab === "review" && (
        <div className="pb-8">
          <ChargeReviewQueue charges={reviewQueue} onValidate={handleValidateCharge} onReverse={handleReverseCharge} />
        </div>
      )}

      {tab === "invoices" && (
        <div className="pb-8">
          <InvoiceList invoices={invoices} onSelect={setSelectedInvoiceId} />
        </div>
      )}

      {tab === "payments" && (
        <div className="pb-8">
          <PaymentList payments={payments} onSelect={openReceipt} />
        </div>
      )}

      {tab === "payers" && (
        <PayersPanel
          payers={payers}
          plansByPayer={plansByPayer}
          onAddPayer={() => {
            setEditingPayer(null);
            setPayerFormOpen(true);
          }}
          onEditPayer={(p) => {
            setEditingPayer({ id: p.id, name: p.name, type: p.type, contactPhone: p.contactPhone, contactEmail: p.contactEmail });
            setPayerFormOpen(true);
          }}
          onToggleActive={handleTogglePayerActive}
          onAddPlan={(payerId, payerName) => setPlanFormTarget({ payerId, payerName })}
        />
      )}

      {tab === "authorizations" && (
        <AuthorizationsPanel
          stats={authStats}
          authorizations={authorizations}
          statusFilter={authStatusFilter}
          onStatusFilterChange={setAuthStatusFilter}
          onRequest={() => setRequestAuthOpen(true)}
          onApprove={handleApproveAuth}
          onReject={setRejectAuthTarget}
        />
      )}

      {tab === "contracts" && <ContractsPanel contracts={contracts} pricing={pricing} onAddContract={() => setContractFormOpen(true)} />}

      {tab === "claims" && claimsDashboard && (
        <ClaimsPanel
          byStatus={claimsDashboard.byStatus}
          totalClaimed={claimsDashboard.totalClaimed}
          totalPaid={claimsDashboard.totalPaid}
          claims={claims}
          statusFilter={claimStatusFilter}
          onStatusFilterChange={setClaimStatusFilter}
          onSelect={setSelectedClaimId}
        />
      )}

      {tab === "denials" && (
        <DenialsPanel
          denials={denials}
          stageFilter={denialStageFilter}
          onStageFilterChange={setDenialStageFilter}
          onAdvanceStage={handleAdvanceDenialStage}
          onAssign={setAssignDenialTarget}
        />
      )}

      {tab === "ar" && arSummary && (
        <ARLedgerPanel
          summary={arSummary}
          rows={arRows}
          categoryFilter={arCategoryFilter}
          onCategoryFilterChange={setArCategoryFilter}
          agingFilter={arAgingFilter}
          onAgingFilterChange={setArAgingFilter}
          onAssignCollector={setAssignCollectorTarget}
        />
      )}

      {tab === "refunds" && <RefundsPanel refunds={refundsList} onApprove={handleApproveRefund} onReject={setRefundRejectTarget} onProcess={setRefundProcessTarget} />}

      {tab === "adjustments" && (
        <AdjustmentsPanel adjustments={adjustmentsList} writeOffs={writeOffsList} onApproveWriteOff={handleApproveWriteOff} onRejectWriteOff={setWriteOffRejectTarget} />
      )}

      {tab === "reconciliation" && <ReconciliationPanel batches={reconciliationBatches} onCreateBatch={() => setCreateBatchOpen(true)} onSelectBatch={setSelectedBatchId} />}

      <PatientAccountDrawer
        account={selectedAccount}
        invoices={selectedAccountInvoices}
        onClose={() => setSelectedAccountPatientId(null)}
        onOpenInvoice={(id) => {
          setSelectedAccountPatientId(null);
          setSelectedInvoiceId(id);
        }}
        onAddCoverage={() => selectedAccount && setCoverageFormTarget({ patientId: selectedAccount.patientId, patientName: selectedAccount.patientName })}
      />

      <CaptureChargeDrawer open={captureChargeOpen} onClose={() => setCaptureChargeOpen(false)} onComplete={refreshLists} services={services} />

      <CreateInvoiceDrawer open={createInvoiceOpen} onClose={() => setCreateInvoiceOpen(false)} onComplete={refreshAll} />

      <InvoiceDetailsDrawer
        invoice={selectedInvoice}
        payments={selectedInvoicePayments}
        claim={selectedInvoiceClaim}
        adjustments={selectedInvoiceAdjustments}
        writeOffs={selectedInvoiceWriteOffs}
        onClose={() => setSelectedInvoiceId(null)}
        onRecordPayment={() => selectedInvoice && setRecordPaymentTarget(selectedInvoice)}
        onCancelInvoice={() => selectedInvoice && setCancelInvoiceTarget(selectedInvoice)}
        onViewReceipt={openReceipt}
        onCreateClaim={handleCreateClaim}
        onViewClaim={handleViewClaim}
        onRequestRefund={setRefundRequestTarget}
        onAddAdjustment={() => setAddAdjustmentOpen(true)}
        onRequestWriteOff={() => setRequestWriteOffOpen(true)}
      />

      <RecordPaymentDrawer invoice={recordPaymentTarget} onClose={() => setRecordPaymentTarget(null)} onComplete={refreshAll} />

      <CancelInvoiceDrawer
        invoice={cancelInvoiceTarget}
        onClose={() => setCancelInvoiceTarget(null)}
        onComplete={() => {
          setSelectedInvoiceId(null);
          refreshLists();
        }}
      />

      <ReceiptView
        payment={receiptPayment}
        invoice={receiptInvoice}
        onClose={() => {
          setReceiptPayment(null);
          setReceiptInvoice(null);
        }}
      />

      <PayerFormDrawer open={payerFormOpen} onClose={() => setPayerFormOpen(false)} onSubmit={handlePayerSubmit} initialValues={editingPayer ?? undefined} />

      <InsurancePlanFormDrawer open={Boolean(planFormTarget)} payerName={planFormTarget?.payerName} onClose={() => setPlanFormTarget(null)} onSubmit={handlePlanSubmit} />

      <CoverageFormDrawer
        open={Boolean(coverageFormTarget)}
        patientId={coverageFormTarget?.patientId ?? null}
        patientName={coverageFormTarget?.patientName}
        onClose={() => setCoverageFormTarget(null)}
        onComplete={refreshSelected}
        payers={payers.filter((p) => p.status === "active")}
      />

      <RequestAuthorizationDrawer open={requestAuthOpen} onClose={() => setRequestAuthOpen(false)} onComplete={loadAuthorizations} services={services} staffOptions={staffOptions} />

      <RejectAuthorizationDrawer authorizationId={rejectAuthTarget} onClose={() => setRejectAuthTarget(null)} onSubmit={handleRejectAuth} />

      <ContractFormDrawer
        open={contractFormOpen}
        onClose={() => setContractFormOpen(false)}
        onSubmit={handleContractSubmit}
        payers={payers.filter((p) => p.status === "active")}
        services={services}
      />

      <ClaimDetailsDrawer
        claim={selectedClaim}
        onClose={() => setSelectedClaimId(null)}
        onRefresh={refreshAll}
        onOpenResponse={setResponseTarget}
        onOpenResubmit={setResubmitTarget}
        onOpenPayment={setClaimPaymentTarget}
      />

      <RecordClaimResponseDrawer
        claimId={responseTarget?.id ?? null}
        claimNumber={responseTarget?.claimNumber}
        onClose={() => setResponseTarget(null)}
        onSubmit={handleRecordClaimResponse}
      />

      <ResubmitClaimDrawer
        claimId={resubmitTarget?.id ?? null}
        claimNumber={resubmitTarget?.claimNumber}
        rejectionReason={resubmitTarget?.rejectionReason}
        onClose={() => setResubmitTarget(null)}
        onSubmit={handleResubmitClaim}
      />

      <RecordClaimPaymentDrawer
        claimId={claimPaymentTarget?.id ?? null}
        claimNumber={claimPaymentTarget?.claimNumber}
        claimAmount={claimPaymentTarget?.amount}
        onClose={() => setClaimPaymentTarget(null)}
        onSubmit={handleRecordClaimPayment}
      />

      <AssignDenialDrawer denial={assignDenialTarget} onClose={() => setAssignDenialTarget(null)} onSubmit={handleAssignDenial} staffOptions={staffOptions} />

      <AssignCollectorDrawer row={assignCollectorTarget} onClose={() => setAssignCollectorTarget(null)} onSubmit={handleAssignCollector} staffOptions={staffOptions} />

      <RequestRefundDrawer payment={refundRequestTarget} onClose={() => setRefundRequestTarget(null)} onComplete={refreshAfterRefundRequest} />

      <RejectRefundDrawer refund={refundRejectTarget} onClose={() => setRefundRejectTarget(null)} onSubmit={handleRejectRefund} />

      <ProcessRefundDrawer refund={refundProcessTarget} onClose={() => setRefundProcessTarget(null)} onSubmit={handleProcessRefund} />

      <CreateAdjustmentDrawer
        invoiceId={addAdjustmentOpen ? (selectedInvoice?.id ?? null) : null}
        invoiceNumber={selectedInvoice?.invoiceNumber}
        onClose={() => setAddAdjustmentOpen(false)}
        onComplete={refreshAfterAdjustment}
      />

      <RequestWriteOffDrawer
        invoiceId={requestWriteOffOpen ? (selectedInvoice?.id ?? null) : null}
        invoiceNumber={selectedInvoice?.invoiceNumber}
        outstandingBalance={selectedInvoice?.balance}
        onClose={() => setRequestWriteOffOpen(false)}
        onComplete={refreshAfterWriteOffRequest}
      />

      <RejectWriteOffDrawer writeOff={writeOffRejectTarget} onClose={() => setWriteOffRejectTarget(null)} onSubmit={handleRejectWriteOff} />

      <CreateReconciliationBatchDrawer
        open={createBatchOpen}
        onClose={() => setCreateBatchOpen(false)}
        onSubmit={handleCreateBatch}
        payers={payers.filter((p) => p.status === "active")}
      />

      <BatchAllocationDrawer batch={selectedBatch} onClose={() => setSelectedBatchId(null)} onRefresh={loadReconciliation} />
    </HospitalAdminLayout>
  );
}
