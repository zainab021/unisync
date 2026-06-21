import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/admin/notices")({ component: AdminNoticesPage });

const API = "http://localhost:5000/api/notices";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const PRIORITIES = ["High", "Medium", "Low"];
const CATEGORIES = ["Academic", "Library", "Event", "Finance", "General"];
const PRIORITY_COLORS: Record<string, string> = { High: "rose", Medium: "amber", Low: "emerald" };
const CAT_COLORS: Record<string, string> = { Academic: "sky", Library: "violet", Event: "emerald", Finance: "amber", General: "slate" };

type Notice = { id: number; title: string; body: string; category: string; priority: string; created_at: string; posted_by_name?: string };

function AdminNoticesPage() {
  const [notices, setNotices]   = useState<Notice[]>([]);
  const [search, setSearch]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Notice | null>(null);
  const [form, setForm]         = useState({ title: "", category: "Academic", body: "", priority: "Medium" });
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchNotices(); }, []);

  async function fetchNotices() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load notices"); }
  }

  function openAdd() { setEditing(null); setForm({ title: "", category: "Academic", body: "", priority: "Medium" }); setModalOpen(true); }
  function openEdit(n: Notice) { setEditing(n); setForm({ title: n.title, category: n.category, body: n.body, priority: n.priority }); setModalOpen(true); }

  async function handleDelete(id: number) {
    if (!confirm("Delete this notice?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Notice deleted");
      fetchNotices();
    } catch { toast.error("Failed to delete"); }
  }

  async function handleSave() {
    if (!form.title || !form.body) { toast.error("Title and message required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch(`${API}/${editing.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
        toast.success("Notice updated");
      } else {
        await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
        toast.success("Notice posted");
      }
      setModalOpen(false);
      fetchNotices();
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notices</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Post Notice
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notices..."
          className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
      </div>
      <div className="space-y-3">
        {notices.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())).length === 0 && <p className="py-8 text-center text-sm text-slate-500">No notices found.</p>}
        {notices.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())).map(n => {
          const pc = PRIORITY_COLORS[n.priority] || "amber";
          const cc = CAT_COLORS[n.category] || "slate";
          return (
            <div key={n.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border border-${cc}-500/30 bg-${cc}-500/10 px-2 py-0.5 text-[10px] font-semibold text-${cc}-300`}>{n.category}</span>
                    <span className={`rounded-full border border-${pc}-500/30 bg-${pc}-500/10 px-2 py-0.5 text-[10px] font-semibold text-${pc}-300`}>{n.priority}</span>
                    <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{n.body}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(n)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(n.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Notice" : "Post Notice"}>
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
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Message</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition disabled:opacity-50">{loading ? "Saving..." : "Post"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
