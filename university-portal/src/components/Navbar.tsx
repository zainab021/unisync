import { Bell, LogOut, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";
import { connectSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NOTIF_COLORS: Record<string, string> = {
  success: "bg-emerald-400",
  danger:  "bg-rose-400",
  warning: "bg-amber-400",
  info:    "bg-sky-400",
};

export function Navbar() {
  const pathname  = useRouterState({ select: (s) => s.location.pathname });
  const navigate  = useNavigate();
  const [open, setOpen]         = useState(false);
  const [notices, setNotices]   = useState<any[]>([]);
  const [readIds, setReadIds]   = useState<Set<number>>(new Set());
  const darkMode = true;
  const [search, setSearch]     = useState("");
  const [results, setResults]   = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const name      = localStorage.getItem("userName") || "User";
  const role      = localStorage.getItem("role") || "student";
  const userId    = localStorage.getItem("profileId") || "";
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const avatarLetters = name.split(" ").filter(w => w.length > 0 && isNaN(Number(w[0]))).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";


  // Fetch notifications
  function fetchNotifs() {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("https://unisync-4ovf.onrender.com/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d : [])).catch(() => {});
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);

    // Socket.io real-time
    if (userId) {
      const socket = connectSocket(userId);
      socket.on("notification", (notif: any) => {
        setNotices(prev => [notif, ...prev]);
        toast(notif.title, { description: notif.message });
      });
    }

    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Global search
  useEffect(() => {
    if (search.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem("token") ?? "";
        const res   = await fetch(`https://unisync-4ovf.onrender.com/api/search?q=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  function handleLogout() { signOut(); navigate({ to: "/" }); }

  async function markAllRead() {
    const token = localStorage.getItem("token") ?? "";
    await fetch("https://unisync-4ovf.onrender.com/api/notifications/read-all/all", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setNotices(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function markRead(id: number) {
    const token = localStorage.getItem("token") ?? "";
    await fetch(`https://unisync-4ovf.onrender.com/api/notifications/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setNotices(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setReadIds(prev => new Set([...prev, id]));
  }

  const unread = notices.filter(n => !n.read && !readIds.has(n.id)).length;

  const TYPE_ICONS: Record<string, string> = {
    student: "👨‍🎓", teacher: "👩‍🏫", course: "📚", notice: "📢", exam: "📝"
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-6 backdrop-blur-xl transition-colors",
      darkMode ? "border-white/5 bg-slate-950/80" : "border-slate-200 bg-white/90"
    )}>
      {/* Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className={cn("flex items-center gap-2 rounded-lg border px-3 focus-within:ring-1 ring-amber-500/50 transition",
          darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students, courses, notices..."
            className={cn("flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-500",
              darkMode ? "text-slate-200" : "text-slate-800")}
          />
          {search && (
            <button onClick={() => { setSearch(""); setResults([]); }}>
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {(results.length > 0 || searching) && (
          <div className={cn("absolute top-full mt-1 w-full rounded-xl border shadow-xl z-50 overflow-hidden",
            darkMode ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white")}>
            {searching ? (
              <p className="px-4 py-3 text-xs text-slate-500">Searching...</p>
            ) : results.map((r, i) => (
              <button key={i} onClick={() => { navigate({ to: r.link as any }); setSearch(""); setResults([]); }}
                className={cn("flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-amber-500/10 transition",
                  darkMode ? "text-slate-200" : "text-slate-700")}>
                <span className="text-lg">{TYPE_ICONS[r.type] ?? "🔍"}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.label}</p>
                  <p className="text-xs text-slate-500 truncate">{r.sub} · {r.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setOpen(o => !o)}
            className={cn("relative grid h-9 w-9 place-items-center rounded-lg border transition",
              darkMode ? "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200")}>
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-900">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className={cn("absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95",
              darkMode ? "border-white/10 bg-slate-900/95" : "border-slate-200 bg-white")}>
              <div className="flex items-center justify-between border-b px-4 py-3"
                style={{ borderColor: darkMode ? "rgba(255,255,255,0.05)" : "#e2e8f0" }}>
                <p className={cn("text-sm font-semibold", darkMode ? "text-white" : "text-slate-800")}>Notifications</p>
                <button onClick={markAllRead} className="text-xs text-amber-500 hover:underline">Mark all read</button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notices.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-slate-500">No notifications yet.</li>
                ) : notices.map(n => {
                  const isRead = n.read || readIds.has(n.id);
                  return (
                    <li key={n.id} onClick={() => markRead(n.id)}
                      className={cn("flex items-start gap-3 border-b px-4 py-3 hover:bg-amber-500/5 cursor-pointer transition",
                        !isRead && (darkMode ? "bg-amber-500/5" : "bg-amber-50"),
                        darkMode ? "border-white/5" : "border-slate-100")}>
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", isRead ? "bg-slate-400" : (NOTIF_COLORS[n.type] || "bg-sky-400"))} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", darkMode ? "text-slate-200" : "text-slate-800")}>{n.title}</p>
                        <p className="text-xs text-slate-500 truncate">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* User */}
        <div className={cn("flex items-center gap-3 border-l pl-3", darkMode ? "border-white/5" : "border-slate-200")}>
          <div className="hidden text-right sm:block">
            <p className={cn("text-sm font-semibold leading-tight", darkMode ? "text-white" : "text-slate-800")}>{name}</p>
            <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-500 uppercase">
              {roleLabel}
            </span>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-slate-900 shadow-md">
            {avatarLetters}
          </div>
          <button onClick={handleLogout}
            className={cn("grid h-9 w-9 place-items-center rounded-lg border transition",
              darkMode ? "border-white/5 bg-white/5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300" : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500")}
            title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
