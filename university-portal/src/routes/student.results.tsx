import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/student/results")({
  head: () => ({ meta: [{ title: "Results — Student Portal" }] }),
  component: ResultsPage,
});

const API = "https://unisync-4ovf.onrender.com/api/grades/my";
const getToken = () => localStorage.getItem("token") ?? "";

type Grade = { id: number; course_code: string; course_name: string; semester: string; quiz: number; mid: number; assignment: number; final: number; submitted: boolean };

function calcTotal(g: Grade) { return Number(g.quiz) + Number(g.mid) + Number(g.assignment) + Number(g.final); }
function calcGrade(total: number) {
  if (total >= 90) return { letter: "A+", gpa: 4.0 };
  if (total >= 85) return { letter: "A",  gpa: 4.0 };
  if (total >= 80) return { letter: "A-", gpa: 3.7 };
  if (total >= 75) return { letter: "B+", gpa: 3.3 };
  if (total >= 70) return { letter: "B",  gpa: 3.0 };
  if (total >= 65) return { letter: "B-", gpa: 2.7 };
  if (total >= 60) return { letter: "C+", gpa: 2.3 };
  if (total >= 55) return { letter: "C",  gpa: 2.0 };
  if (total >= 50) return { letter: "C-", gpa: 1.7 };
  return { letter: "F", gpa: 0 };
}

function ResultsPage() {
  const [grades, setGrades]   = useState<Grade[]>([]);
  const [semester, setSemester] = useState("All");

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => setGrades(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const semesters = ["All", ...Array.from(new Set(grades.map(g => g.semester)))];
  const filtered  = semester === "All" ? grades : grades.filter(g => g.semester === semester);
  const avgGPA    = filtered.length ? (filtered.reduce((sum, g) => sum + calcGrade(calcTotal(g)).gpa, 0) / filtered.length).toFixed(2) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Results</h1>
          <p className="mt-1 text-sm text-slate-400">Your academic performance.</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-center">
          <p className="text-xs text-slate-400">GPA</p>
          <p className="text-3xl font-bold text-amber-400">{avgGPA}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {semesters.map(s => (
          <button key={s} onClick={() => setSemester(s)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${semester === s ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No results found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Course</th>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3 text-center">Quiz</th>
                <th className="px-6 py-3 text-center">Mid</th>
                <th className="px-6 py-3 text-center">Assignment</th>
                <th className="px-6 py-3 text-center">Final</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(g => {
                const total = calcTotal(g);
                const { letter } = calcGrade(total);
                const color = letter === "F" ? "text-rose-400" : total >= 80 ? "text-emerald-400" : "text-amber-400";
                return (
                  <tr key={g.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 font-medium text-white">{g.course_name || g.course_code}</td>
                    <td className="px-6 py-3 text-slate-400">{g.semester}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.quiz}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.mid}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.assignment}</td>
                    <td className="px-6 py-3 text-center text-slate-300">{g.final}</td>
                    <td className="px-6 py-3 text-center font-bold text-white">{total}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`font-bold text-base ${color}`}>{letter}</span>
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
