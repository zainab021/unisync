import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, UserCheck, BookOpen, FileText, ArrowRight, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboardPage });

const API = "https://unisync-4ovf.onrender.com/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState<any>({});
  const [rooms, setRooms]       = useState<any[]>([]);
  const [notices, setNotices]   = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    fetch(`${API}/dashboard/admin`,    { headers: h() }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/dashboard/analytics`,{ headers: h() }).then(r => r.json()).then(setAnalytics).catch(() => {});
    fetch(`${API}/room-requests`,      { headers: h() }).then(r => r.json()).then(d => setRooms(Array.isArray(d) ? d.filter((r: any) => r.status === "Pending").slice(0,3) : [])).catch(() => {});
    fetch(`${API}/notices`,            { headers: h() }).then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d.slice(0,4) : [])).catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Students", value: stats.totalStudents ?? 0, icon: Users, color: "amber" },
    { label: "Total Teachers", value: stats.totalTeachers ?? 0, icon: UserCheck, color: "sky" },
    { label: "Total Courses", value: stats.totalCourses ?? 0, icon: BookOpen, color: "emerald" },
    { label: "Upcoming Exams", value: stats.upcomingExams ?? 0, icon: FileText, color: "violet" },
  ];

  const colorMap: Record<string, string> = {
    amber:  "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400",
    sky:    "from-sky-500/20 to-sky-500/5 border-sky-500/30 text-sky-400",
    emerald:"from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Northfield University — Real-time overview</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border bg-gradient-to-br p-5 ${colorMap[s.color]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{s.value}</p>
                </div>
                <Icon className={`h-6 w-6 ${colorMap[s.color].split(" ").pop()}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Notices */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Recent Notices</p>
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices yet. Post one from Notices page.</p>
          ) : (
            <ul className="space-y-3">
              {notices.map((n: any) => (
                <li key={n.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-slate-200">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{n.category} · {new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: "Add Student", path: "/admin/students" },
                { label: "Add Teacher", path: "/admin/teachers" },
                { label: "Add Course", path: "/admin/courses" },
                { label: "Post Notice", path: "/admin/notices" },
                { label: `Room Requests ${stats.pendingRooms > 0 ? `(${stats.pendingRooms})` : ""}`, path: "/admin/room-approvals" },
                { label: `Fees Pending (${stats.pendingFees ?? 0})`, path: "/admin/fees" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate({ to: a.path as any })}
                  className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition">
                  <span>{a.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Pending Room Requests */}
          {rooms.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Pending Room Requests</p>
              {rooms.map((r: any) => (
                <div key={r.id} className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-semibold text-amber-300">{r.teacher_name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{r.room} · {r.date?.slice(0,10)} · {r.slot}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Fee Status Pie */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="mb-4 text-sm font-semibold text-white">Fee Status</p>
          {analytics.feeStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics.feeStats} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={65} label={({ status, count }) => `${status}: ${count}`}>
                  {(analytics.feeStats || []).map((e: any, i: number) => (
                    <Cell key={i} fill={e.status === "Paid" ? "#10B981" : e.status === "Overdue" ? "#EF4444" : "#F59E0B"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-slate-500 mt-4">No fee data yet.</p>}
        </div>

        {/* Attendance Bar */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="mb-4 text-sm font-semibold text-white">Attendance Overview</p>
          {analytics.attendance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.attendance}>
                <XAxis dataKey="status" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {(analytics.attendance || []).map((e: any, i: number) => (
                    <Cell key={i} fill={e.status === "Present" ? "#10B981" : e.status === "Absent" ? "#EF4444" : "#F59E0B"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-slate-500 mt-4">No attendance data yet.</p>}
        </div>

        {/* Programs Bar */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="mb-4 text-sm font-semibold text-white">Students by Program</p>
          {analytics.programs?.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.programs} layout="vertical">
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis dataKey="program" type="category" tick={{ fill: "#94a3b8", fontSize: 9 }} width={90} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="students" fill="#F59E0B" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-slate-500 mt-4">No student data yet.</p>}
        </div>
      </div>
    </div>
  );
}
