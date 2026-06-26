import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/teacher/notices")({
  head: () => ({ meta: [{ title: "Notices — Teacher Portal" }] }),
  component: TeacherNoticesPage,
});

const API = "https://unisync-4ovf.onrender.com/api/notices";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });
const CATEGORIES = ["Academic", "Library", "Event", "Finance", "General"];
const CATEGORY_COLOR: Record<string, string> = {
  Academic: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  Library:  "border-sky-500/30 bg-sky-500/15 text-sky-300",
  Event:    "border-violet-500/30 bg-violet-500/15 text-violet-300",
  Finance:  "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  General:  "border-slate-500/30 bg-slate-500/15 text-slate-300",
};
type Notice = { id: number; title: string; body: string; category: string; priority: string; created_at: string };

function TeacherNoticesPage() {
  const [notices, setNotices]     = useState<Notice[]>([]);
  const [filter, setFilter]       = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState({ title: "", category: "Academic", body: "", priority: "Medium" });
  const [loading, setLoading]     = useState(false);

  useEffect(() => { fetchNotices(); }, []);

  async function fetchNotices() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function handlePost() {
    if (!form.title || !form.body) { toast.error("Title and message required"); return; }
    setLoading(true);
    try {
      await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
      toast.success("Notice posted");
      setModalOpen(false);
      setForm({ title: "", category: "Academic", body: "", priority: "Medium" });
      fetchNotices();
    } catch { toast.error("Failed to post"); }
    setLoading(false);
  }

  const filtered = filter === "All" ? notices : notices.filter(n => n.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Notices</h1>
          <p className="mt-1 text-sm text-slate-400">University announcements.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Post Notice
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${filter === c ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-sm text-slate-500 py-12">No notices found.</p>}
        {filtered.map(n => (
          <div key={n.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-500/30 transition">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${CATEGORY_COLOR[n.category] ?? CATEGORY_COLOR.General}`}>{n.category}</span>
                <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <h3 className="mt-2 font-semibold text-white">{n.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Post Notice">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Message</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none resize-none focus:border-amber-500/50" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
            <button onClick={handlePost} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition disabled:opacity-50">{loading ? "Posting..." : "Post"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
