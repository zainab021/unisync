import { Bell, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname  = useRouterState({ select: (s) => s.location.pathname });
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const name   = localStorage.getItem("userName") || "User";
  const role   = localStorage.getItem("role") || "student";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const avatarLetters = name
    .split(" ")
    .filter(w => w.length > 0 && isNaN(Number(w[0])))
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const avatar = avatarLetters || name.slice(0, 2).toUpperCase() || "U";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Fetch in-app notifications
    fetch("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setNotices(Array.isArray(d) ? d : []))
      .catch(() => {});

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` }
      }).then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d : [])).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    signOut();
    navigate({ to: "/" });
  }

  const unread = notices.filter(n => !n.read && !readIds.has(n.id)).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-slate-950/80 px-6 backdrop-blur-xl">
      {/* Left — portal label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/70">
          {roleLabel} Portal
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-900">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-white">Notifications</p>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token") ?? "";
                    await fetch("http://localhost:5000/api/notifications/read-all/all", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
                    setNotices(prev => prev.map(n => ({ ...n, read: true })));
                    setReadIds(new Set(notices.map(n => n.id)));
                  }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notices.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-slate-500">No notifications yet.</li>
                ) : notices.map(n => {
                  const isRead = n.read || readIds.has(n.id);
                  const dotColor = n.type === "success" ? "bg-emerald-400" : n.type === "danger" ? "bg-rose-400" : n.type === "warning" ? "bg-amber-400" : "bg-sky-400";
                  return (
                    <li
                      key={n.id}
                      onClick={async () => {
                        const token = localStorage.getItem("token") ?? "";
                        await fetch(`http://localhost:5000/api/notifications/${n.id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
                        setNotices(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                        setReadIds(prev => new Set([...prev, n.id]));
                      }}
                      className={cn(
                        "flex items-start gap-3 border-b border-white/5 px-4 py-3 hover:bg-white/5 cursor-pointer transition",
                        !isRead && "bg-amber-500/5"
                      )}
                    >
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", isRead ? "bg-slate-600" : dotColor)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 truncate">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3 border-l border-white/5 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{name}</p>
            <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-300 uppercase">
              {roleLabel}
            </span>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-slate-900 shadow-md">
            {avatar}
          </div>
          <button
            onClick={handleLogout}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300 transition"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
