import { useEffect, useRef, useState } from "react";
import { Boxes } from "lucide-react";
import { HospitalAdminLayout } from "@/layouts/HospitalAdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { InventoryDashboardPanel } from "@modules/hospital-admin/components/inventory/InventoryDashboardPanel";
import { ItemsPanel } from "@modules/hospital-admin/components/inventory/ItemsPanel";
import { ItemFormDrawer } from "@modules/hospital-admin/components/inventory/ItemFormDrawer";
import { StockOverviewPanel } from "@modules/hospital-admin/components/inventory/StockOverviewPanel";
import { BatchesPanel } from "@modules/hospital-admin/components/inventory/BatchesPanel";
import { WarehousesPanel } from "@modules/hospital-admin/components/inventory/WarehousesPanel";
import { WarehouseFormDrawer } from "@modules/hospital-admin/components/inventory/WarehouseFormDrawer";
import { StorageLocationFormDrawer } from "@modules/hospital-admin/components/inventory/StorageLocationFormDrawer";
import { RequisitionsPanel } from "@modules/hospital-admin/components/inventory/RequisitionsPanel";
import { RequisitionDetailDrawer } from "@modules/hospital-admin/components/inventory/RequisitionDetailDrawer";
import { RequisitionFormDrawer } from "@modules/hospital-admin/components/inventory/RequisitionFormDrawer";
import { StockReturnsPanel } from "@modules/hospital-admin/components/inventory/StockReturnsPanel";
import { StockReturnFormDrawer } from "@modules/hospital-admin/components/inventory/StockReturnFormDrawer";
import { StockTransfersPanel } from "@modules/hospital-admin/components/inventory/StockTransfersPanel";
import { StockTransferFormDrawer } from "@modules/hospital-admin/components/inventory/StockTransferFormDrawer";
import { ProcurementPanel } from "@modules/hospital-admin/components/inventory/ProcurementPanel";
import { PurchaseRequestFormDrawer } from "@modules/hospital-admin/components/inventory/PurchaseRequestFormDrawer";
import { PurchaseOrderFormDrawer } from "@modules/hospital-admin/components/inventory/PurchaseOrderFormDrawer";
import { GoodsReceiptDrawer } from "@modules/hospital-admin/components/inventory/GoodsReceiptDrawer";
import { SupplierFormDrawer } from "@modules/hospital-admin/components/inventory/SupplierFormDrawer";
import { InventoryCountsPanel } from "@modules/hospital-admin/components/inventory/InventoryCountsPanel";
import { CountDetailDrawer } from "@modules/hospital-admin/components/inventory/CountDetailDrawer";
import { CountFormDrawer } from "@modules/hospital-admin/components/inventory/CountFormDrawer";
import { AdjustmentsPanel } from "@modules/hospital-admin/components/inventory/AdjustmentsPanel";
import { AdjustmentFormDrawer } from "@modules/hospital-admin/components/inventory/AdjustmentFormDrawer";
import { ReservationsPanel } from "@modules/hospital-admin/components/inventory/ReservationsPanel";
import { ReservationFormDrawer } from "@modules/hospital-admin/components/inventory/ReservationFormDrawer";
import { RecallsPanel } from "@modules/hospital-admin/components/inventory/RecallsPanel";
import { RecallFormDrawer } from "@modules/hospital-admin/components/inventory/RecallFormDrawer";
import { RecallTraceDrawer } from "@modules/hospital-admin/components/inventory/RecallTraceDrawer";
import { DisposalPanel } from "@modules/hospital-admin/components/inventory/DisposalPanel";
import { DisposalFormDrawer } from "@modules/hospital-admin/components/inventory/DisposalFormDrawer";
import { AssetImplantPanel } from "@modules/hospital-admin/components/inventory/AssetImplantPanel";
import { StockMovementsPanel } from "@modules/hospital-admin/components/inventory/StockMovementsPanel";
import { AlertsPanel } from "@modules/hospital-admin/components/inventory/AlertsPanel";
import { InventoryReportsPanel } from "@modules/hospital-admin/components/inventory/InventoryReportsPanel";
import { InventoryAuditPanel } from "@modules/hospital-admin/components/inventory/InventoryAuditPanel";
import { InventorySettingsPanel } from "@modules/hospital-admin/components/inventory/InventorySettingsPanel";
import * as api from "@modules/hospital-admin/api";
import type {
  InventoryDashboardData,
  InventoryItem,
  NewInventoryItemInput,
  ItemCategory,
  ItemStockRow,
  StockStatus,
  InventoryBatchStatus,
  Warehouse,
  StorageLocation,
  NewWarehouseInput,
  NewStorageLocationInput,
  RequisitionStatus,
  NewRequisitionInput,
  ReturnStatus,
  NewStockReturnInput,
  TransferStatus,
  NewTransferInput,
  PurchaseRequestStatus,
  NewPurchaseRequestInput,
  InventoryPurchaseOrderStatus,
  NewInventoryPurchaseOrderInput,
  GoodsReceiptLine,
  NewInventorySupplierInput,
  CountStatus,
  NewCountInput,
  AdjustmentApprovalStatus,
  NewInventoryAdjustmentInput,
  ReservationStatus,
  NewReservationInput,
  InventoryRecallStatus,
  DisposalMethod,
  StockMovementType,
  InventoryAuditEntityType,
} from "@modules/hospital-admin/api";

type Tab =
  | "dashboard"
  | "items"
  | "stock"
  | "batches"
  | "warehouses"
  | "requisitions"
  | "returns"
  | "transfers"
  | "procurement"
  | "counts"
  | "adjustments"
  | "reservations"
  | "recalls"
  | "disposal"
  | "assets"
  | "movements"
  | "alerts"
  | "reports"
  | "audit"
  | "settings";

const tabMeta: Record<Tab, { label: string; title: string; subtitle: string }> = {
  dashboard: { label: "Dashboard", title: "Inventory", subtitle: "Stock, expiry, and procurement — the operational status right now." },
  items: { label: "Items", title: "Item Master", subtitle: "Category/type/UOM/identifiers — configurable, never hardcoded." },
  stock: { label: "Stock", title: "Stock Overview", subtitle: "On Hand / Available / Reserved / Damaged / Quarantined / In Transit / On Order, computed live." },
  batches: { label: "Batches", title: "Batches & Expiry", subtitle: "Every unit of stock traces to a batch — FEFO, expiry buckets, real quarantine actions." },
  warehouses: { label: "Warehouses", title: "Warehouses & Locations", subtitle: "Warehouse → Aisle → Rack → Shelf → Bin, so staff can find stock quickly." },
  requisitions: { label: "Requisitions", title: "Department Requisitions", subtitle: "Department → Approval → Picking → Issue → Received." },
  returns: { label: "Returns", title: "Stock Returns", subtitle: "Department→Store and Store→Supplier, with a real reason captured every time." },
  transfers: { label: "Transfers", title: "Stock Transfers", subtitle: "Warehouse-to-warehouse, request → approval → shipped → received." },
  procurement: { label: "Procurement", title: "Procurement", subtitle: "Purchase Requests → Purchase Orders → Goods Receiving, plus Suppliers." },
  counts: { label: "Inventory Counts", title: "Physical Stock Counts", subtitle: "Count → Compare → Variance → Approval → Adjustment." },
  adjustments: { label: "Adjustments", title: "Stock Adjustments", subtitle: "System vs. physical mismatch — reason, user, and approval, never a silent edit." },
  reservations: { label: "Reservations", title: "Stock Reservations", subtitle: "On Hand stays intact; Available shrinks — for scheduled procedures and requisitions." },
  recalls: { label: "Recalls", title: "Recalls & Quarantine", subtitle: "Manufacturer recall → affected batches quarantined immediately, usage traced." },
  disposal: { label: "Disposal", title: "Inventory Disposal", subtitle: "Expired/damaged stock, always with an authorized person and method on record." },
  assets: { label: "Assets & Implants", title: "Asset & Implant Tracking", subtitle: "Serial-tracked equipment, and every implant's patient/procedure/surgeon trace." },
  movements: { label: "Stock Movements", title: "Stock Movements", subtitle: "Every inventory change is a transaction — auditable by construction." },
  alerts: { label: "Alerts", title: "Inventory Alerts", subtitle: "Stock, procurement, and operational alerts — computed live, never stale." },
  reports: { label: "Reports", title: "Inventory Reports", subtitle: "Stock, movement, procurement, and consumption reports, plus turnover analytics." },
  audit: { label: "Audit", title: "Audit Log", subtitle: "Every workflow action this section owns." },
  settings: { label: "Settings", title: "Settings", subtitle: "Configuration overview — edit values on their own screens." },
};

const staffOptions = api.staffMembers.filter((s) => s.status === "active").map((s) => ({ id: s.id, name: s.name }));
const departmentOptions = api.departmentConfigs.filter((d) => d.active).map((d) => ({ id: d.id, name: d.name }));

/**
 * Inventory Management — Hospital Admin's [full] section, built entirely in
 * one pass per INVENTORY_MODULE_SPEC.md, continuing the same "not in phase
 * just do all" instruction that shipped OT and Pharmacy. Domain separation
 * (spec's own words): Inventory != Pharmacy != Procurement != Asset
 * Management != Billing — this module is the general hospital item/supply
 * system, cross-referencing but never merging with Pharmacy's medication
 * domain or OT's own per-case usage tabs.
 */
export function InventoryManagement() {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Zainab Qureshi";

  const [tab, setTab] = useState<Tab>("dashboard");

  const [dashboard, setDashboard] = useState<InventoryDashboardData | null>(null);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState<ItemCategory | "all">("all");
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(NewInventoryItemInput & { id: string }) | null>(null);

  const [stockRows, setStockRows] = useState<ItemStockRow[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState<ItemCategory | "all">("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatus | "all">("all");

  const [batches, setBatches] = useState<Awaited<ReturnType<typeof api.getInventoryBatches>>>([]);
  const [batchSearch, setBatchSearch] = useState("");
  const [batchStatusFilter, setBatchStatusFilter] = useState<InventoryBatchStatus | "all">("all");

  const [warehouses, setWarehouses] = useState<Awaited<ReturnType<typeof api.getWarehouses>>>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [warehouseFormOpen, setWarehouseFormOpen] = useState(false);
  const [locationFormOpen, setLocationFormOpen] = useState(false);

  const [requisitions, setRequisitions] = useState<Awaited<ReturnType<typeof api.getRequisitions>>>([]);
  const [reqStatusFilter, setReqStatusFilter] = useState<RequisitionStatus | "all">("all");
  const [reqSearch, setReqSearch] = useState("");
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [selectedRequisition, setSelectedRequisition] = useState<Awaited<ReturnType<typeof api.getRequisitionDetail>>>(null);
  const [requisitionFormOpen, setRequisitionFormOpen] = useState(false);

  const [stockReturns, setStockReturns] = useState<Awaited<ReturnType<typeof api.getStockReturns>>>([]);
  const [returnFormOpen, setReturnFormOpen] = useState(false);

  const [stockTransfers, setStockTransfers] = useState<Awaited<ReturnType<typeof api.getInventoryStockTransfers>>>([]);
  const [transferFormOpen, setTransferFormOpen] = useState(false);

  const [purchaseRequests, setPurchaseRequests] = useState<Awaited<ReturnType<typeof api.getPurchaseRequests>>>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<Awaited<ReturnType<typeof api.getInventoryPurchaseOrders>>>([]);
  const [inventorySuppliers, setInventorySuppliers] = useState<Awaited<ReturnType<typeof api.getInventorySuppliers>>>([]);
  const [prFormOpen, setPrFormOpen] = useState(false);
  const [poFormOpen, setPoFormOpen] = useState(false);
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [goodsReceiptTarget, setGoodsReceiptTarget] = useState<Awaited<ReturnType<typeof api.getInventoryPurchaseOrderDetail>>>(null);

  const [counts, setCounts] = useState<Awaited<ReturnType<typeof api.getInventoryCounts>>>([]);
  const [countFormOpen, setCountFormOpen] = useState(false);
  const [selectedCountId, setSelectedCountId] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<Awaited<ReturnType<typeof api.getCountDetail>>>(null);

  const [adjustments, setAdjustments] = useState<Awaited<ReturnType<typeof api.getInventoryAdjustments>>>([]);
  const [adjustmentFormOpen, setAdjustmentFormOpen] = useState(false);

  const [reservations, setReservations] = useState<Awaited<ReturnType<typeof api.getInventoryReservations>>>([]);
  const [reservationFormOpen, setReservationFormOpen] = useState(false);

  const [recalls, setRecalls] = useState<Awaited<ReturnType<typeof api.getInventoryRecalls>>>([]);
  const [quarantinedStock, setQuarantinedStock] = useState<Awaited<ReturnType<typeof api.getQuarantinedStock>>>({ batches: [], assets: [] });
  const [recallFormOpen, setRecallFormOpen] = useState(false);
  const [recallTraceId, setRecallTraceId] = useState<string | null>(null);
  const [recallTrace, setRecallTrace] = useState<Awaited<ReturnType<typeof api.getInventoryRecallTrace>>>(null);

  const [disposalRecords, setDisposalRecords] = useState<Awaited<ReturnType<typeof api.getDisposalRecords>>>([]);
  const [disposalFormOpen, setDisposalFormOpen] = useState(false);

  const [assets, setAssets] = useState<Awaited<ReturnType<typeof api.getSerializedAssets>>>([]);
  const [implantUsages, setImplantUsages] = useState<Awaited<ReturnType<typeof api.getImplantUsageRecords>>>([]);

  const [movements, setMovements] = useState<Awaited<ReturnType<typeof api.getStockMovements>>>([]);
  const [movementTypeFilter, setMovementTypeFilter] = useState<StockMovementType | "all">("all");

  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof api.getInventoryAlerts>>>([]);

  const [reportsData, setReportsData] = useState<Awaited<ReturnType<typeof api.getInventoryReports>> | null>(null);
  const [analyticsData, setAnalyticsData] = useState<Awaited<ReturnType<typeof api.getInventoryAnalytics>> | null>(null);

  const [auditLog, setAuditLog] = useState<Awaited<ReturnType<typeof api.getInventoryAuditLog>>>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState<InventoryAuditEntityType | "all">("all");

  const [settings, setSettings] = useState<Awaited<ReturnType<typeof api.getInventorySettings>> | null>(null);

  // Self-closing-drawer reopen race guard (same pattern proven in OT/Pharmacy):
  // a background refetch of the still-selected requisition/count must never
  // reopen the drawer after onClose() already cleared the selection.
  const selectedRequisitionIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedRequisitionIdRef.current = selectedRequisitionId;
  }, [selectedRequisitionId]);
  const selectedCountIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedCountIdRef.current = selectedCountId;
  }, [selectedCountId]);

  function refreshDashboard() {
    api.getInventoryDashboard().then(setDashboard);
  }
  function refreshItems() {
    api.getInventoryItems({ includeInactive: true, category: itemCategoryFilter === "all" ? undefined : itemCategoryFilter, search: itemSearch }).then(setItems);
  }
  function refreshStock() {
    api.getStockOverview({ category: stockCategoryFilter === "all" ? undefined : stockCategoryFilter, status: stockStatusFilter === "all" ? undefined : stockStatusFilter, search: stockSearch }).then(setStockRows);
  }
  function refreshBatches() {
    api.getInventoryBatches({ status: batchStatusFilter === "all" ? undefined : batchStatusFilter, search: batchSearch }).then(setBatches);
  }
  function refreshWarehouses() {
    api.getWarehouses().then(setWarehouses);
    api.getStorageLocations().then(setStorageLocations);
  }
  function refreshRequisitions() {
    api.getRequisitions({ status: reqStatusFilter === "all" ? undefined : reqStatusFilter, search: reqSearch }).then(setRequisitions);
  }
  function refreshReturns() {
    api.getStockReturns().then(setStockReturns);
  }
  function refreshTransfers() {
    api.getInventoryStockTransfers().then(setStockTransfers);
  }
  function refreshProcurement() {
    api.getPurchaseRequests().then(setPurchaseRequests);
    api.getInventoryPurchaseOrders().then(setPurchaseOrders);
    api.getInventorySuppliers({ includeInactive: true }).then(setInventorySuppliers);
  }
  function refreshCounts() {
    api.getInventoryCounts().then(setCounts);
  }
  function refreshAdjustments() {
    api.getInventoryAdjustments().then(setAdjustments);
  }
  function refreshReservations() {
    api.getInventoryReservations().then(setReservations);
  }
  function refreshRecalls() {
    api.getInventoryRecalls().then(setRecalls);
    api.getQuarantinedStock().then(setQuarantinedStock);
  }
  function refreshDisposal() {
    api.getDisposalRecords().then(setDisposalRecords);
  }
  function refreshAssets() {
    api.getSerializedAssets().then(setAssets);
    api.getImplantUsageRecords().then(setImplantUsages);
  }
  function refreshMovements() {
    api.getStockMovements({ movementType: movementTypeFilter === "all" ? undefined : movementTypeFilter }).then(setMovements);
  }
  function refreshAlerts() {
    api.getInventoryAlerts().then(setAlerts);
  }
  function refreshReports() {
    api.getInventoryReports().then(setReportsData);
    api.getInventoryAnalytics().then(setAnalyticsData);
  }
  function refreshAudit() {
    api.getInventoryAuditLog({ entityType: auditEntityFilter === "all" ? undefined : auditEntityFilter, search: auditSearch }).then(setAuditLog);
  }
  function refreshSettings() {
    api.getInventorySettings().then(setSettings);
  }

  useEffect(() => {
    refreshDashboard();
    refreshItems();
    refreshStock();
    refreshBatches();
    refreshWarehouses();
    refreshRequisitions();
    refreshReturns();
    refreshTransfers();
    refreshProcurement();
    refreshCounts();
    refreshAdjustments();
    refreshReservations();
    refreshRecalls();
    refreshDisposal();
    refreshAssets();
    refreshMovements();
    refreshAlerts();
    refreshReports();
    refreshAudit();
    refreshSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refreshItems(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [itemSearch, itemCategoryFilter]);
  useEffect(() => { refreshStock(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [stockSearch, stockCategoryFilter, stockStatusFilter]);
  useEffect(() => { refreshBatches(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [batchSearch, batchStatusFilter]);
  useEffect(() => { refreshRequisitions(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [reqStatusFilter, reqSearch]);
  useEffect(() => { refreshMovements(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [movementTypeFilter]);
  useEffect(() => { refreshAudit(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [auditSearch, auditEntityFilter]);

  useEffect(() => {
    if (selectedRequisitionId) {
      const id = selectedRequisitionId;
      api.getRequisitionDetail(id).then((detail) => {
        if (selectedRequisitionIdRef.current === id) setSelectedRequisition(detail);
      });
    } else {
      setSelectedRequisition(null);
    }
  }, [selectedRequisitionId]);

  useEffect(() => {
    if (selectedCountId) {
      const id = selectedCountId;
      api.getCountDetail(id).then((detail) => {
        if (selectedCountIdRef.current === id) setSelectedCount(detail);
      });
    } else {
      setSelectedCount(null);
    }
  }, [selectedCountId]);

  useEffect(() => {
    if (recallTraceId) api.getInventoryRecallTrace(recallTraceId).then(setRecallTrace);
    else setRecallTrace(null);
  }, [recallTraceId]);

  function refreshRequisitionDetailIfOpen() {
    if (selectedRequisitionId) {
      const id = selectedRequisitionId;
      api.getRequisitionDetail(id).then((detail) => {
        if (selectedRequisitionIdRef.current === id) setSelectedRequisition(detail);
      });
    }
  }
  function refreshCountDetailIfOpen() {
    if (selectedCountId) {
      const id = selectedCountId;
      api.getCountDetail(id).then((detail) => {
        if (selectedCountIdRef.current === id) setSelectedCount(detail);
      });
    }
  }

  // --- Items -----------------------------------------------------------------
  async function handleItemSubmit(values: NewInventoryItemInput) {
    if (editingItem) await api.updateInventoryItem(editingItem.id, values);
    else await api.createInventoryItem(values);
    refreshItems();
    refreshDashboard();
    refreshSettings();
  }
  async function handleToggleItemStatus(item: InventoryItem) {
    await api.setInventoryItemStatus(item.id, item.status === "active" ? "inactive" : "active");
    refreshItems();
  }

  // --- Batches -----------------------------------------------------------------
  async function handleQuarantineBatch(b: { id: string }, reason: string) {
    await api.quarantineInventoryBatch(b.id, reason, currentUserName);
    refreshBatches();
    refreshStock();
    refreshRecalls();
    refreshDashboard();
  }
  async function handleMarkExpiredBatch(b: { id: string }) {
    await api.markInventoryBatchExpired(b.id, currentUserName);
    refreshBatches();
    refreshStock();
    refreshDashboard();
  }

  // --- Warehouses --------------------------------------------------------------
  async function handleWarehouseSubmit(values: NewWarehouseInput) {
    await api.createWarehouse(values);
    refreshWarehouses();
    refreshSettings();
  }
  async function handleLocationSubmit(values: NewStorageLocationInput) {
    await api.createStorageLocation(values);
    refreshWarehouses();
  }

  // --- Requisitions --------------------------------------------------------------
  async function handleRequisitionSubmit(values: NewRequisitionInput) {
    await api.createRequisition(values);
    refreshRequisitions();
    refreshDashboard();
  }
  async function handleStartReview() {
    if (!selectedRequisitionId) return;
    await api.startRequisitionReview(selectedRequisitionId, currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
  }
  async function handleApproveRequisition() {
    if (!selectedRequisition) return;
    const approved = Object.fromEntries(selectedRequisition.items.map((l) => [l.itemId, l.quantityRequested]));
    await api.approveRequisition(selectedRequisition.id, approved, currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
  }
  async function handleRejectRequisition() {
    if (!selectedRequisitionId) return;
    await api.rejectRequisition(selectedRequisitionId, "Rejected by Inventory Management", currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
  }
  async function handleStartPicking() {
    if (!selectedRequisitionId) return;
    await api.startPickingRequisition(selectedRequisitionId, currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
  }
  async function handleIssueRequisition() {
    if (!selectedRequisitionId) return;
    await api.issueRequisition(selectedRequisitionId, currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
    refreshBatches();
    refreshStock();
    refreshMovements();
    refreshDashboard();
    refreshAlerts();
  }
  async function handleReceiveRequisition() {
    if (!selectedRequisitionId) return;
    await api.receiveRequisition(selectedRequisitionId, currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
  }
  async function handleCancelRequisition() {
    if (!selectedRequisitionId) return;
    await api.cancelRequisition(selectedRequisitionId, currentUserName);
    refreshRequisitions();
    refreshRequisitionDetailIfOpen();
  }

  // --- Returns --------------------------------------------------------------
  async function handleReturnSubmit(values: NewStockReturnInput) {
    await api.createStockReturn(values);
    refreshReturns();
  }
  async function handleApproveReturn(r: { id: string }) {
    await api.approveStockReturn(r.id, currentUserName);
    refreshReturns();
  }
  async function handleReceiveReturn(r: { id: string }) {
    await api.receiveStockReturn(r.id, currentUserName);
    refreshReturns();
    refreshBatches();
    refreshStock();
    refreshMovements();
  }
  async function handleRejectReturn(r: { id: string }) {
    await api.rejectStockReturn(r.id, currentUserName);
    refreshReturns();
  }

  // --- Transfers --------------------------------------------------------------
  async function handleTransferSubmit(values: NewTransferInput) {
    await api.createInventoryStockTransfer(values);
    refreshTransfers();
  }
  async function handleApproveTransfer(t: { id: string }) {
    await api.approveInventoryStockTransfer(t.id, currentUserName);
    refreshTransfers();
  }
  async function handleShipTransfer(t: { id: string }) {
    await api.shipInventoryStockTransfer(t.id, currentUserName);
    refreshTransfers();
    refreshBatches();
    refreshStock();
    refreshMovements();
  }
  async function handleReceiveTransfer(t: { id: string }) {
    await api.receiveInventoryStockTransfer(t.id, currentUserName);
    refreshTransfers();
    refreshBatches();
    refreshStock();
    refreshMovements();
  }
  async function handleRejectTransfer(t: { id: string }) {
    await api.rejectInventoryStockTransfer(t.id, currentUserName);
    refreshTransfers();
  }

  // --- Procurement --------------------------------------------------------------
  async function handlePrSubmit(values: NewPurchaseRequestInput) {
    await api.createPurchaseRequest(values);
    refreshProcurement();
  }
  async function handleApprovePr(pr: { id: string }) {
    await api.approvePurchaseRequest(pr.id, currentUserName);
    refreshProcurement();
  }
  async function handleRejectPr(pr: { id: string }) {
    await api.rejectPurchaseRequest(pr.id, currentUserName);
    refreshProcurement();
  }
  async function handlePoSubmit(values: NewInventoryPurchaseOrderInput) {
    await api.createInventoryPurchaseOrder(values);
    refreshProcurement();
  }
  async function handleSendPo(po: { id: string }) {
    await api.sendInventoryPurchaseOrder(po.id, currentUserName);
    refreshProcurement();
  }
  async function handleOpenGoodsReceipt(po: { id: string }) {
    const detail = await api.getInventoryPurchaseOrderDetail(po.id);
    setGoodsReceiptTarget(detail);
  }
  async function handleGoodsReceiptSubmit(lines: GoodsReceiptLine[], warehouseId: string) {
    if (!goodsReceiptTarget) return;
    await api.receiveInventoryGoods({ purchaseOrderId: goodsReceiptTarget.id, lines, receivedBy: currentUserName, warehouseId });
    refreshProcurement();
    refreshBatches();
    refreshStock();
    refreshMovements();
    refreshDashboard();
    refreshAlerts();
  }
  async function handleSupplierSubmit(values: NewInventorySupplierInput) {
    await api.createInventorySupplier(values);
    refreshProcurement();
    refreshSettings();
  }

  // --- Counts --------------------------------------------------------------
  async function handleCountSubmit(values: NewCountInput) {
    await api.createInventoryCount(values);
    refreshCounts();
  }
  async function handleStartCount() {
    if (!selectedCountId) return;
    await api.startInventoryCount(selectedCountId, currentUserName);
    refreshCounts();
    refreshCountDetailIfOpen();
  }
  async function handleRecordCountLine(itemId: string, countedQuantity: number, varianceReason?: string) {
    if (!selectedCountId) return;
    await api.recordCountLine(selectedCountId, itemId, countedQuantity, varianceReason);
    refreshCountDetailIfOpen();
  }
  async function handleSubmitCountForReview() {
    if (!selectedCountId) return;
    await api.submitCountForReview(selectedCountId, currentUserName);
    refreshCounts();
    refreshCountDetailIfOpen();
  }
  async function handleApproveCountAndAdjust() {
    if (!selectedCountId) return;
    await api.approveCountAndAdjust(selectedCountId, currentUserName);
    refreshCounts();
    refreshCountDetailIfOpen();
    refreshBatches();
    refreshStock();
    refreshAdjustments();
    refreshMovements();
    refreshDashboard();
  }

  // --- Adjustments --------------------------------------------------------------
  async function handleAdjustmentSubmit(values: NewInventoryAdjustmentInput) {
    await api.requestAdjustment(values);
    refreshAdjustments();
    refreshBatches();
    refreshStock();
    refreshMovements();
    refreshDashboard();
  }
  async function handleApproveAdjustment(a: { id: string }) {
    await api.approveAdjustment(a.id, currentUserName);
    refreshAdjustments();
    refreshBatches();
    refreshStock();
    refreshMovements();
  }
  async function handleRejectAdjustment(a: { id: string }) {
    await api.rejectAdjustment(a.id, currentUserName);
    refreshAdjustments();
  }

  // --- Reservations --------------------------------------------------------------
  async function handleReservationSubmit(values: NewReservationInput) {
    await api.createInventoryReservation(values, currentUserName);
    refreshReservations();
    refreshStock();
  }
  async function handleFulfillReservation(r: { id: string }) {
    await api.fulfillInventoryReservation(r.id, currentUserName);
    refreshReservations();
    refreshStock();
  }
  async function handleCancelReservation(r: { id: string }) {
    await api.cancelInventoryReservation(r.id, currentUserName);
    refreshReservations();
    refreshStock();
  }

  // --- Recalls --------------------------------------------------------------
  async function handleRecallSubmit(values: { itemId: string; affectedBatchIds: string[]; manufacturer: string; reason: string }) {
    await api.initiateInventoryRecall({ ...values, actor: currentUserName });
    refreshRecalls();
    refreshBatches();
    refreshStock();
    refreshAlerts();
  }
  async function handleCloseRecallInTrace() {
    if (!recallTraceId) return;
    await api.closeInventoryRecall(recallTraceId, "Recall investigation closed", currentUserName);
    refreshRecalls();
    setRecallTraceId(null);
  }

  // --- Disposal --------------------------------------------------------------
  async function handleDisposalSubmit(values: { itemId: string; batchId?: string; quantity: number; reason: string; method: DisposalMethod; authorizedBy: string; witnessedBy?: string }) {
    await api.recordDisposal(values);
    refreshDisposal();
    refreshBatches();
    refreshStock();
    refreshMovements();
    refreshDashboard();
  }

  return (
    <HospitalAdminLayout active="Inventory">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--module-inventory) 14%, transparent)", color: "var(--module-inventory)" }}>
          <Boxes size={18} />
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

      {tab === "dashboard" && <InventoryDashboardPanel data={dashboard} />}

      {tab === "items" && (
        <ItemsPanel
          items={items}
          search={itemSearch}
          onSearchChange={setItemSearch}
          categoryFilter={itemCategoryFilter}
          onCategoryFilterChange={setItemCategoryFilter}
          onAdd={() => {
            setEditingItem(null);
            setItemFormOpen(true);
          }}
          onEdit={(item) => {
            setEditingItem({
              id: item.id,
              name: item.name,
              description: item.description,
              category: item.category,
              subcategory: item.subcategory,
              brand: item.brand,
              manufacturer: item.manufacturer,
              model: item.model,
              baseUnit: item.baseUnit,
              purchaseUnit: item.purchaseUnit,
              manufacturerCode: item.manufacturerCode,
              gtin: item.gtin,
              barcode: item.barcode,
              isSerialTracked: item.isSerialTracked,
              isBatchTracked: item.isBatchTracked,
              isImplant: item.isImplant,
              reorderLevel: item.reorderLevel,
              reorderQuantity: item.reorderQuantity,
              maxStockLevel: item.maxStockLevel,
              unitCost: item.unitCost,
            });
            setItemFormOpen(true);
          }}
          onToggleStatus={handleToggleItemStatus}
        />
      )}

      {tab === "stock" && (
        <StockOverviewPanel
          rows={stockRows}
          search={stockSearch}
          onSearchChange={setStockSearch}
          categoryFilter={stockCategoryFilter}
          onCategoryFilterChange={setStockCategoryFilter}
          statusFilter={stockStatusFilter}
          onStatusFilterChange={setStockStatusFilter}
        />
      )}

      {tab === "batches" && (
        <BatchesPanel
          batches={batches}
          search={batchSearch}
          onSearchChange={setBatchSearch}
          statusFilter={batchStatusFilter}
          onStatusFilterChange={setBatchStatusFilter}
          onQuarantine={handleQuarantineBatch}
          onMarkExpired={handleMarkExpiredBatch}
        />
      )}

      {tab === "warehouses" && (
        <WarehousesPanel warehouses={warehouses} locations={storageLocations} onAdd={() => setWarehouseFormOpen(true)} onAddLocation={() => setLocationFormOpen(true)} />
      )}

      {tab === "requisitions" && (
        <RequisitionsPanel
          requisitions={requisitions}
          statusFilter={reqStatusFilter}
          onStatusFilterChange={setReqStatusFilter}
          search={reqSearch}
          onSearchChange={setReqSearch}
          onSelect={setSelectedRequisitionId}
          onAdd={() => setRequisitionFormOpen(true)}
        />
      )}

      {tab === "returns" && (
        <StockReturnsPanel returns={stockReturns} onAdd={() => setReturnFormOpen(true)} onApprove={handleApproveReturn} onReceive={handleReceiveReturn} onReject={handleRejectReturn} />
      )}

      {tab === "transfers" && (
        <StockTransfersPanel
          transfers={stockTransfers}
          onAdd={() => setTransferFormOpen(true)}
          onApprove={handleApproveTransfer}
          onShip={handleShipTransfer}
          onReceive={handleReceiveTransfer}
          onReject={handleRejectTransfer}
        />
      )}

      {tab === "procurement" && (
        <ProcurementPanel
          purchaseRequests={purchaseRequests}
          purchaseOrders={purchaseOrders}
          suppliers={inventorySuppliers}
          onNewPR={() => setPrFormOpen(true)}
          onApprovePR={handleApprovePr}
          onRejectPR={handleRejectPr}
          onNewPO={() => setPoFormOpen(true)}
          onSendPO={handleSendPo}
          onReceiveGoods={handleOpenGoodsReceipt}
          onAddSupplier={() => setSupplierFormOpen(true)}
        />
      )}

      {tab === "counts" && <InventoryCountsPanel counts={counts} onAdd={() => setCountFormOpen(true)} onSelect={setSelectedCountId} />}

      {tab === "adjustments" && <AdjustmentsPanel adjustments={adjustments} onAdd={() => setAdjustmentFormOpen(true)} onApprove={handleApproveAdjustment} onReject={handleRejectAdjustment} />}

      {tab === "reservations" && (
        <ReservationsPanel reservations={reservations} onAdd={() => setReservationFormOpen(true)} onFulfill={handleFulfillReservation} onCancel={handleCancelReservation} />
      )}

      {tab === "recalls" && (
        <RecallsPanel
          recalls={recalls}
          quarantinedBatches={quarantinedStock.batches}
          onAdd={() => setRecallFormOpen(true)}
          onView={(r) => setRecallTraceId(r.id)}
          onClose={(r) => {
            setRecallTraceId(r.id);
          }}
        />
      )}

      {tab === "disposal" && <DisposalPanel records={disposalRecords} onAdd={() => setDisposalFormOpen(true)} />}

      {tab === "assets" && <AssetImplantPanel assets={assets} implantUsages={implantUsages} />}

      {tab === "movements" && <StockMovementsPanel movements={movements} typeFilter={movementTypeFilter} onTypeFilterChange={setMovementTypeFilter} />}

      {tab === "alerts" && <AlertsPanel alerts={alerts} />}

      {tab === "reports" && <InventoryReportsPanel reports={reportsData} analytics={analyticsData} />}

      {tab === "audit" && (
        <InventoryAuditPanel entries={auditLog} search={auditSearch} onSearchChange={setAuditSearch} entityFilter={auditEntityFilter} onEntityFilterChange={setAuditEntityFilter} />
      )}

      {tab === "settings" && (
        <InventorySettingsPanel
          settings={settings}
          onGoToItems={() => setTab("items")}
          onGoToProcurement={() => setTab("procurement")}
          onGoToWarehouses={() => setTab("warehouses")}
        />
      )}

      <ItemFormDrawer open={itemFormOpen} onClose={() => setItemFormOpen(false)} onSubmit={handleItemSubmit} initialValues={editingItem ?? undefined} />

      <WarehouseFormDrawer open={warehouseFormOpen} onClose={() => setWarehouseFormOpen(false)} onSubmit={handleWarehouseSubmit} />
      <StorageLocationFormDrawer open={locationFormOpen} onClose={() => setLocationFormOpen(false)} onSubmit={handleLocationSubmit} warehouses={warehouses} />

      <RequisitionDetailDrawer
        requisition={selectedRequisition}
        onClose={() => setSelectedRequisitionId(null)}
        onStartReview={handleStartReview}
        onApprove={handleApproveRequisition}
        onReject={handleRejectRequisition}
        onStartPicking={handleStartPicking}
        onIssue={handleIssueRequisition}
        onReceive={handleReceiveRequisition}
        onCancel={handleCancelRequisition}
      />
      <RequisitionFormDrawer open={requisitionFormOpen} onClose={() => setRequisitionFormOpen(false)} onSubmit={handleRequisitionSubmit} items={items} departments={departmentOptions} staffOptions={staffOptions} />

      <StockReturnFormDrawer
        open={returnFormOpen}
        onClose={() => setReturnFormOpen(false)}
        onSubmit={handleReturnSubmit}
        items={items}
        warehouses={warehouses}
        departments={departmentOptions}
        suppliers={inventorySuppliers}
        staffOptions={staffOptions}
      />

      <StockTransferFormDrawer open={transferFormOpen} onClose={() => setTransferFormOpen(false)} onSubmit={handleTransferSubmit} items={items} warehouses={warehouses} staffOptions={staffOptions} />

      <PurchaseRequestFormDrawer open={prFormOpen} onClose={() => setPrFormOpen(false)} onSubmit={handlePrSubmit} items={items} departments={departmentOptions} staffOptions={staffOptions} />
      <PurchaseOrderFormDrawer open={poFormOpen} onClose={() => setPoFormOpen(false)} onSubmit={handlePoSubmit} items={items} suppliers={inventorySuppliers} staffOptions={staffOptions} />
      <GoodsReceiptDrawer purchaseOrder={goodsReceiptTarget} onClose={() => setGoodsReceiptTarget(null)} onSubmit={handleGoodsReceiptSubmit} warehouses={warehouses} />
      <SupplierFormDrawer open={supplierFormOpen} onClose={() => setSupplierFormOpen(false)} onSubmit={handleSupplierSubmit} />

      <CountFormDrawer open={countFormOpen} onClose={() => setCountFormOpen(false)} onSubmit={handleCountSubmit} items={items} warehouses={warehouses} staffOptions={staffOptions} />
      <CountDetailDrawer
        count={selectedCount}
        onClose={() => setSelectedCountId(null)}
        onStart={handleStartCount}
        onRecordLine={handleRecordCountLine}
        onSubmitForReview={handleSubmitCountForReview}
        onApproveAndAdjust={handleApproveCountAndAdjust}
      />

      <AdjustmentFormDrawer open={adjustmentFormOpen} onClose={() => setAdjustmentFormOpen(false)} onSubmit={handleAdjustmentSubmit} items={items} warehouses={warehouses} staffOptions={staffOptions} />

      <ReservationFormDrawer open={reservationFormOpen} onClose={() => setReservationFormOpen(false)} onSubmit={handleReservationSubmit} items={items} departments={departmentOptions} />

      <RecallFormDrawer open={recallFormOpen} onClose={() => setRecallFormOpen(false)} onSubmit={handleRecallSubmit} items={items} batches={batches} />
      <RecallTraceDrawer data={recallTrace} onClose={() => setRecallTraceId(null)} onCloseRecall={handleCloseRecallInTrace} />

      <DisposalFormDrawer open={disposalFormOpen} onClose={() => setDisposalFormOpen(false)} onSubmit={handleDisposalSubmit} items={items} batches={batches} staffOptions={staffOptions} />
    </HospitalAdminLayout>
  );
}
