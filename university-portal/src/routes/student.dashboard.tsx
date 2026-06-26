import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Calendar, Wallet, Clock, ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Student Portal" }] }),
  component: Dashboard,
});

const API = "https://unisync-4ovf.onrender.com/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl ${className}`}>
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats]     = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const name = localStorage.getItem("userName") ?? "Student";

  useEffect(() => {
    fetch(`${API}/dashboard/student`, { headers: h() }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/courses`, { headers: h() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d.slice(0,4) : [])).catch(() => {});
    fetch(`${API}/notices`, { headers: h() }).then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d.slice(0,4) : [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Good day, {name} 👋</h1>
        <p className="mt-1 text-sm text-slate-400">Here's your semester overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Attendance</p>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{stats.attendancePercent ?? 0}%</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${stats.attendancePercent ?? 0}%` }} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Enrolled Courses</p>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{stats.enrolledCourses ?? 0}</p>
          <p className="text-xs text-slate-500">This semester</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Fees</p>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500/15 text-sky-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{stats.pendingFees ?? 0}</p>
          <p className="text-xs text-slate-500">{stats.pendingFees > 0 ? "Dues pending" : "All cleared"}</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Next Exam</p>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-500/15 text-rose-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          {stats.nextExam ? (
            <>
              <p className="mt-3 text-sm font-semibold text-white truncate">{stats.nextExam.subject}</p>
              <p className="text-xs text-slate-400">{stats.nextExam.date?.slice(0,10)} · {stats.nextExam.venue}</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No upcoming exams</p>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Available Courses</h2>
            <Link to="/student/courses" className="flex items-center gap-1 text-xs text-amber-400 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses available yet. Contact admin to add courses.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {courses.map((c: any) => (
                <div key={c.code} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 hover:border-amber-500/30 transition">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen className="h-3 w-3" /> {c.code}
                  </div>
                  <p className="mt-1 font-semibold text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.teacher_name ?? "TBA"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Notices</h2>
            <Link to="/student/notices" className="text-xs text-amber-400 hover:underline">All</Link>
          </div>
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices yet.</p>
          ) : (
            <ul className="space-y-3">
              {notices.map((n: any) => (
                <li key={n.id} className="border-l-2 border-amber-500/50 pl-3">
                  <p className="text-sm font-medium text-white truncate">{n.title}</p>
                  <p className="text-[11px] text-slate-500">{n.category} · {new Date(n.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
