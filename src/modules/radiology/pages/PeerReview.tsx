import { useEffect, useState } from "react";
import { RadiologyLayout } from "@/layouts/RadiologyLayout";
import * as api from "@modules/radiology/api";
import type { PeerReview as PeerReviewType } from "@modules/radiology/api";

export function PeerReview() {
  const [reviews, setReviews] = useState<PeerReviewType[]>([]);
  useEffect(() => { api.getPeerReviews().then(setReviews); }, []);

  return (
    <RadiologyLayout active="Peer Review">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Peer Review</h1>
        <p className="text-xs text-slate-500 mt-0.5">Quality peer review — visible to authorized radiologists only.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {reviews.map((r) => (
          <div key={r.id} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
              <p className="text-sm font-semibold text-slate-800">{r.orderId} — reviewed by {r.reviewer}</p>
              <span className={`text-[11px] font-semibold border rounded-full px-2.5 py-1 ${r.agreement ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>{r.agreement ? "Agreement" : "Disagreement"}</span>
            </div>
            <p className="text-xs text-slate-500">Original: {r.originalRadiologist} · {r.reviewedAt}</p>
            <p className="text-xs text-slate-600 mt-1">{r.notes}</p>
          </div>
        ))}
      </div>
    </RadiologyLayout>
  );
}
