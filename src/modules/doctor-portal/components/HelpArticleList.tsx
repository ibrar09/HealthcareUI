import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { HelpArticle } from "@modules/doctor-portal/api";

interface HelpArticleListProps {
  articles: HelpArticle[];
}

/** Module-local — expandable FAQ list for the Help Center. */
export function HelpArticleList({ articles }: HelpArticleListProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm text-center">
        <p className="text-sm text-slate-400">No articles match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
      {articles.map((a) => {
        const isOpen = openId === a.id;
        return (
          <div key={a.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : a.id)}
              aria-expanded={isOpen}
              className="flex items-center justify-between gap-3 w-full text-left px-5 py-3.5 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{a.question}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{a.category}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <p className="px-5 pb-4 text-xs text-slate-600 leading-relaxed">{a.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
