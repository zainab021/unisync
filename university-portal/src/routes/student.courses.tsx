import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, User, Search, AlertTriangle, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/student/courses")({
  head: () => ({ meta: [{ title: "Courses — Student Portal" }] }),
  component: CoursesPage,
});

const API      = "https://unisync-4ovf.onrender.com/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Course = { code: string; name: string; teacher_name?: string; department: string; credits: number; status: string };
type DropReq = { id: number; course_code: string; course_name: string; status: string; reason: string; requested_at: string };

const COLORS = ["amber","blue","emerald","rose","violet","cyan","orange","pink"];
const STATUS_ICON: Record<string, any> = {
  Pending:  { icon: Clock,         cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  Approved: { icon: CheckCircle2,  cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  Rejected: { icon: XCircle,       cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
};

function CoursesPage() {
  const [courses, setCourses]     = useState<Course[]>([]);
  const [dropReqs, setDropReqs]   = useState<DropReq[]>([]);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dropCourse, setDropCourse] = useState<Course | null>(null);
  const [reason, setReason]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API}/courses/my`, { headers: h() })
      .then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/drop-requests/my`, { headers: h() })
      .then(r => r.json()).then(d => setDropReqs(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  function getPendingDrop(code: string) {
    return dropReqs.find(d => d.course_code === code && d.status === "Pending");
  }

  function openDropModal(course: Course) {
    setDropCourse(course);
    setReason("");
    setModalOpen(true);
  }

  async function handleDropRequest() {
    if (!dropCourse) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/drop-requests`, {
        method: "POST", headers: h(),
        body: JSON.stringify({ course_code: dropCourse.code, reason })
      });
      const data = await res.json();
      if (!res.ok) {
        // Refresh drop requests so badge shows correctly even on duplicate error
        fetch(`${API}/drop-requests/my`, { headers: h() })
          .then(r => r.json()).then(d => setDropReqs(Array.isArray(d) ? d : []));
        throw new Error(data.message);
      }
      toast.success("Drop request submitted. Awaiting admin approval.");
      setModalOpen(false);
      fetch(`${API}/drop-requests/my`, { headers: h() })
        .then(r => r.json()).then(d => setDropReqs(Array.isArray(d) ? d : []));
    } catch (err: any) { toast.error(err.message ?? "Failed to submit."); }
    setSubmitting(false);
  }

  async function cancelDrop(id: number) {
    try {
      await fetch(`${API}/drop-requests/${id}`, { method: "DELETE", headers: h() });
      toast.success("Drop request cancelled.");
      setDropReqs(prev => prev.filter(d => d.id !== id));
    } catch { toast.error("Failed to cancel."); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Courses</h1>
        <p className="mt-1 text-sm text-slate-400">Your enrolled courses this semester.</p>
      </div>

      {/* Pending drop requests banner */}
      {dropReqs.filter(d => d.status === "Pending").length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-semibold text-amber-300">Pending Drop Requests</p>
          </div>
          <div className="space-y-1">
            {dropReqs.filter(d => d.status === "Pending").map(d => (
              <div key={d.id} className="flex items-center justify-between text-xs text-slate-400">
                <span><span className="text-white font-medium">{d.course_name}</span> — waiting for admin approval</span>
                <button onClick={() => cancelDrop(d.id)} className="text-rose-400 hover:underline ml-2">Cancel</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
          className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
      </div>

      {/* Courses grid */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No courses found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => {
            const color      = COLORS[i % COLORS.length];
            const pendingDrop = getPendingDrop(c.code);
            const dropReq    = dropReqs.find(d => d.course_code === c.code);
            return (
              <div key={c.code} className={`rounded-2xl border border-${color}-500/20 bg-gradient-to-br from-${color}-500/10 to-transparent p-5 hover:border-${color}-500/40 transition`}>
                <div className={`mb-3 inline-flex items-center gap-2 rounded-lg bg-${color}-500/15 px-3 py-1.5`}>
                  <BookOpen className={`h-4 w-4 text-${color}-400`} />
                  <span className={`text-xs font-bold text-${color}-300`}>{c.code}</span>
                </div>
                <h3 className="font-bold text-white">{c.name}</h3>
                <div className="mt-3 space-y-1 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{c.teacher_name || "TBA"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{c.department}</span>
                    <span className={`text-xs font-semibold text-${color}-400`}>{c.credits} Credits</span>
                  </div>
                </div>

                {/* Drop status or button */}
                <div className="mt-4">
                  {dropReq ? (
                    <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${STATUS_ICON[dropReq.status]?.cls}`}>
                      {(() => { const Icon = STATUS_ICON[dropReq.status]?.icon; return Icon ? <Icon className="h-3.5 w-3.5" /> : null; })()}
                      Drop {dropReq.status}
                      {dropReq.status === "Pending" && (
                        <button onClick={() => cancelDrop(dropReq.id)} className="ml-auto text-rose-400 hover:text-rose-300">Cancel</button>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => openDropModal(c)}
                      className="w-full rounded-lg border border-rose-500/30 bg-rose-500/10 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition">
                      Request Drop
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop Request Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Request Drop — ${dropCourse?.name}`}>
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-300">
            <AlertTriangle className="inline h-4 w-4 mr-1.5" />
            Your request will be sent to admin for approval. Course will only be dropped after approval.
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Reason for Drop</label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Why do you want to drop this course?"
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 placeholder:text-slate-600" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleDropRequest} disabled={submitting}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Drop Request"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
