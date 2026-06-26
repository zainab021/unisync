import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/courses")({ component: AdminCoursesPage });

const API         = "https://unisync-4ovf.onrender.com/api/courses";
const TEACHERS_API = "https://unisync-4ovf.onrender.com/api/teachers";
const getToken    = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Course  = { code: string; name: string; department: string; teacher_id: string; teacher_name?: string; credits: number; status: string };
type Teacher = { id: string; name: string };
const EMPTY: Course = { code: "", name: "", department: "CS", teacher_id: "", credits: 3, status: "Active" };

function AdminCoursesPage() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [search, setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Course | null>(null);
  const [form, setForm]         = useState<Course>(EMPTY);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetchCourses();
    fetch(TEACHERS_API, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setTeachers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function fetchCourses() {
    try {
      const res  = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load courses"); }
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(c: Course) { setEditing(c); setForm({ ...c }); setModalOpen(true); }

  async function handleDelete(code: string) {
    if (!confirm("Delete this course?")) return;
    try {
      const res = await fetch(`${API}/${code}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      toast.success("Course deleted");
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  }

  async function handleSave() {
    if (!form.code || !form.name) { toast.error("Code and name required"); return; }
    setLoading(true);
    try {
      if (editing) {
        const res = await fetch(`${API}/${editing.code}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
        if (!res.ok) throw new Error();
        toast.success("Course updated");
      } else {
        const res = await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
        if (!res.ok) throw new Error();
        toast.success("Course added");
      }
      setModalOpen(false);
      fetchCourses();
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  const depts = ["All", ...Array.from(new Set(courses.map(c => c.department).filter(Boolean)))];
  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.teacher_name?.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || c.department === deptFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="mt-1 text-xs text-slate-400">{filtered.length} of {courses.length} courses</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Course
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code, name or teacher..."
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
          {["All", "Active", "Inactive"].map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || deptFilter !== "All" || statusFilter !== "All") && (
          <button onClick={() => { setSearch(""); setDeptFilter("All"); setStatusFilter("All"); }}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white transition">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["Code", "Course Name", "Department", "Teacher", "Credits", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">No courses found.</td></tr>}
            {filtered.map(c => (
              <tr key={c.code} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-amber-300">{c.code}</td>
                <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                <td className="px-4 py-3 text-slate-400">{c.department}</td>
                <td className="px-4 py-3 text-slate-400">{c.teacher_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-300">{c.credits}</td>
                <td className="px-4 py-3"><StatusBadge label={c.status} tone="success" /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(c.code)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Course" : "Add Course"}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} disabled={!!editing} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 disabled:opacity-50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Department</label>
            <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Assign Teacher</label>
            <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
              <option value="">— Select Teacher —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Credit Hours</label>
            <input type="number" min={1} max={6} value={form.credits} onChange={e => setForm(f => ({ ...f, credits: +e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
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
