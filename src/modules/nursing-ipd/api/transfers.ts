import { mockRequest } from "@shared/lib/api/client";

export type TransferStatus = "Requested" | "Completed";

export interface TransferRequest {
  id: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  status: TransferStatus;
  requestedAt: string;
}

let transfers: TransferRequest[] = [
  { id: "tr-1", patientId: "np-3", fromLocation: "Medical Ward A — Room 202", toLocation: "Respiratory Step-Down Unit", reason: "Escalating oxygen requirement", status: "Requested", requestedAt: "08:20" },
];

export const getTransfers = () => mockRequest([...transfers]);

export function requestTransfer(patientId: string, fromLocation: string, toLocation: string, reason: string) {
  const t: TransferRequest = { id: `tr-${Date.now()}`, patientId, fromLocation, toLocation, reason, status: "Requested", requestedAt: "just now" };
  transfers = [t, ...transfers];
  return mockRequest(t);
}

export function completeTransfer(id: string) {
  const t = transfers.find((x) => x.id === id);
  if (t) t.status = "Completed";
  transfers = [...transfers];
  return mockRequest([...transfers]);
}
