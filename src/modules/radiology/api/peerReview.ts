import { mockRequest } from "@shared/lib/api/client";

export interface PeerReview {
  id: string;
  orderId: string;
  reviewer: string;
  originalRadiologist: string;
  agreement: boolean;
  notes: string;
  reviewedAt: string;
}

let reviews: PeerReview[] = [
  { id: "peer-1", orderId: "rord-7", reviewer: "Dr. Radiologist Nadia Farooq", originalRadiologist: "Dr. Radiologist Iqra Sheikh", agreement: true, notes: "Concur with stable nodule assessment.", reviewedAt: "2026-08-19 14:00" },
];

export const getPeerReviews = () => mockRequest([...reviews]);

export function addPeerReview(input: Omit<PeerReview, "id" | "reviewedAt">) {
  const r: PeerReview = { ...input, id: `peer-${Date.now()}`, reviewedAt: "just now" };
  reviews = [r, ...reviews];
  return mockRequest(r);
}
