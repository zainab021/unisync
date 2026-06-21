import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, DoorOpen, Wallet, FileText, GraduationCap, ClipboardList, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { adminNotifications } from "@/data/data";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotificationsPage });

const TYPE_ICONS: Record<string, React.ElementType> = { room: DoorOpen, fee: Wallet, doc: FileText, results: GraduationCap, enrollment: ClipboardList };

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(adminNotifications);

  const markAllRead = () => { setNotifications((p) => p.map((n) => ({ ...n, read: true }))); toast.success("All notifications marked as read"); };
  const markRead = (id: number) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unread > 0 && <p className="text-sm text-amber-400 mt-1">{unread} unread notification{unread !== 1 ? "s" : ""}</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = TYPE_ICONS[n.type] || Bell;
          return (
            <div key={n.id} onClick={() => markRead(n.id)}
              className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition ${n.read ? "border-white/5 bg-white/[0.02]" : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"}`}>
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.read ? "bg-white/5" : "bg-amber-500/20"}`}>
                <Icon className={`h-5 w-5 ${n.read ? "text-slate-500" : "text-amber-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.read ? "text-slate-300" : "text-white"}`}>{n.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">{n.time}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-400">{n.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
