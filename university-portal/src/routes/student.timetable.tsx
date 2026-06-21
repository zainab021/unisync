import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/student/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Student Portal" }] }),
  component: TimetablePage,
});

const API = "http://localhost:5000/api/uni-timetable";
const getToken = () => localStorage.getItem("token") ?? "";
const headers  = () => ({ Authorization: `Bearer ${getToken()}` });

type ScheduleItem = { day: string; time: string; period: string };
type Course = {
  id: number;
  course_code: string;
  course_title: string;
  credit_hours: string;
  section: string;
  teacher: string;
  classroom: string;
  schedule: ScheduleItem[];
};

const PROGRAMS = [
  "BSCS Batch - 17", "BSCS Batch - 18", "BSCS Batch - 19", "BSCS Batch - 20",
  "BSSE Batch - 17", "BSSE Batch - 18", "BSSE Batch - 19", "BSSE Batch - 20",
  "BSIT Batch - 8",  "BSIT batch - 9",  "BSIT batch - 10", "BSIT batch - 11",
  "BSAI Batch -02",  "BSAI Batch -03",  "BSAI Batch -04",  "BSAI Batch -05",
];

const SECTIONS = ["A", "B", "C"];

function TimetablePage() {
  const [programs, setPrograms] = useState<string[]>(PROGRAMS);
  const [program, setProgram]   = useState("");
  const [section, setSection]   = useState("A");
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  // Load programs list from API
  useEffect(() => {
    fetch(`${API}/programs`, { headers: headers() })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setPrograms(data); })
      .catch(() => {});
  }, []);

  async function fetchTimetable() {
    if (!program) return;
    setLoading(true);
    setSearched(true);
    try {
      const url = `${API}?program=${encodeURIComponent(program)}&section=${section}`;
      const res  = await fetch(url, { headers: headers() });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
    }
    setLoading(false);
  }

  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.credit_hours) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Class Timetable</h1>
        <p className="mt-1 text-sm text-slate-400">UMT Sialkot Campus — Spring 2026</p>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Program / Batch
            </label>
            <select
              value={program}
              onChange={e => setProgram(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40"
            >
              <option value="">-- Select Program --</option>
              {programs.map(p => (
                <option key={p} value={p} className="bg-slate-900">{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Section
            </label>
            <select
              value={section}
              onChange={e => setSection(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40"
            >
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={fetchTimetable}
          disabled={!program || loading}
          className="mt-4 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition"
        >
          {loading ? "Loading..." : "Show Timetable"}
        </button>
      </div>

      {/* Timetable Table */}
      {searched && (
        <>
          {courses.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{program} — Section {section}</p>
                <p className="text-xs text-slate-400">{courses[0]?.group_header}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Total Credits</p>
                <p className="text-2xl font-bold text-amber-400">{totalCredits}</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  {["#", "Course Code", "Course Title", "Cr. Hrs", "Teacher", "Room", "Schedule"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-500">Loading...</td></tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                      No timetable found for this program/section.
                    </td>
                  </tr>
                ) : (
                  courses.map((c, i) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-5 py-4 text-slate-500 tabular-nums">{i + 1}</td>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-amber-400">{c.course_code}</td>
                      <td className="px-5 py-4 font-medium text-white">{c.course_title}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">
                          {c.credit_hours}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-xs">{c.teacher}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{c.classroom}</td>
                      <td className="px-5 py-4">
                        {c.schedule.length === 0 ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : (
                          <div className="space-y-1">
                            {c.schedule.map((s, si) => (
                              <div key={si} className="flex items-center gap-2">
                                <span className="w-20 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-center text-[10px] font-semibold text-slate-300">
                                  {s.day.slice(0, 3)}
                                </span>
                                <span className="text-[11px] text-slate-400 tabular-nums">{s.time}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {courses.length > 0 && (
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.02]">
                    <td colSpan={3} className="px-5 py-3 text-xs text-slate-500">
                      Total Courses: {courses.length}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                        {totalCredits}
                      </span>
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
}
