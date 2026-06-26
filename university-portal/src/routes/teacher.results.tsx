import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/results")({
  head: () => ({ meta: [{ title: "Results — Teacher Portal" }] }),
  component: TeacherResults,
});

const COURSES_API = "https://unisync-4ovf.onrender.com/api/courses/teacher";
const GRADES_API  = "https://unisync-4ovf.onrender.com/api/grades";
const getToken    = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type GradeRow = { student_id: string; student_name: string; quiz: number; mid: number; assignment: number; final: number; submitted: boolean };

function calcGrade(total: number) {
  if (total >= 90) return "A+"; if (total >= 85) return "A"; if (total >= 80) return "A-";
  if (total >= 75) return "B+"; if (total >= 70) return "B"; if (total >= 65) return "B-";
  if (total >= 60) return "C+"; if (total >= 55) return "C"; if (total >= 50) return "C-";
  return "F";
}

function TeacherResults() {
  const [courses, setCourses]   = useState<any[]>([]);
  const [course, setCourse]     = useState("");
  const [grades, setGrades]     = useState<GradeRow[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetch(COURSES_API, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) { setCourses(d); setCourse(d[0].code); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!course) return;
    fetch(`${GRADES_API}/course/${course}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setGrades(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [course]);

  async function submitResults() {
    setLoading(true);
    try {
      await fetch(`${GRADES_API}/bulk`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ records: grades.map(g => ({ ...g, submitted: true })), course_code: course, semester: `Spring ${new Date().getFullYear()}` })
      });
      toast.success("Results submitted successfully");
      setGrades(prev => prev.map(g => ({ ...g, submitted: true })));
    } catch { toast.error("Failed to submit"); }
    setLoading(false);
  }

  const submitted = grades.filter(g => g.submitted).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Results</h1>
          <p className="mt-1 text-sm text-slate-400">View and submit student results.</p>
        </div>
        <button onClick={submitResults} disabled={loading || grades.length === 0}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Results"}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <select value={course} onChange={e => setCourse(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
          {courses.map((c: any) => <option key={c.code} value={c.code} className="bg-slate-900">{c.code} — {c.name}</option>)}
        </select>
        <span className="text-xs text-slate-500">{submitted}/{grades.length} submitted</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {grades.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No grades found. Add from Gradebook first.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3 text-center">Quiz</th>
                <th className="px-6 py-3 text-center">Mid</th>
                <th className="px-6 py-3 text-center">Assign</th>
                <th className="px-6 py-3 text-center">Final</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">Grade</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {grades.map((g, i) => {
                const total  = Number(g.quiz) + Number(g.mid) + Number(g.assignment) + Number(g.final);
                const letter = calcGrade(total);
                const color  = letter === "F" ? "text-rose-400" : total >= 80 ? "text-emerald-400" : "text-amber-400";
                return (
                  <tr key={g.student_id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-3 font-medium text-white">{g.student_name}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.quiz}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.mid}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.assignment}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.final}</td>
                    <td className="px-6 py-3 text-center font-bold text-white">{total}</td>
                    <td className={`px-6 py-3 text-center font-bold text-lg ${color}`}>{letter}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${g.submitted ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                        {g.submitted ? "Submitted" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
