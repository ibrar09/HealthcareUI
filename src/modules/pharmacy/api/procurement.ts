import { mockRequest } from "@shared/lib/api/client";
import { receiveBatch } from "./inventory";

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  leadTimeDays: number;
  active: boolean;
}

export type POStatus = "Requested" | "Approved" | "Ordered" | "Received";

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  medicationName: string;
  quantity: number;
  status: POStatus;
  requestedAt: string;
}

const suppliers: Supplier[] = [
  { id: "sup-1", name: "MedSource Pharmaceuticals", contact: "orders@medsource.example", leadTimeDays: 3, active: true },
  { id: "sup-2", name: "Al-Shifa Distributors", contact: "sales@alshifa.example", leadTimeDays: 5, active: true },
  { id: "sup-3", name: "Global Pharma Supply Co.", contact: "contact@globalpharma.example", leadTimeDays: 10, active: false },
];

let purchaseOrders: PurchaseOrder[] = [
  { id: "po-1", supplierId: "sup-1", medicationName: "Metformin 500mg", quantity: 500, status: "Requested", requestedAt: "08:00" },
  { id: "po-2", supplierId: "sup-2", medicationName: "Ibuprofen 400mg", quantity: 300, status: "Ordered", requestedAt: "2026-08-18" },
];

export const getSuppliers = () => mockRequest([...suppliers]);
export const getPurchaseOrders = () => mockRequest([...purchaseOrders]);

export function advancePurchaseOrder(id: string) {
  const po = purchaseOrders.find((x) => x.id === id);
  if (!po) return mockRequest([...purchaseOrders]);
  const next: Record<POStatus, POStatus> = { Requested: "Approved", Approved: "Ordered", Ordered: "Received", Received: "Received" };
  po.status = next[po.status];
  if (po.status === "Received") {
    receiveBatch({ medicationName: po.medicationName, batchNo: `RCV-${Date.now()}`, location: "Main Pharmacy — Receiving", quantity: po.quantity, minStock: 50, expiryDate: "2028-01-01" });
  }
  purchaseOrders = [...purchaseOrders];
  return mockRequest([...purchaseOrders]);
}

export function requestPurchaseOrder(supplierId: string, medicationName: string, quantity: number) {
  const po: PurchaseOrder = { id: `po-${Date.now()}`, supplierId, medicationName, quantity, status: "Requested", requestedAt: "just now" };
  purchaseOrders = [po, ...purchaseOrders];
  return mockRequest(po);
}
