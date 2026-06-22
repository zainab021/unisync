import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/enrollment")({ component: AdminEnrollmentPage });

const API          = "http://localhost:5000/api/enrollment";
const STUDENTS_API = "http://localhost:5000/api/students";
const COURSES_API  = "http://localhost:5000/api/courses";
const DROP_API     = "http://localhost:5000/api/drop-requests";
const getToken     = () => localStorage.getItem("token") ?? "";
const authHeaders  = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Enrollment = { id: number; student_id: string; student_name: string; course_code: string; course_name: string; semester: string; status: string };
type Student    = { id: string; name: string };
type Course     = { code: string; name: string };
type DropReq    = { id: number; student_name: string; student_id: string; course_code: string; course_name: string; reason: string; status: string; requested_at: string };

const toneMap: Record<string, any> = { Enrolled: "success", Dropped: "danger", Completed: "info" };

function AdminEnrollmentPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents]       = useState<Student[]>([]);
  const [courses, setCourses]         = useState<Course[]>([]);
  const [dropReqs, setDropReqs]       = useState<DropReq[]>([]);
  const [modalOpen, setModalOpen]     = useState(false);
  const [form, setForm]               = useState({ student_id: "", course_code: "", semester: `Spring ${new Date().getFullYear()}` });
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState("All");
  const [tab, setTab]                 = useState<"enrollments" | "drops">("enrollments");
  const [search, setSearch]           = useState("");

  useEffect(() => {
    fetchEnrollments();
    fetchDropReqs();
    fetch(STUDENTS_API, { headers: authHeaders() }).then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(COURSES_API,  { headers: authHeaders() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function fetchEnrollments() {
    try {
      const res  = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load enrollments"); }
  }

  async function fetchDropReqs() {
    try {
      const res  = await fetch(DROP_API, { headers: authHeaders() });
      const data = await res.json();
      setDropReqs(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function handleEnroll() {
    if (!form.student_id || !form.course_code) { toast.error("Select student and course."); return; }
    setLoading(true);
    try {
      const res  = await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Student enrolled successfully.");
      setModalOpen(false);
      fetchEnrollments();
    } catch (err: any) { toast.error(err.message ?? "Enrollment failed."); }
    setLoading(false);
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      await fetch(`${API}/${id}/status`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }) });
      toast.success(`Status updated to ${status}`);
      fetchEnrollments();
    } catch { toast.error("Failed to update status."); }
  }

  async function handleRemove(id: number) {
    if (!confirm("Remove this enrollment?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Enrollment removed.");
      fetchEnrollments();
    } catch { toast.error("Failed to remove."); }
  }

  async function handleDrop(id: number, action: "approve" | "reject") {
    try {
      await fetch(`${DROP_API}/${id}/${action}`, { method: "PATCH", headers: authHeaders() });
      toast.success(action === "approve" ? "Drop approved — student unenrolled." : "Drop request rejected.");
      fetchDropReqs();
      fetchEnrollments();
    } catch { toast.error("Failed."); }
  }

  const pendingDrops = dropReqs.filter(d => d.status === "Pending");

  const filtered = enrollments
    .filter(e => filter === "All" || e.status === filter)
    .filter(e => !search || e.student_name?.toLowerCase().includes(search.toLowerCase()) || e.course_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Enrollment Management</h1>
          <p className="mt-1 text-xs text-slate-400">Enroll students and manage course drop requests.</p>
        </div>
        <button onClick={() => { setForm({ student_id: students[0]?.id ?? "", course_code: courses[0]?.code ?? "", semester: `Spring ${new Date().getFullYear()}` }); setModalOpen(true); }}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Enroll Student
        </button>
      </div>

      {/* Pending drops alert */}
      {pendingDrops.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300 font-semibold">{pendingDrops.length} pending drop request{pendingDrops.length > 1 ? "s" : ""} awaiting your approval</p>
          <button onClick={() => setTab("drops")} className="ml-auto text-xs text-amber-400 underline">Review Now</button>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-white/10">
        <button onClick={() => setTab("enrollments")}
          className={`px-4 py-2.5 text-sm font-medium transition ${tab === "enrollments" ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
          Enrollments ({enrollments.length})
        </button>
        <button onClick={() => setTab("drops")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition ${tab === "drops" ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
          Drop Requests
          {pendingDrops.length > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-900">{pendingDrops.length}</span>
          )}
        </button>
      </div>

      {/* DROP REQUESTS TAB */}
      {tab === "drops" && (
        <div className="space-y-4">
          {dropReqs.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No drop requests yet.</p>
          ) : dropReqs.map(d => (
            <div key={d.id} className={`rounded-2xl border p-5 ${d.status === "Pending" ? "border-amber-500/20 bg-amber-500/5" : "border-white/10 bg-white/[0.02]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{d.student_name} <span className="text-xs text-slate-500">({d.student_id})</span></p>
                  <p className="text-sm text-slate-400 mt-0.5">Wants to drop: <span className="text-white font-medium">{d.course_name}</span> ({d.course_code})</p>
                  {d.reason && <p className="text-xs text-slate-500 mt-1">Reason: {d.reason}</p>}
                  <p className="text-xs text-slate-600 mt-1">{new Date(d.requested_at).toLocaleString()}</p>
                </div>
                <div className="shrink-0">
                  {d.status === "Pending" ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleDrop(d.id, "approve")}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => handleDrop(d.id, "reject")}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${d.status === "Approved" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
                      {d.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLLMENTS TAB */}
      {tab === "enrollments" && <>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or course..."
            className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <select onChange={e => setFilter(e.target.value)} value={filter}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
          {["All","Enrolled","Dropped","Completed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select onChange={e => setSearch(e.target.value === "All" ? "" : e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
          <option value="All">All Courses</option>
          {[...new Set(enrollments.map(e => e.course_name))].filter(Boolean).map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Enrolled", val: enrollments.filter(e => e.status === "Enrolled").length, color: "emerald" },
          { label: "Dropped",        val: enrollments.filter(e => e.status === "Dropped").length,  color: "rose" },
          { label: "Completed",      val: enrollments.filter(e => e.status === "Completed").length, color: "sky" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-${s.color}-500/20 bg-${s.color}-500/5 p-4 text-center`}>
            <p className={`text-3xl font-bold text-${s.color}-400`}>{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>


      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["Student", "Student ID", "Course", "Semester", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">No enrollments found. Enroll a student to get started.</td></tr>
            )}
            {filtered.map(e => (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-white">{e.student_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{e.student_id}</td>
                <td className="px-4 py-3 text-slate-300">{e.course_name} <span className="text-xs text-slate-500">({e.course_code})</span></td>
                <td className="px-4 py-3 text-slate-400">{e.semester}</td>
                <td className="px-4 py-3"><StatusBadge label={e.status} tone={toneMap[e.status]} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <select value={e.status}
                      onChange={ev => handleStatusChange(e.id, ev.target.value)}
                      className="rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white outline-none">
                      {["Enrolled", "Dropped", "Completed"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => handleRemove(e.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enroll Student in Course">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Student</label>
            <select value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
              <option value="">— Select Student —</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course</label>
            <select value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
              <option value="">— Select Course —</option>
              {courses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Semester</label>
            <input value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleEnroll} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
              {loading ? "Enrolling..." : "Enroll"}
            </button>
          </div>
        </div>
      </Modal>
      </>}
    </div>
  );
}
