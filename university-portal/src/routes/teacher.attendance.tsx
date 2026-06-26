import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, Calendar as Cal } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({ meta: [{ title: "Mark Attendance — Teacher Portal" }] }),
  component: TeacherAttendance,
});

const COURSES_API    = "https://unisync-4ovf.onrender.com/api/courses/teacher";
const ATTENDANCE_API = "https://unisync-4ovf.onrender.com/api/attendance";
const getToken       = () => localStorage.getItem("token") ?? "";
const authHeaders    = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Mark    = "Present" | "Absent" | "Leave";
type Student = { student_id: string; student_name: string; student_reg: string };
type Course  = { code: string; name: string };

const MARKS: Mark[] = ["Present", "Absent", "Leave"];
const MARK_STYLES: Record<Mark, string> = {
  Present: "bg-emerald-500 text-slate-900",
  Absent:  "bg-rose-500 text-white",
  Leave:   "bg-amber-500 text-slate-900",
};

function TeacherAttendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse]   = useState("");
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks]     = useState<Record<string, Mark>>({});
  const [saving, setSaving]   = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load courses
  useEffect(() => {
    fetch(COURSES_API, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length) {
          setCourses(d);
          setCourse(d[0].code);
        }
      }).catch(() => {});
  }, []);

  // Load enrolled students when course changes
  useEffect(() => {
    if (!course) return;
    setLoadingStudents(true);
    fetch(`${ATTENDANCE_API}/${course}?date=${date}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setStudents(data);
          const m: Record<string, Mark> = {};
          data.forEach((s: any) => { m[s.student_id] = (s.status as Mark) || "Present"; });
          setMarks(m);
          setIsDirty(false);
          setSavedAt("loaded");
        } else {
          // No attendance yet — fetch student list from enrollment
          return fetch(`https://unisync-4ovf.onrender.com/api/enrollment?course=${course}`, { headers: authHeaders() })
            .then(r => r.json())
            .then(enrolled => {
              if (Array.isArray(enrolled)) {
                const list = enrolled.filter((e: any) => e.course_code === course).map((e: any) => ({
                  student_id: e.student_id,
                  student_name: e.student_name,
                  student_reg: e.student_id,
                }));
                setStudents(list);
                const m: Record<string, Mark> = {};
                list.forEach((s: any) => { m[s.student_id] = "Present"; });
                setMarks(m);
                setIsDirty(false);
                setSavedAt(null);
              }
            });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStudents(false));
  }, [course, date]);

  const counts = useMemo(() => {
    const c = { Present: 0, Absent: 0, Leave: 0 };
    Object.values(marks).forEach(v => c[v]++);
    return c;
  }, [marks]);

  async function save() {
    if (students.length === 0) { toast.error("No students found for this course."); return; }
    setSaving(true);
    try {
      const records = students.map(s => ({ student_id: s.student_id, status: marks[s.student_id] || "Present" }));
      const res = await fetch(ATTENDANCE_API, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ records, course_code: course, date })
      });
      if (!res.ok) throw new Error();
      toast.success(`Attendance saved! ${counts.Present} present, ${counts.Absent} absent, ${counts.Leave} on leave`);
      setSavedAt(new Date().toLocaleTimeString());
      setIsDirty(false);
    } catch { toast.error("Failed to save attendance."); }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Mark Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">Select course and date, then mark each student.</p>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course</label>
          <select value={course} onChange={e => setCourse(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
            {courses.length === 0
              ? <option>No courses found</option>
              : courses.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.code} — {c.name}</option>)
            }
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/40">
            <Cal className="h-4 w-4 text-slate-500" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none [color-scheme:dark]" />
          </div>
        </div>
        <div className="flex items-end flex-col gap-1">
          <button onClick={save} disabled={saving || students.length === 0}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold shadow-lg transition ${isDirty ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"} disabled:opacity-50`}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : isDirty ? "⚠️ Save Attendance" : "✓ Attendance Saved"}
          </button>
          {savedAt && savedAt !== "loaded" && <p className="text-[10px] text-emerald-400">Last saved at {savedAt}</p>}
        </div>
      </div>

      {/* Counters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(["Present", "Absent", "Leave"] as Mark[]).map(m => (
          <div key={m} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">{m}</p>
            <p className={`text-2xl font-bold tabular-nums ${m === "Present" ? "text-emerald-400" : m === "Absent" ? "text-rose-400" : "text-amber-400"}`}>
              {counts[m]}
            </p>
          </div>
        ))}
      </div>

      {/* Student table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {loadingStudents ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading students...</p>
        ) : students.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-400">No students enrolled in this course yet.</p>
            <p className="mt-1 text-xs text-slate-600">Go to Enrollment page to enroll students first.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3 w-12">#</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((s, i) => (
                <tr key={s.student_id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-slate-500 tabular-nums">{i + 1}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-300">
                        {s.student_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium text-white">{s.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{s.student_reg}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1 rounded-lg border border-white/10 bg-white/5 p-1 w-fit ml-auto">
                      {MARKS.map(m => (
                        <button key={m}
                          onClick={() => { setMarks({ ...marks, [s.student_id]: m }); setIsDirty(true); }}
                          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${marks[s.student_id] === m ? MARK_STYLES[m] : "text-slate-400 hover:text-white"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
