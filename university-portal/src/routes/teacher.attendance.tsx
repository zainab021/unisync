import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, Calendar as Cal } from "lucide-react";
import { teacherCourseOptions, teacherStudents } from "@/data/data";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({ meta: [{ title: "Mark Attendance — Teacher Portal" }] }),
  component: TeacherAttendance,
});

type Mark = "Present" | "Absent" | "Leave";
const MARKS: Mark[] = ["Present", "Absent", "Leave"];
const MARK_STYLES: Record<Mark, string> = {
  Present: "bg-emerald-500 text-slate-900",
  Absent: "bg-rose-500 text-white",
  Leave: "bg-amber-500 text-slate-900",
};

function TeacherAttendance() {
  const [course, setCourse] = useState(teacherCourseOptions[0].code);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const students = teacherStudents[course] ?? [];

  const [marks, setMarks] = useState<Record<string, Mark>>(() => {
    const m: Record<string, Mark> = {};
    students.forEach((s) => (m[s.id] = "Present"));
    return m;
  });

  // Reset marks when course changes
  useEffect(() => {
    const m: Record<string, Mark> = {};
    teacherStudents[course].forEach((s) => (m[s.id] = "Present"));
    setMarks(m);
  }, [course]);

  const counts = useMemo(() => {
    const c = { Present: 0, Absent: 0, Leave: 0 };
    Object.values(marks).forEach((v) => (c[v] += 1));
    return c;
  }, [marks]);

  const save = () => {
    toast.success(`Attendance saved for ${course} · ${date}`, {
      description: `${counts.Present} present, ${counts.Absent} absent, ${counts.Leave} on leave`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Mark Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">Select a course and toggle each student.</p>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40"
          >
            {teacherCourseOptions.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-900">{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/40">
            <Cal className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none [color-scheme:dark]"
            />
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={save}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-bold text-slate-900 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20"
          >
            <Save className="h-4 w-4" /> Save Attendance
          </button>
        </div>
      </div>

      {/* Counters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(["Present", "Absent", "Leave"] as const).map((m) => (
          <div key={m} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">{m}</p>
            <p className={`text-2xl font-bold tabular-nums ${
              m === "Present" ? "text-emerald-400" : m === "Absent" ? "text-rose-400" : "text-amber-400"
            }`}>{counts[m]}</p>
          </div>
        ))}
      </div>

      {/* Student table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3 w-12">#</th>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Reg #</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-3 text-slate-500 tabular-nums">{i + 1}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-300">
                      {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <span className="font-medium text-white">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-slate-400">{s.reg}</td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-1 rounded-lg border border-white/10 bg-white/5 p-1 w-fit ml-auto">
                    {MARKS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMarks({ ...marks, [s.id]: m })}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                          marks[s.id] === m ? MARK_STYLES[m] : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
