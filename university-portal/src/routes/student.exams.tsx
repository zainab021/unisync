import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, FileText } from "lucide-react";

export const Route = createFileRoute("/student/exams")({
  head: () => ({ meta: [{ title: "Exams — Student Portal" }] }),
  component: ExamsPage,
});

const API = "https://unisync-4ovf.onrender.com/api/exams/my";
const getToken = () => localStorage.getItem("token") ?? "";

type Exam = { id: number; subject: string; course_name?: string; course_code: string; date: string; time: string; venue: string; duration: string; type: string };

const TYPE_COLORS: Record<string, string> = {
  "Mid Term": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "Final":    "border-rose-500/30 bg-rose-500/10 text-rose-300",
  "Quiz":     "border-sky-500/30 bg-sky-500/10 text-sky-300",
  "Lab":      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function ExamsPage() {
  const [exams, setExams]   = useState<Exam[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setExams(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const types    = ["All", ...Array.from(new Set(exams.map(e => e.type)))];
  const filtered = filter === "All" ? exams : exams.filter(e => e.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Exams Schedule</h1>
        <p className="mt-1 text-sm text-slate-400">Upcoming examinations.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${filter === t ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No exams found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(e => (
            <div key={e.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-amber-500/30 transition">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-bold text-white">{e.subject}</p>
                  <p className="text-xs text-slate-400">{e.course_name || e.course_code}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${TYPE_COLORS[e.type] ?? "border-white/10 bg-white/5 text-slate-300"}`}>{e.type}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>{e.date?.slice(0,10)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{e.time} — {e.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>{e.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
