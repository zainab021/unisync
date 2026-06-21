import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Book, Search } from "lucide-react";

export const Route = createFileRoute("/student/library")({
  head: () => ({ meta: [{ title: "Library — Student Portal" }] }),
  component: LibraryPage,
});

const API = "http://localhost:5000/api/library";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

type BookItem = { id: number; title: string; author: string; category: string; isbn?: string; total_copies: number; available_copies: number; location?: string };

const CAT_COLORS: Record<string, string> = {
  "Computer Science": "text-sky-400 bg-sky-500/10 border-sky-500/30",
  "Mathematics":      "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "Physics":          "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Literature":       "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "Engineering":      "text-rose-400 bg-rose-500/10 border-rose-500/30",
  "General":          "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

function LibraryPage() {
  const [books, setBooks]       = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${API}/categories`, { headers: h() }).then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetchBooks();
  }, []);

  useEffect(() => { fetchBooks(); }, [search, category]);

  async function fetchBooks() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)          params.append("search", search);
    if (category !== "All") params.append("category", category);
    try {
      const res  = await fetch(`${API}?${params}`, { headers: h() });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  }

  const available = books.filter(b => b.available_copies > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Library</h1>
          <p className="mt-1 text-sm text-slate-400">Browse the university book collection.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
          <p className="text-xs text-slate-500">Available</p>
          <p className="text-2xl font-bold text-emerald-400">{available}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..."
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
        </select>
      </div>

      {/* Books Grid */}
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading books...</p>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <Book className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">No books found.</p>
          <p className="mt-1 text-xs text-slate-600">Admin can add books to the library.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map(b => {
            const cls = CAT_COLORS[b.category] ?? CAT_COLORS.General;
            const avail = b.available_copies > 0;
            return (
              <div key={b.id} className={`rounded-2xl border ${avail ? "border-white/10" : "border-white/5 opacity-60"} bg-white/[0.03] p-5 flex flex-col`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${cls}`}>{b.category}</span>
                  <span className={`text-xs font-semibold ${avail ? "text-emerald-400" : "text-rose-400"}`}>
                    {avail ? `${b.available_copies} Available` : "Not Available"}
                  </span>
                </div>
                <h3 className="font-bold text-white leading-snug">{b.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{b.author}</p>
                {b.isbn && <p className="mt-1 text-xs text-slate-600">ISBN: {b.isbn}</p>}
                {b.location && (
                  <p className="mt-auto pt-3 text-xs text-slate-500">📍 {b.location}</p>
                )}
                <div className="mt-3 h-1 w-full rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${avail ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${(b.available_copies / b.total_copies) * 100}%` }} />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-600">{b.available_copies}/{b.total_copies} copies</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
