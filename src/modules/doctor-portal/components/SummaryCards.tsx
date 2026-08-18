import { ChevronRight } from "lucide-react";
import { MicroBarChart } from "./MicroBarChart";
import type { SummaryCardData } from "@modules/doctor-portal/api";

interface SummaryCardsProps {
  cards: SummaryCardData[];
}

/** Module-local — the 5-card KPI row (spec §1 "Cards such as..."). */
export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-600">{card.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-800 leading-none mb-1">{card.count}</div>
              <div className="text-[11px] text-slate-400 font-medium">{card.subtitle}</div>
            </div>
            <MicroBarChart color={card.chartColor} values={card.chartValues} />
          </div>
        </div>
      ))}
    </div>
  );
}
