import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, User, Search } from "lucide-react";

export const Route = createFileRoute("/student/courses")({
  head: () => ({ meta: [{ title: "Courses — Student Portal" }] }),
  component: CoursesPage,
});

const API = "http://localhost:5000/api/courses";
const getToken = () => localStorage.getItem("token") ?? "";

type Course = { code: string; name: string; teacher_name?: string; department: string; credits: number; status: string };

const COLORS = ["amber", "blue", "emerald", "rose", "violet", "cyan", "orange", "pink"];

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Courses</h1>
        <p className="mt-1 text-sm text-slate-400">All available courses this semester.</p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
          className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
      </div>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No courses found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div key={c.code} className={`rounded-2xl border border-${color}-500/20 bg-gradient-to-br from-${color}-500/10 to-transparent p-5 hover:border-${color}-500/40 transition`}>
                <div className={`mb-3 inline-flex items-center gap-2 rounded-lg bg-${color}-500/15 px-3 py-1.5`}>
                  <BookOpen className={`h-4 w-4 text-${color}-400`} />
                  <span className={`text-xs font-bold text-${color}-300`}>{c.code}</span>
                </div>
                <h3 className="font-bold text-white">{c.name}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{c.teacher_name || "TBA"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{c.department}</span>
                    <span className={`text-xs font-semibold text-${color}-400`}>{c.credits} Credits</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
