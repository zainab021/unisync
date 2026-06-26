import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/students")({ component: AdminStudentsPage });

const API = "https://unisync-4ovf.onrender.com/api/students";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Student = { id: string; name: string; email: string; program: string; semester: number; cgpa: number; status: string };
const EMPTY: Student = { id: "", name: "", email: "", program: "BS Computer Science", semester: 1, cgpa: 0, status: "Active" };

function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch]     = useState("");
  const [programFilter, setProgramFilter] = useState("All");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Student | null>(null);
  const [form, setForm]         = useState<Student>(EMPTY);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load students"); }
  }

  const programs = ["All", ...Array.from(new Set(students.map(s => s.program).filter(Boolean)))];
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (programFilter === "All" || s.program === programFilter) &&
      (statusFilter === "All" || s.status === statusFilter);
  });

  function openAdd() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(s: Student) { setEditing(s); setForm({ ...s }); setModalOpen(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this student?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Student deleted");
      fetchStudents();
    } catch { toast.error("Failed to delete"); }
  }

  async function handleSave() {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch(`${API}/${editing.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
        toast.success("Student updated");
      } else {
        await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify({ ...form, password: "demo1234" }) });
        toast.success("Student added");
      }
      setModalOpen(false);
      fetchStudents();
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Students</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..."
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
          {search && <button onClick={() => setSearch("")}><X className="h-4 w-4 text-slate-500" /></button>}
        </div>
        <select value={programFilter} onChange={e => setProgramFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
          {programs.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
          {["All","Active","Warning","Suspended"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["ID", "Name", "Email", "Program", "Sem", "CGPA", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{s.id}</td>
                <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.email}</td>
                <td className="px-4 py-3 text-slate-400">{s.program}</td>
                <td className="px-4 py-3 text-slate-300">{s.semester}</td>
                <td className="px-4 py-3 text-slate-300">{Number(s.cgpa).toFixed(2)}</td>
                <td className="px-4 py-3"><StatusBadge label={s.status} tone={s.status === "Active" ? "success" : "warning"} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No students found.</p>}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"}>
        <div className="space-y-3">
          {(["name", "email", "program"] as const).map(key => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">{key}</label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Semester</label>
              <input type="number" min={1} max={8} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: +e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">CGPA</label>
              <input type="number" step={0.01} min={0} max={4} value={form.cgpa} onChange={e => setForm(f => ({ ...f, cgpa: +e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
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
