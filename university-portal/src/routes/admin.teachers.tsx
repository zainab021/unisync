import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/admin/teachers")({ component: AdminTeachersPage });

const API = "http://localhost:5000/api/teachers";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Teacher = { id: string; name: string; email: string; department: string; designation: string };
const EMPTY: Teacher = { id: "", name: "", email: "", department: "Computer Science", designation: "Lecturer" };

function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch]     = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Teacher | null>(null);
  const [form, setForm]         = useState<Teacher>(EMPTY);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchTeachers(); }, []);

  async function fetchTeachers() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load teachers"); }
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.department?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(t: Teacher) { setEditing(t); setForm({ ...t }); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this teacher?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch { toast.error("Failed to delete"); }
  }

  async function handleSave() {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch(`${API}/${editing.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
        toast.success("Teacher updated");
      } else {
        await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify({ ...form, password: "demo1234" }) });
        toast.success("Teacher added");
      }
      setModalOpen(false);
      fetchTeachers();
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Teachers</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Teacher
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or department..." className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
        {search && <button onClick={() => setSearch("")}><X className="h-4 w-4 text-slate-500" /></button>}
      </div>
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["ID", "Name", "Email", "Department", "Designation", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{t.id}</td>
                <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{t.email}</td>
                <td className="px-4 py-3 text-slate-400">{t.department}</td>
                <td className="px-4 py-3 text-slate-400">{t.designation}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(t.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No teachers found.</p>}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Teacher" : "Add Teacher"}>
        <div className="space-y-3">
          {(["name", "email"] as const).map(key => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">{key}</label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Department</label>
            <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Designation</label>
            <select value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
              {["Professor", "Associate Professor", "Assistant Professor", "Lecturer"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
