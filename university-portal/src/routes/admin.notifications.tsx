import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Megaphone, FileText, DoorOpen, Wallet, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotificationsPage });

const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

type Notice = { id: number; title: string; body: string; category: string; priority: string; created_at: string };

const ICON_MAP: Record<string, React.ElementType> = {
  Academic: Megaphone, Finance: Wallet, General: Bell,
  Event: Bell, Library: FileText,
};
const PRIORITY_COLOR: Record<string, string> = {
  High:   "border-rose-500/30 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Low:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

function AdminNotificationsPage() {
  const [notices, setNotices]   = useState<Notice[]>([]);
  const [readIds, setReadIds]   = useState<Set<number>>(new Set());
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/notices", { headers: h() })
      .then(r => r.json())
      .then(d => setNotices(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unread = notices.filter(n => !readIds.has(n.id)).length;

  function markRead(id: number) {
    setReadIds(prev => new Set([...prev, id]));
  }

  function markAllRead() {
    setReadIds(new Set(notices.map(n => n.id)));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unread > 0 && <p className="mt-1 text-sm text-amber-400">{unread} unread notification{unread !== 1 ? "s" : ""}</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading notifications...</p>
      ) : notices.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">No notifications yet.</p>
          <p className="mt-1 text-xs text-slate-600">Post a notice to notify students and teachers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(n => {
            const Icon    = ICON_MAP[n.category] || Bell;
            const isRead  = readIds.has(n.id);
            const priCls  = PRIORITY_COLOR[n.priority] || PRIORITY_COLOR.Medium;
            return (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition ${
                  isRead ? "border-white/5 bg-white/[0.02]" : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                }`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isRead ? "bg-white/5 text-slate-500" : "bg-amber-500/20 text-amber-400"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold ${isRead ? "text-slate-300" : "text-white"}`}>{n.title}</p>
                      <p className="mt-0.5 text-sm text-slate-400 line-clamp-2">{n.body}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${priCls}`}>{n.priority}</span>
                      <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                      {!isRead && <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />}
                    </div>
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
