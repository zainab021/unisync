import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/admin/academic-calendar")({ component: AdminCalendarPage });

const API = "https://unisync-4ovf.onrender.com/api/events";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Event = { id: number; title: string; date: string; end_date?: string; category: string; color: string };
const CATEGORIES = ["Academic", "Cultural", "Sports", "Holiday", "Exam", "General"];
const COLORS     = ["amber", "blue", "emerald", "rose", "violet", "sky"];
const EMPTY = { title: "", date: "", end_date: "", category: "Academic", color: "amber" };

function AdminCalendarPage() {
  const [events, setEvents]     = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Event | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    fetch(API, { headers: h() }).then(r => r.json()).then(d => setEvents(Array.isArray(d) ? d : [])).catch(() => {});
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(e: Event) { setEditing(e); setForm({ title: e.title, date: e.date?.slice(0,10), end_date: e.end_date?.slice(0,10) ?? "", category: e.category, color: e.color }); setModalOpen(true); }

  async function handleSave() {
    if (!form.title || !form.date) { toast.error("Title and date required."); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch(`${API}/${editing.id}`, { method: "PUT", headers: h(), body: JSON.stringify(form) });
        toast.success("Event updated.");
      } else {
        await fetch(API, { method: "POST", headers: h(), body: JSON.stringify(form) });
        toast.success("Event added.");
      }
      setModalOpen(false);
      fetchEvents();
    } catch { toast.error("Failed to save."); }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this event?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: h() });
      toast.success("Event deleted.");
      fetchEvents();
    } catch { toast.error("Failed to delete."); }
  }

  const upcoming = events.filter(e => e.date >= new Date().toISOString().slice(0,10));
  const past     = events.filter(e => e.date < new Date().toISOString().slice(0,10));

  const CAT_COLOR: Record<string, string> = {
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Academic Calendar</h1>
          <p className="mt-1 text-xs text-slate-400">Manage university events — visible to all students and teachers.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {/* Upcoming */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Upcoming ({upcoming.length})</p>
      {upcoming.length === 0 ? (
        <p className="mb-6 text-sm text-slate-500">No upcoming events. Add one to notify students.</p>
      ) : (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map(e => (
            <div key={e.id} className={`rounded-2xl border p-4 ${CAT_COLOR[e.color] ?? CAT_COLOR.amber}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{e.title}</p>
                  <p className="text-xs mt-1">{new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  {e.end_date && e.end_date !== e.date && (
                    <p className="text-xs">to {new Date(e.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  )}
                  <span className="mt-2 inline-block text-[10px] font-bold uppercase">{e.category}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(e)} className="rounded p-1.5 hover:bg-white/10 transition"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(e.id)} className="rounded p-1.5 hover:bg-rose-500/20 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-600">Past Events ({past.length})</p>
          <div className="overflow-hidden rounded-xl bg-slate-900/30">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                {["Title", "Category", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {past.map(e => (
                  <tr key={e.id} className="border-t border-white/5 opacity-50">
                    <td className="px-4 py-3 text-slate-400">{e.title}</td>
                    <td className="px-4 py-3 text-slate-600">{e.category}</td>
                    <td className="px-4 py-3 text-slate-600">{e.date?.slice(0,10)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-slate-600 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Event" : "Add Event"}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Start Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Color</label>
              <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {COLORS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
