import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DoctorLayout } from "@/layouts/DoctorLayout";
import { HelpArticleList } from "@modules/doctor-portal/components/HelpArticleList";
import { ContactSupportCard } from "@modules/doctor-portal/components/ContactSupportCard";
import * as api from "@modules/doctor-portal/api";
import type { HelpArticle, HelpCategory } from "@modules/doctor-portal/api";

type CategoryFilter = "all" | HelpCategory;

export function HelpCenter() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    api.getHelpArticles().then(setArticles);
  }, []);

  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category))), [articles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!query) return true;
      return a.question.toLowerCase().includes(query) || a.answer.toLowerCase().includes(query);
    });
  }, [articles, search, category]);

  return (
    <DoctorLayout active="Help Center">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Help Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">Find answers, or reach IT Support directly.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help…"
                aria-label="Search help articles"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${category === "all" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${category === c ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <HelpArticleList articles={filtered} />
        </div>

        <ContactSupportCard />
      </div>
    </DoctorLayout>
  );
}
