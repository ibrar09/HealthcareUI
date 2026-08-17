import { useEffect, useRef, useState } from "react";
import { Pill } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { PharmacyDashboardPanel } from "@modules/hospital-admin/components/pharmacy/PharmacyDashboardPanel";
import { PrescriptionsPanel } from "@modules/hospital-admin/components/pharmacy/PrescriptionsPanel";
import { PrescriptionDetailsDrawer } from "@modules/hospital-admin/components/pharmacy/PrescriptionDetailsDrawer";
import { PrescriptionReasonDrawer } from "@modules/hospital-admin/components/pharmacy/PrescriptionReasonDrawer";
import type { ReasonDrawerMode } from "@modules/hospital-admin/components/pharmacy/PrescriptionReasonDrawer";
import { DispensingPanel } from "@modules/hospital-admin/components/pharmacy/DispensingPanel";
import { PharmacyPatientsPanel } from "@modules/hospital-admin/components/pharmacy/PharmacyPatientsPanel";
import { PharmacyPatientProfileDrawer } from "@modules/hospital-admin/components/pharmacy/PharmacyPatientProfileDrawer";
import { MedicationCatalogPanel } from "@modules/hospital-admin/components/pharmacy/MedicationCatalogPanel";
import { MedicationFormDrawer } from "@modules/hospital-admin/components/pharmacy/MedicationFormDrawer";
import { InventoryPanel } from "@modules/hospital-admin/components/pharmacy/InventoryPanel";
import { BatchesPanel } from "@modules/hospital-admin/components/pharmacy/BatchesPanel";
import { StockMovementsPanel } from "@modules/hospital-admin/components/pharmacy/StockMovementsPanel";
import { TransfersPanel } from "@modules/hospital-admin/components/pharmacy/TransfersPanel";
import { StockTransferFormDrawer } from "@modules/hospital-admin/components/pharmacy/StockTransferFormDrawer";
import { ProcurementPanel } from "@modules/hospital-admin/components/pharmacy/ProcurementPanel";
import { PurchaseOrderFormDrawer } from "@modules/hospital-admin/components/pharmacy/PurchaseOrderFormDrawer";
import { GoodsReceiptDrawer } from "@modules/hospital-admin/components/pharmacy/GoodsReceiptDrawer";
import { SupplierFormDrawer } from "@modules/hospital-admin/components/pharmacy/SupplierFormDrawer";
import { ReturnsPanel } from "@modules/hospital-admin/components/pharmacy/ReturnsPanel";
import { MedicationReturnFormDrawer } from "@modules/hospital-admin/components/pharmacy/MedicationReturnFormDrawer";
import { RecallsPanel } from "@modules/hospital-admin/components/pharmacy/RecallsPanel";
import { RecallFormDrawer } from "@modules/hospital-admin/components/pharmacy/RecallFormDrawer";
import { ControlledMedicinesPanel } from "@modules/hospital-admin/components/pharmacy/ControlledMedicinesPanel";
import { RefillsPanel } from "@modules/hospital-admin/components/pharmacy/RefillsPanel";
import { RejectRefillDrawer } from "@modules/hospital-admin/components/pharmacy/RejectRefillDrawer";
import { InpatientMedicationPanel } from "@modules/hospital-admin/components/pharmacy/InpatientMedicationPanel";
import { PharmacyInsurancePanel } from "@modules/hospital-admin/components/pharmacy/PharmacyInsurancePanel";
import { PharmacyReportsPanel } from "@modules/hospital-admin/components/pharmacy/PharmacyReportsPanel";
import { PharmacyAuditPanel } from "@modules/hospital-admin/components/pharmacy/PharmacyAuditPanel";
import { PharmacySettingsPanel } from "@modules/hospital-admin/components/pharmacy/PharmacySettingsPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  PharmacyDashboardData,
  PrescriptionRow,
  PrescriptionDetail,
  PrescriptionStatus,
  PrescriptionPriority,
  VerificationWarning,
  PharmacyPatientProfile,
  Medication,
  NewMedicationInput,
  InventoryOverview,
  BatchRow,
  StockTransactionRow,
  StockTransferRow,
  NewStockTransferInput,
  PharmacyLocation,
  PurchaseOrderRow,
  NewPurchaseOrderInput,
  Supplier,
  NewSupplierInput,
  MedicationReturnRow,
  NewMedicationReturnInput,
  MedicationRecallRow,
  NewRecallInput,
  ControlledRegisterRow,
  RefillRequestRow,
  InpatientOrderRow,
  PrescriptionInsuranceRow,
  PharmacyReportsData,
  PharmacyAuditEntry,
  PharmacyAuditEntityType,
  PharmacySettingsData,
} from "@modules/hospital-admin/api";

type Tab =
  | "dashboard"
  | "prescriptions"
  | "dispensing"
  | "patients"
  | "catalog"
  | "inventory"
  | "batches"
  | "movements"
  | "transfers"
  | "procurement"
  | "returns"
  | "recalls"
  | "controlled"
  | "refills"
  | "inpatient"
  | "insurance"
  | "reports"
  | "audit"
  | "settings";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Pharmacy", subtitle: "Prescriptions, dispensing, and inventory — the operational status right now." },
  prescriptions: { label: "Prescriptions", title: "Pharmacy Work Queue", subtitle: "Prescription → Received → Verification → Preparation → Dispensing → Completed." },
  dispensing: { label: "Dispensing", title: "Dispensing", subtitle: "Ready for dispensing — decrements real batch stock, never a silent quantity edit." },
  patients: { label: "Patients", title: "Patient Pharmacy Profile", subtitle: "Current medications and medication history — Prescribed → Dispensed only, never Administered." },
  catalog: { label: "Medication Catalog", title: "Medication Catalog", subtitle: "Structured generic/brand/strength/form/route — standardized, never invented terminology." },
  inventory: { label: "Inventory", title: "Pharmacy Inventory", subtitle: "Stock overview and the full stock list, computed from real batch records." },
  batches: { label: "Batches", title: "Batches & Expiry", subtitle: "Every unit of stock traces to a batch — 30/60/90-day expiry buckets with real actions." },
  movements: { label: "Stock Movements", title: "Stock Movements", subtitle: "Every inventory change is a transaction — auditable by construction." },
  transfers: { label: "Transfers", title: "Stock Transfers", subtitle: "Pharmacy-to-pharmacy/ward/OT/ICU transfers, request → approval → completion." },
  procurement: { label: "Procurement", title: "Procurement", subtitle: "Purchase Orders, Goods Receiving, and Suppliers — the pipeline that grows real inventory." },
  returns: { label: "Returns", title: "Medication Returns", subtitle: "Patient, ward, pharmacy, and supplier returns — restocking only for sealed/unused condition." },
  recalls: { label: "Recalls", title: "Medication Recalls", subtitle: "Manufacturer recall → affected batches quarantined immediately, prior dispensing flagged." },
  controlled: { label: "Controlled Medicines", title: "Controlled Medicines", subtitle: "Restricted medications and the auto-logged Controlled Medication Register." },
  refills: { label: "Refills", title: "Refill Management", subtitle: "Requested → Approved/Rejected → Ready → Dispensed." },
  inpatient: { label: "Inpatient Medication", title: "Inpatient Medication", subtitle: "Doctor → Order → Pharmacy Verification → Preparation → Ward. Administration stays nursing's own record." },
  insurance: { label: "Insurance", title: "Insurance / Pharmacy Coverage", subtitle: "Cross-reference view only — the ledger lives in Billing & Revenue." },
  reports: { label: "Reports", title: "Pharmacy Reports", subtitle: "Dispensing rate, turnaround, revenue, and stock consumption — computed from real records." },
  audit: { label: "Audit", title: "Audit Log", subtitle: "Every workflow action this section owns." },
  settings: { label: "Settings", title: "Settings", subtitle: "Configuration overview — edit values on their own screens." },
};

/**
 * Pharmacy — full module per PHARMACY_MODULE_SPEC.md, built entirely in one
 * pass (the user's own explicit instruction: "must complete also this not in
 * phase just do all"). Covers the full prescription→verification→dispensing→
 * inventory→procurement workflow, superseding the section's earlier "no
 * dispensing screen" placeholder note, since the user's own spec explicitly
 * asks for it. Strictly [oversight]-adjacent discipline maintained anyway:
 * verification warnings (allergy/duplicate-therapy/stock) are flags computed
 * from structured data, never a clinical-decision-support engine that
 * replaces pharmacist judgment (spec §4). Administration
 * (MedicationAdministration) is deliberately NOT modeled — Prescribed →
 * Dispensed only; nursing owns Administration in its own MAR, never merged
 * into one record (spec §20).
 */
export function PharmacyManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<PharmacyDashboardData | null>(null);

  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<PrescriptionPriority | "all">("all");
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);
  const [selectedRx, setSelectedRx] = useState<PrescriptionDetail | null>(null);
  const [rxWarnings, setRxWarnings] = useState<VerificationWarning[]>([]);
  const [reasonTarget, setReasonTarget] = useState<PrescriptionRow | null>(null);
  const [reasonMode, setReasonMode] = useState<ReasonDrawerMode>("cancel");

  const [dispensingQueue, setDispensingQueue] = useState<PrescriptionRow[]>([]);

  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<PharmacyPatientProfile | null>(null);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationSearch, setMedicationSearch] = useState("");
  const [medicationFormOpen, setMedicationFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<(NewMedicationInput & { id: string }) | null>(null);

  const [inventoryOverview, setInventoryOverview] = useState<InventoryOverview | null>(null);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [transactions, setTransactions] = useState<StockTransactionRow[]>([]);

  const [transfers, setTransfers] = useState<StockTransferRow[]>([]);
  const [transferFormOpen, setTransferFormOpen] = useState(false);
  const [locations, setLocations] = useState<PharmacyLocation[]>([]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRow[]>([]);
  const [poFormOpen, setPoFormOpen] = useState(false);
  const [goodsReceiptTarget, setGoodsReceiptTarget] = useState<PurchaseOrderRow | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);

  const [returns, setReturns] = useState<MedicationReturnRow[]>([]);
  const [returnFormOpen, setReturnFormOpen] = useState(false);

  const [recalls, setRecalls] = useState<MedicationRecallRow[]>([]);
  const [recallFormOpen, setRecallFormOpen] = useState(false);

  const [controlledMedications, setControlledMedications] = useState<Medication[]>([]);
  const [controlledRegister, setControlledRegister] = useState<ControlledRegisterRow[]>([]);

  const [refills, setRefills] = useState<RefillRequestRow[]>([]);
  const [rejectRefillTarget, setRejectRefillTarget] = useState<RefillRequestRow | null>(null);

  const [inpatientOrders, setInpatientOrders] = useState<InpatientOrderRow[]>([]);

  const [insuranceRows, setInsuranceRows] = useState<PrescriptionInsuranceRow[]>([]);

  const [reportsData, setReportsData] = useState<PharmacyReportsData | null>(null);

  const [auditLog, setAuditLog] = useState<PharmacyAuditEntry[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState<PharmacyAuditEntityType | "all">("all");

  const [pharmacySettings, setPharmacySettings] = useState<PharmacySettingsData | null>(null);

  // Same self-closing-drawer reopen race as OT's Pre-Op/Intra-Op/Recovery —
  // guard the prescription detail refetch with a ref so a since-cleared
  // selection is never reapplied by a stale in-flight promise.
  const selectedRxIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedRxIdRef.current = selectedRxId;
  }, [selectedRxId]);

  function refreshDashboard() {
    api.getPharmacyDashboard().then(setDashboard);
  }
  function refreshPrescriptions() {
    api.getPrescriptions({ status: statusFilter === "all" ? undefined : statusFilter, priority: priorityFilter === "all" ? undefined : priorityFilter, search }).then(setPrescriptions);
  }
  function refreshDispensingQueue() {
    api.getPrescriptions().then((all) => setDispensingQueue(all.filter((r) => r.status === "ready" || r.status === "dispensing")));
  }
  function refreshMedications() {
    api.getMedications({ includeInactive: true, search: medicationSearch }).then(setMedications);
  }
  function refreshInventory() {
    api.getInventoryOverview().then(setInventoryOverview);
    api.getBatches().then(setBatches);
  }
  function refreshTransactions() {
    api.getStockTransactions().then(setTransactions);
  }
  function refreshTransfers() {
    api.getStockTransfers().then(setTransfers);
  }
  function refreshProcurement() {
    api.getPurchaseOrders().then(setPurchaseOrders);
    api.getSuppliers().then(setSuppliers);
  }
  function refreshReturns() {
    api.getMedicationReturns().then(setReturns);
  }
  function refreshRecalls() {
    api.getRecalls().then(setRecalls);
  }
  function refreshControlled() {
    api.getControlledMedications().then(setControlledMedications);
    api.getControlledRegister().then(setControlledRegister);
  }
  function refreshRefills() {
    api.getRefillRequests().then(setRefills);
  }
  function refreshInpatient() {
    api.getInpatientOrders().then(setInpatientOrders);
  }
  function refreshInsurance() {
    api.getPrescriptionInsurance().then(setInsuranceRows);
  }
  function refreshReports() {
    api.getPharmacyReports().then(setReportsData);
  }
  function refreshAudit() {
    api.getPharmacyAuditLog({ entityType: auditEntityFilter === "all" ? undefined : auditEntityFilter, search: auditSearch }).then(setAuditLog);
  }
  function refreshSettings() {
    api.getPharmacySettings().then(setPharmacySettings);
  }

  useEffect(() => {
    refreshDashboard();
    refreshPrescriptions();
    refreshDispensingQueue();
    refreshMedications();
    refreshInventory();
    refreshTransactions();
    refreshTransfers();
    refreshProcurement();
    refreshReturns();
    refreshRecalls();
    refreshControlled();
    refreshRefills();
    refreshInpatient();
    refreshInsurance();
    refreshReports();
    refreshSettings();
    api.getPharmacyPatientOptions().then(setPatients);
    api.getPharmacyLocations().then(setLocations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    refreshMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicationSearch]);

  useEffect(() => {
    refreshAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditSearch, auditEntityFilter]);

  useEffect(() => {
    if (selectedRxId) {
      const id = selectedRxId;
      api.getPrescription(id).then((detail) => {
        if (selectedRxIdRef.current === id) setSelectedRx(detail);
      });
      setRxWarnings(api_getWarningsSafely(id));
    } else {
      setSelectedRx(null);
      setRxWarnings([]);
    }
  }, [selectedRxId]);

  function api_getWarningsSafely(id: string): VerificationWarning[] {
    try {
      return api.getVerificationWarnings(id);
    } catch {
      return [];
    }
  }

  useEffect(() => {
    if (selectedPatientId) api.getPharmacyPatientProfile(selectedPatientId).then(setPatientProfile);
    else setPatientProfile(null);
  }, [selectedPatientId]);

  function refreshAllAfterMutation() {
    refreshDashboard();
    refreshPrescriptions();
    refreshDispensingQueue();
    refreshInventory();
    refreshTransactions();
    refreshControlled();
    refreshRefills();
    refreshInsurance();
    refreshReports();
    refreshAudit();
    if (selectedRxId) {
      const id = selectedRxId;
      api.getPrescription(id).then((detail) => {
        if (selectedRxIdRef.current === id) setSelectedRx(detail);
      });
      setRxWarnings(api_getWarningsSafely(id));
    }
    if (selectedPatientId) api.getPharmacyPatientProfile(selectedPatientId).then(setPatientProfile);
  }

  async function handleReceive(id: string) {
    await api.receivePrescription(id, currentUserName);
    refreshAllAfterMutation();
  }
  async function handleStartReview(id: string) {
    await api.startPrescriptionReview(id, currentUserName);
    refreshAllAfterMutation();
  }
  async function handleVerify(id: string) {
    await api.verifyPrescription(id, currentUserName);
    refreshAllAfterMutation();
  }
  async function handleStartPreparing(id: string) {
    await api.startPreparing(id, currentUserName);
    refreshAllAfterMutation();
  }
  async function handleMarkReady(id: string) {
    await api.markReadyForDispensing(id, currentUserName);
    refreshAllAfterMutation();
  }
  async function handleDispense(id: string) {
    await api.dispensePrescription(id, currentUserName);
    refreshAllAfterMutation();
  }

  function openReasonDrawer(rx: PrescriptionRow, mode: ReasonDrawerMode) {
    setReasonMode(mode);
    setReasonTarget(rx);
  }

  async function handleMedicationSubmit(values: NewMedicationInput) {
    if (editingMedication) await api.updateMedication(editingMedication.id, values);
    else await api.createMedication(values);
    refreshMedications();
    refreshSettings();
  }
  async function handleToggleMedicationActive(m: Medication) {
    await api.setMedicationStatus(m.id, m.status === "active" ? "inactive" : "active");
    refreshMedications();
    refreshSettings();
  }

  async function handleQuarantineBatch(b: BatchRow) {
    await api.quarantineBatch(b.id, currentUserName);
    refreshInventory();
    refreshTransactions();
  }
  async function handleMarkExpiredBatch(b: BatchRow) {
    await api.markBatchExpired(b.id, currentUserName);
    refreshInventory();
    refreshTransactions();
    refreshDashboard();
  }
  async function handleReturnBatchToSupplier(b: BatchRow) {
    await api.returnBatchToSupplier(b.id, "Quality concern identified during review", currentUserName);
    refreshInventory();
    refreshTransactions();
  }

  async function handleTransferSubmit(values: NewStockTransferInput) {
    await api.requestStockTransfer(values, currentUserName);
    refreshTransfers();
  }
  async function handleApproveTransfer(t: StockTransferRow) {
    await api.approveStockTransfer(t.id, currentUserName);
    refreshTransfers();
  }
  async function handleCompleteTransfer(t: StockTransferRow) {
    await api.completeStockTransfer(t.id, currentUserName);
    refreshTransfers();
    refreshInventory();
    refreshTransactions();
  }

  async function handlePoSubmit(values: NewPurchaseOrderInput) {
    await api.createPurchaseOrder(values, currentUserName);
    refreshProcurement();
  }
  async function handleApprovePo(po: PurchaseOrderRow) {
    await api.approvePurchaseOrder(po.id, currentUserName);
    refreshProcurement();
  }
  async function handleSupplierSubmit(values: NewSupplierInput) {
    await api.createSupplier(values);
    refreshProcurement();
    refreshSettings();
  }
  function handleGoodsReceiptComplete() {
    refreshProcurement();
    refreshInventory();
    refreshTransactions();
    refreshDashboard();
  }

  async function handleReturnSubmit(values: NewMedicationReturnInput) {
    await api.recordMedicationReturn(values, currentUserName);
    refreshReturns();
  }
  async function handleRestockReturn(ret: MedicationReturnRow) {
    const batch = batches.find((b) => b.medicationId === ret.medicationId);
    if (!batch) return;
    await api.restockReturn(ret.id, batch.id, currentUserName);
    refreshReturns();
    refreshInventory();
    refreshTransactions();
  }

  async function handleRecallSubmit(values: NewRecallInput) {
    await api.initiateRecall(values, currentUserName);
    refreshRecalls();
    refreshInventory();
    refreshTransactions();
  }
  async function handleCloseRecall(r: MedicationRecallRow) {
    await api.closeRecall(r.id, currentUserName);
    refreshRecalls();
  }

  async function handleApproveRefill(r: RefillRequestRow) {
    await api.approveRefill(r.id, currentUserName);
    refreshRefills();
  }

  async function handleVerifyInpatient(o: InpatientOrderRow) {
    await api.verifyInpatientOrder(o.id, currentUserName);
    refreshInpatient();
  }
  async function handlePrepareInpatient(o: InpatientOrderRow) {
    await api.prepareInpatientOrder(o.id, currentUserName);
    refreshInpatient();
  }
  async function handleSupplyInpatient(o: InpatientOrderRow) {
    await api.supplyInpatientOrderToWard(o.id, currentUserName);
    refreshInpatient();
    refreshInventory();
    refreshTransactions();
  }

  return (
    <HospitalAdminLayout active="Pharmacy">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--module-pharmacy) 14%, transparent)", color: "var(--module-pharmacy)" }}>
          <Pill size={18} />
        </span>
        <h1 className="font-display font-bold text-2xl text-on-surface">{tabMeta[tab].title}</h1>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">{tabMeta[tab].subtitle}</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(tabMeta) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              tab === t ? "bg-gradient-brand text-white shadow-glow" : "text-on-surface-variant hover:bg-surface-container-low bg-white border border-line"
            }`}
          >
            {tabMeta[t].label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <PharmacyDashboardPanel data={dashboard} />}

      {tab === "prescriptions" && (
        <PrescriptionsPanel
          prescriptions={prescriptions}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSelect={setSelectedRxId}
        />
      )}

      {tab === "dispensing" && (
        <DispensingPanel prescriptions={dispensingQueue} onSelect={setSelectedRxId} onDispense={(rx) => handleDispense(rx.id)} />
      )}

      {tab === "patients" && <PharmacyPatientsPanel patients={patients} search={patientSearch} onSearchChange={setPatientSearch} onSelect={setSelectedPatientId} />}

      {tab === "catalog" && (
        <MedicationCatalogPanel
          medications={medications}
          search={medicationSearch}
          onSearchChange={setMedicationSearch}
          onAdd={() => {
            setEditingMedication(null);
            setMedicationFormOpen(true);
          }}
          onEdit={(m) => {
            setEditingMedication({
              id: m.id,
              genericName: m.genericName,
              brandName: m.brandName,
              strength: m.strength,
              form: m.form,
              route: m.route,
              manufacturer: m.manufacturer,
              packageSize: m.packageSize,
              unit: m.unit,
              prescriptionRequired: m.prescriptionRequired,
              storageRequirements: m.storageRequirements,
              controlledSubstance: m.controlledSubstance,
              unitPrice: m.unitPrice,
            });
            setMedicationFormOpen(true);
          }}
          onToggleActive={handleToggleMedicationActive}
        />
      )}

      {tab === "inventory" && <InventoryPanel overview={inventoryOverview} batches={batches} />}

      {tab === "batches" && <BatchesPanel batches={batches} onQuarantine={handleQuarantineBatch} onMarkExpired={handleMarkExpiredBatch} onReturnToSupplier={handleReturnBatchToSupplier} />}

      {tab === "movements" && <StockMovementsPanel transactions={transactions} />}

      {tab === "transfers" && <TransfersPanel transfers={transfers} onAdd={() => setTransferFormOpen(true)} onApprove={handleApproveTransfer} onComplete={handleCompleteTransfer} />}

      {tab === "procurement" && (
        <ProcurementPanel
          purchaseOrders={purchaseOrders}
          suppliers={suppliers}
          onNewPO={() => setPoFormOpen(true)}
          onApprovePO={handleApprovePo}
          onReceiveGoods={(po) => setGoodsReceiptTarget(po)}
          onAddSupplier={() => setSupplierFormOpen(true)}
        />
      )}

      {tab === "returns" && <ReturnsPanel returns={returns} onAdd={() => setReturnFormOpen(true)} onRestock={handleRestockReturn} />}

      {tab === "recalls" && <RecallsPanel recalls={recalls} onAdd={() => setRecallFormOpen(true)} onClose={handleCloseRecall} />}

      {tab === "controlled" && <ControlledMedicinesPanel medications={controlledMedications} register={controlledRegister} />}

      {tab === "refills" && <RefillsPanel refills={refills} onApprove={handleApproveRefill} onReject={(r) => setRejectRefillTarget(r)} />}

      {tab === "inpatient" && <InpatientMedicationPanel orders={inpatientOrders} onVerify={handleVerifyInpatient} onPrepare={handlePrepareInpatient} onSupply={handleSupplyInpatient} />}

      {tab === "insurance" && <PharmacyInsurancePanel rows={insuranceRows} />}

      {tab === "reports" && <PharmacyReportsPanel data={reportsData} />}

      {tab === "audit" && <PharmacyAuditPanel entries={auditLog} search={auditSearch} onSearchChange={setAuditSearch} entityFilter={auditEntityFilter} onEntityFilterChange={setAuditEntityFilter} />}

      {tab === "settings" && (
        <PharmacySettingsPanel settings={pharmacySettings} onGoToCatalog={() => setTab("catalog")} onGoToProcurement={() => setTab("procurement")} onGoToControlled={() => setTab("controlled")} />
      )}

      <PrescriptionDetailsDrawer
        prescription={selectedRx}
        warnings={rxWarnings}
        onClose={() => setSelectedRxId(null)}
        onReceive={() => selectedRx && handleReceive(selectedRx.id)}
        onStartReview={() => selectedRx && handleStartReview(selectedRx.id)}
        onVerify={() => selectedRx && handleVerify(selectedRx.id)}
        onReject={() => selectedRx && openReasonDrawer(selectedRx, "reject")}
        onStartPreparing={() => selectedRx && handleStartPreparing(selectedRx.id)}
        onMarkReady={() => selectedRx && handleMarkReady(selectedRx.id)}
        onDispense={() => selectedRx && handleDispense(selectedRx.id)}
        onReturn={() => selectedRx && openReasonDrawer(selectedRx, "return")}
        onCancel={() => selectedRx && openReasonDrawer(selectedRx, "cancel")}
      />

      <PrescriptionReasonDrawer prescription={reasonTarget} mode={reasonMode} onClose={() => setReasonTarget(null)} onComplete={refreshAllAfterMutation} />

      <PharmacyPatientProfileDrawer profile={patientProfile} onClose={() => setSelectedPatientId(null)} />

      <MedicationFormDrawer open={medicationFormOpen} onClose={() => setMedicationFormOpen(false)} onSubmit={handleMedicationSubmit} initialValues={editingMedication ?? undefined} />

      <StockTransferFormDrawer open={transferFormOpen} onClose={() => setTransferFormOpen(false)} onSubmit={handleTransferSubmit} batches={batches} locations={locations} />

      <PurchaseOrderFormDrawer open={poFormOpen} onClose={() => setPoFormOpen(false)} onSubmit={handlePoSubmit} medications={medications.filter((m) => m.status === "active")} suppliers={suppliers} />

      <GoodsReceiptDrawer purchaseOrder={goodsReceiptTarget} onClose={() => setGoodsReceiptTarget(null)} onComplete={handleGoodsReceiptComplete} locations={locations} />

      <SupplierFormDrawer open={supplierFormOpen} onClose={() => setSupplierFormOpen(false)} onSubmit={handleSupplierSubmit} />

      <MedicationReturnFormDrawer open={returnFormOpen} onClose={() => setReturnFormOpen(false)} onSubmit={handleReturnSubmit} medications={medications.filter((m) => m.status === "active")} />

      <RecallFormDrawer open={recallFormOpen} onClose={() => setRecallFormOpen(false)} onSubmit={handleRecallSubmit} medications={medications.filter((m) => m.status === "active")} batches={batches} />

      <RejectRefillDrawer refill={rejectRefillTarget} onClose={() => setRejectRefillTarget(null)} onComplete={refreshRefills} />
    </HospitalAdminLayout>
  );
}
