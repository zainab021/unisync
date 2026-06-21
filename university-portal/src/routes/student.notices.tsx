import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/student/notices")({
  head: () => ({ meta: [{ title: "Notices — Student Portal" }] }),
  component: NoticesPage,
});

const API = "http://localhost:5000/api/notices";
const getToken = () => localStorage.getItem("token") ?? "";
const CATEGORIES = ["All", "Academic", "Library", "Event", "Finance", "General"];
const CATEGORY_COLOR: Record<string, string> = {
  Academic: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  Library:  "border-sky-500/30 bg-sky-500/15 text-sky-300",
  Event:    "border-violet-500/30 bg-violet-500/15 text-violet-300",
  Finance:  "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  General:  "border-slate-500/30 bg-slate-500/15 text-slate-300",
};

type Notice = { id: number; title: string; body: string; category: string; priority: string; created_at: string };

function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter]   = useState("All");

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => setNotices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = filter === "All" ? notices : notices.filter(n => n.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Notices</h1>
        <p className="mt-1 text-sm text-slate-400">Stay up to date with university announcements.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${filter === c ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-sm text-slate-500 py-12">No notices found.</p>}
        {filtered.map(n => (
          <div key={n.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl hover:border-amber-500/30 transition">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${CATEGORY_COLOR[n.category] ?? CATEGORY_COLOR.General}`}>
                  {n.category}
                </span>
                <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="mt-2 font-semibold text-white">{n.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
