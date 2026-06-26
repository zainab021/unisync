import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/results")({
  head: () => ({ meta: [{ title: "Results Approval — Admin" }] }),
  component: AdminResultsPage,
});

const API = "https://unisync-4ovf.onrender.com/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Pending = { course_code: string; course_name: string; semester: string; teacher_name: string; student_count: number };

function AdminResultsPage() {
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => { fetchPending(); }, []);

  async function fetchPending() {
    setLoading(true);
    fetch(`${API}/grades/pending`, { headers: h() })
      .then(r => r.json()).then(d => setPending(Array.isArray(d) ? d : []))
      .catch(() => {}).finally(() => setLoading(false));
  }

  async function approve(course_code: string, semester: string) {
    setApproving(`${course_code}-${semester}`);
    try {
      const res = await fetch(`${API}/grades/approve`, {
        method: "POST", headers: h(),
        body: JSON.stringify({ course_code, semester })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchPending();
    } catch (err: any) { toast.error(err.message ?? "Failed to approve"); }
    setApproving(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Results Approval</h1>
        <p className="mt-1 text-sm text-slate-400">
          Approve submitted results — CGPA and semester auto-update on approval.
        </p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
          <p className="text-slate-300 font-semibold">All results approved!</p>
          <p className="mt-1 text-xs text-slate-500">No pending submissions from teachers.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/5 px-6 py-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-white">Pending Approvals ({pending.length})</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {["Course", "Teacher", "Semester", "Students", "Action"].map(col => (
                  <th key={col} className="px-6 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pending.map(p => {
                const key = `${p.course_code}-${p.semester}`;
                return (
                  <tr key={key} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-amber-400" />
                        <div>
                          <p className="font-medium text-white">{p.course_name}</p>
                          <p className="text-xs text-amber-400 font-mono">{p.course_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{p.teacher_name || "—"}</td>
                    <td className="px-6 py-4 text-slate-300">{p.semester}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
                        {p.student_count} students
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => approve(p.course_code, p.semester)}
                        disabled={approving === key}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {approving === key ? "Approving..." : "Approve & Update"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-sky-300">
        <p className="font-semibold mb-1">What happens on approval?</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
          <li>All students' CGPA recalculates automatically</li>
          <li>Each student's semester increments by +1</li>
          <li>Students receive in-app notification</li>
        </ul>
      </div>
    </div>
  );
}
