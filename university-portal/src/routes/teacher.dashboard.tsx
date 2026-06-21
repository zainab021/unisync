import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, ClipboardCheck, Calendar, ArrowRight, Megaphone, DoorOpen, BookOpen } from "lucide-react";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Teacher Portal" }] }),
  component: TeacherDashboard,
});

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

function TeacherDashboard() {
  const [stats, setStats]     = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const name = localStorage.getItem("userName") ?? "Teacher";

  useEffect(() => {
    fetch(`${API}/dashboard/teacher`, { headers: h() }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/courses`, { headers: h() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d.slice(0,4) : [])).catch(() => {});
    fetch(`${API}/notices`, { headers: h() }).then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d.slice(0,4) : [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Faculty</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Welcome back, {name} 👋</h1>
        <p className="mt-1 text-sm text-slate-400">Here's your overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "My Courses",      value: stats.totalCourses  ?? 0, icon: BookOpen,      tone: "bg-amber-500/15 text-amber-400" },
          { label: "Marked Today",    value: stats.markedToday   ?? 0, icon: ClipboardCheck, tone: "bg-emerald-500/15 text-emerald-400" },
          { label: "Pending Leaves",  value: stats.pendingLeaves ?? 0, icon: Calendar,       tone: "bg-rose-500/15 text-rose-400" },
          { label: "Room Requests",   value: stats.pendingRooms  ?? 0, icon: Users,          tone: "bg-sky-500/15 text-sky-400" },
        ].map(s => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${s.tone}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Mark Attendance",  to: "/teacher/attendance",   icon: ClipboardCheck },
            { label: "Update Gradebook", to: "/teacher/gradebook",    icon: BookOpen },
            { label: "Post a Notice",    to: "/teacher/notices",      icon: Megaphone },
            { label: "Request Room",     to: "/teacher/room-request", icon: DoorOpen },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 hover:border-amber-500/40 hover:bg-amber-500/5 transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25">
                <a.icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium text-slate-200 group-hover:text-white">{a.label}</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">My Courses</h2>
            <Link to="/teacher/timetable" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              Timetable <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c: any) => (
                <div key={c.code} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-xs font-bold text-amber-400">
                    {c.code.slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.code} · {c.credits} credits</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Notices</h2>
            <Link to="/teacher/notices" className="text-xs text-amber-400 hover:underline">All</Link>
          </div>
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices posted yet.</p>
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
