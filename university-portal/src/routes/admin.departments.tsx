import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/admin/departments")({ component: AdminDepartmentsPage });

const API = "http://localhost:5000/api/departments";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Dept = { id: string; name: string; hod: string; programs: number; teachers_count: number; students_count: number };
const EMPTY: Dept = { id: "", name: "", hod: "", programs: 0, teachers_count: 0, students_count: 0 };

function AdminDepartmentsPage() {
  const [depts, setDepts]       = useState<Dept[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Dept | null>(null);
  const [form, setForm]         = useState<Dept>(EMPTY);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchDepts(); }, []);

  async function fetchDepts() {
    try {
      const res  = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setDepts(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load departments"); }
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(d: Dept) { setEditing(d); setForm({ ...d }); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this department? It will be saved to Secure Backup.")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast.success("Department deleted — backup mein save ho gaya");
      fetchDepts();
    } catch { toast.error("Failed to delete"); }
  }

  async function handleSave() {
    if (!form.name) { toast.error("Name required"); return; }
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`${API}/${editing.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
        if (!res.ok) throw new Error((await res.json()).message);
        toast.success("Department updated");
      } else {
        if (!form.id) { toast.error("Department ID required"); setLoading(false); return; }
        const res = await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
        if (!res.ok) throw new Error((await res.json()).message);
        toast.success("Department added");
      }
      setModalOpen(false);
      fetchDepts();
    } catch (err: any) { toast.error(err.message ?? "Failed to save"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Departments</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      {depts.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">No departments found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {depts.map(d => (
          <div key={d.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-bold text-white">{d.name}</p>
                <p className="text-xs text-slate-400">HoD: {d.hod || "—"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(d.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[{ label: "Programs", val: d.programs }, { label: "Teachers", val: d.teachers_count }, { label: "Students", val: d.students_count }].map(s => (
                <div key={s.label} className="rounded-lg border border-white/5 bg-white/5 p-2 text-center">
                  <p className="text-lg font-bold text-amber-300">{s.val}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Department" : "Add Department"}>
        <div className="space-y-3">
          {!editing && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Department ID (e.g. CS, MATH)</label>
              <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value.toUpperCase() }))} maxLength={10} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Department Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Head of Department</label>
            <input value={form.hod} onChange={e => setForm(f => ({ ...f, hod: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {([["programs", "Programs"], ["teachers_count", "Teachers"], ["students_count", "Students"]] as const).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</label>
                <input type="number" min={0} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
              </div>
            ))}
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
