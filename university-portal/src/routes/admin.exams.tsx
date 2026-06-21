import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/admin/exams")({ component: AdminExamsPage });

const API = "http://localhost:5000/api/exams";
const COURSES_API = "http://localhost:5000/api/courses";
const TEACHERS_API = "http://localhost:5000/api/teachers";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Exam = { id: number; subject: string; course_code: string; course_name?: string; date: string; time: string; venue: string; duration: string; invigilator: string; invigilator_name?: string; type: string };
const EMPTY = { subject: "", course_code: "", date: "", time: "09:00", venue: "", duration: "3 Hours", invigilator: "", type: "Mid Term" };

function AdminExamsPage() {
  const [exams, setExams]       = useState<Exam[]>([]);
  const [courses, setCourses]   = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Exam | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetchExams();
    fetch(COURSES_API,  { headers: authHeaders() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(TEACHERS_API, { headers: authHeaders() }).then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function fetchExams() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      setExams(Array.isArray(await res.json()) ? await fetch(API, { headers: authHeaders() }).then(r => r.json()) : []);
    } catch {}
  }

  async function loadExams() {
    try { const d = await fetch(API, { headers: authHeaders() }).then(r => r.json()); setExams(Array.isArray(d) ? d : []); } catch {}
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(e: Exam) { setEditing(e); setForm({ subject: e.subject, course_code: e.course_code||"", date: e.date?.slice(0,10)||"", time: e.time, venue: e.venue, duration: e.duration, invigilator: e.invigilator||"", type: e.type }); setModalOpen(true); }

  async function handleDelete(id: number) {
    if (!confirm("Delete this exam? It will be saved to backup.")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Exam deleted");
      loadExams();
    } catch { toast.error("Failed"); }
  }

  async function handleSave() {
    if (!form.subject || !form.date) { toast.error("Subject and date required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch(`${API}/${editing.id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(form) });
        toast.success("Exam updated");
      } else {
        await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
        toast.success("Exam added");
      }
      setModalOpen(false);
      loadExams();
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Exams</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Exam
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject, course or venue..."
          className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
      </div>
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["Subject", "Course", "Date", "Time", "Venue", "Duration", "Type", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.filter(e => !search || e.subject.toLowerCase().includes(search.toLowerCase()) || e.venue?.toLowerCase().includes(search.toLowerCase())).length === 0 && <tr><td colSpan={8} className="py-8 text-center text-sm text-slate-500">No exams found.</td></tr>}
            {exams.filter(e => !search || e.subject.toLowerCase().includes(search.toLowerCase()) || e.venue?.toLowerCase().includes(search.toLowerCase())).map(e => (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-white">{e.subject}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{e.course_name || e.course_code}</td>
                <td className="px-4 py-3 text-slate-300">{e.date?.slice(0,10)}</td>
                <td className="px-4 py-3 text-slate-400">{e.time}</td>
                <td className="px-4 py-3 text-slate-400">{e.venue}</td>
                <td className="px-4 py-3 text-slate-400">{e.duration}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">{e.type}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(e.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Exam" : "Add Exam"}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Subject</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course</label>
              <select value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                <option value="">— Select —</option>
                {courses.map((c: any) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {["Mid Term", "Final", "Quiz", "Lab"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Time</label>
              <input value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Venue</label>
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
