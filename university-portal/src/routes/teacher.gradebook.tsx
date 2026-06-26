import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/gradebook")({
  head: () => ({ meta: [{ title: "Gradebook — Teacher Portal" }] }),
  component: TeacherGradebook,
});

const COURSES_API = "https://unisync-4ovf.onrender.com/api/courses";
const GRADES_API  = "https://unisync-4ovf.onrender.com/api/grades";
const getToken    = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type CourseRow = { code: string; name: string };
type GradeRow  = { student_id: string; student_name: string; quiz: number; mid: number; assignment: number; final: number };

function TeacherGradebook() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [course, setCourse]   = useState("");
  const [semester, setSemester] = useState(`Spring ${new Date().getFullYear()}`);
  const [rows, setRows]       = useState<GradeRow[]>([]);
  const [saving, setSaving]   = useState(false);

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
      .then(data => setRows(Array.isArray(data) ? data.map((g: any) => ({ student_id: g.student_id, student_name: g.student_name, quiz: g.quiz, mid: g.mid, assignment: g.assignment, final: g.final })) : []))
      .catch(() => {});
  }, [course]);

  function updateRow(studentId: string, field: keyof GradeRow, value: number) {
    setRows(prev => prev.map(r => r.student_id === studentId ? { ...r, [field]: value } : r));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${GRADES_API}/bulk`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ records: rows, course_code: course, semester })
      });
      if (!res.ok) throw new Error();
      toast.success("Grades saved successfully");
    } catch { toast.error("Failed to save grades"); }
    setSaving(false);
  }

  function total(r: GradeRow) { return Number(r.quiz) + Number(r.mid) + Number(r.assignment) + Number(r.final); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Gradebook</h1>
        <p className="mt-1 text-sm text-slate-400">Enter marks for your students.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course</label>
          <select value={course} onChange={e => setCourse(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
            {courses.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Semester</label>
          <input value={semester} onChange={e => setSemester(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40" />
        </div>
        <div className="flex items-end">
          <button onClick={handleSave} disabled={saving || rows.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-bold text-slate-900 hover:from-amber-300 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Grades"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No students found for this course.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3 text-center">Quiz /20</th>
                <th className="px-6 py-3 text-center">Mid /30</th>
                <th className="px-6 py-3 text-center">Assignment /10</th>
                <th className="px-6 py-3 text-center">Final /40</th>
                <th className="px-6 py-3 text-center">Total /100</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r, i) => (
                <tr key={r.student_id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-6 py-3 font-medium text-white">{r.student_name}</td>
                  {(["quiz", "mid", "assignment", "final"] as const).map(f => (
                    <td key={f} className="px-6 py-2 text-center">
                      <input type="number" min={0} max={f === "quiz" ? 20 : f === "mid" ? 30 : f === "assignment" ? 10 : 40}
                        value={r[f]} onChange={e => updateRow(r.student_id, f, +e.target.value)}
                        className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-center text-sm text-white outline-none focus:border-amber-500/50" />
                    </td>
                  ))}
                  <td className="px-6 py-3 text-center font-bold text-amber-400">{total(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
