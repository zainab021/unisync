import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Search, LogIn, Users, BookOpen, Megaphone, Calendar, DoorOpen, Trash2, PlaneTakeoff, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({ component: AdminActivityPage });

const NOTIF_API = "https://unisync-4ovf.onrender.com/api/notifications";
const AUDIT_API = "https://unisync-4ovf.onrender.com/api/audit-logs";
const getToken  = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

const TYPE_ICONS: Record<string, any> = {
  Login:    { icon: LogIn,         color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  Student:  { icon: Users,         color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  Teacher:  { icon: GraduationCap, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  Course:   { icon: BookOpen,      color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  Notice:   { icon: Megaphone,     color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  Timetable:{ icon: Calendar,      color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  Room:     { icon: DoorOpen,      color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  Leave:    { icon: PlaneTakeoff,  color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  Delete:   { icon: Trash2,        color: "text-red-400 bg-red-500/10 border-red-500/20" },
  General:  { icon: Bell,          color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

function getTypeStyle(type: string) {
  return TYPE_ICONS[type] ?? TYPE_ICONS.General;
}

function AdminActivityPage() {
  const [tab, setTab]           = useState<"activity" | "notices">("activity");
  const [logs, setLogs]         = useState<any[]>([]);
  const [notices, setNotices]   = useState<any[]>([]);
  const [readIds, setReadIds]   = useState<Set<number>>(new Set());
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [types, setTypes]       = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Fetch activity logs
    fetch(`${AUDIT_API}?limit=200`, { headers: h() })
      .then(r => r.json()).then(d => setLogs(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${AUDIT_API}/types`, { headers: h() })
      .then(r => r.json()).then(d => setTypes(Array.isArray(d) ? d : [])).catch(() => {});
    // Fetch notices
    fetch(NOTIF_API, { headers: h() })
      .then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    return (typeFilter === "All" || l.type === typeFilter) &&
           (!search || l.action?.toLowerCase().includes(q) || l.user_name?.toLowerCase().includes(q));
  });

  const unreadNotices = notices.filter(n => !n.read && !readIds.has(n.id)).length;

  async function markAllRead() {
    await fetch(`${NOTIF_API}/read-all/all`, { method: "PATCH", headers: h() }).catch(() => {});
    setNotices(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All marked as read.");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity & Notifications</h1>
          <p className="mt-1 text-xs text-slate-400">Track all system activity and user notifications.</p>
        </div>
        {tab === "notices" && unreadNotices > 0 && (
          <button onClick={markAllRead}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:text-white transition">
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-white/10">
        <button onClick={() => setTab("activity")}
          className={`px-4 py-2.5 text-sm font-medium transition ${tab === "activity" ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
          Activity Log ({logs.length})
        </button>
        <button onClick={() => setTab("notices")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition ${tab === "notices" ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
          My Notifications
          {unreadNotices > 0 && <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-900">{unreadNotices}</span>}
        </button>
      </div>

      {/* ── ACTIVITY LOG ────────────────────────────────── */}
      {tab === "activity" && (
        <div>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="flex flex-1 min-w-48 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
              <Search className="h-4 w-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action or user..."
                className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
              <option value="All">All Types</option>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Stats row */}
          <div className="mb-4 grid grid-cols-4 gap-3">
            {Object.entries(
              logs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {} as Record<string, number>)
            ).slice(0, 4).map(([type, count]) => {
              const s = getTypeStyle(type);
              const Icon = s.icon;
              return (
                <div key={type} className={`rounded-xl border p-3 flex items-center gap-3 ${s.color}`}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-lg font-bold text-white">{count as number}</p>
                    <p className="text-[10px] text-slate-500">{type}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <p className="text-slate-400">No activity recorded yet.</p>
              <p className="mt-1 text-xs text-slate-600">Actions like login, add student, post notice will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => {
                const s    = getTypeStyle(log.type);
                const Icon = s.icon;
                return (
                  <div key={log.id} className={`flex items-start gap-3 rounded-xl border p-3 ${s.color}`}>
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{log.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{log.user_name}</span>
                        <span className="text-[10px] text-slate-600">·</span>
                        <span className="text-[10px] text-slate-600 capitalize">{log.role}</span>
                        <span className="text-[10px] text-slate-600">·</span>
                        <span className="text-[10px] text-slate-600">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${s.color}`}>{log.type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS ────────────────────────────────── */}
      {tab === "notices" && (
        <div className="space-y-2">
          {notices.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No notifications yet.</p>
          ) : notices.map(n => {
            const isRead = n.read || readIds.has(n.id);
            return (
              <div key={n.id} onClick={async () => {
                await fetch(`${NOTIF_API}/${n.id}/read`, { method: "PATCH", headers: h() }).catch(() => {});
                setNotices(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                setReadIds(prev => new Set([...prev, n.id]));
              }}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${!isRead ? "border-amber-500/20 bg-amber-500/5" : "border-white/5 bg-white/[0.02] hover:bg-white/5"}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isRead ? "bg-slate-600" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isRead ? "text-slate-300" : "text-white"}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 truncate">{n.message}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
