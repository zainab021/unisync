import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, BookOpen, Wallet, ClipboardCheck, FileText, Calendar, MessageSquare, Clock } from "lucide-react";

export const Route = createFileRoute("/student/activity")({
  head: () => ({ meta: [{ title: "My Activity — Student Portal" }] }),
  component: StudentActivityPage,
});

const API = "https://unisync-4ovf.onrender.com/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

const SECTION_ICONS: Record<string, any> = {
  notification: { icon: Bell,          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",   label: "Notification" },
  enrollment:   { icon: BookOpen,       color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Enrollment" },
  fee:          { icon: Wallet,         color: "text-sky-400 bg-sky-500/10 border-sky-500/20",         label: "Fee" },
  attendance:   { icon: ClipboardCheck, color: "text-violet-400 bg-violet-500/10 border-violet-500/20", label: "Attendance" },
  exam:         { icon: FileText,       color: "text-rose-400 bg-rose-500/10 border-rose-500/20",      label: "Exam" },
  notice:       { icon: Bell,           color: "text-orange-400 bg-orange-500/10 border-orange-500/20", label: "Notice" },
  message:      { icon: MessageSquare,  color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", label: "Message" },
};

function StudentActivityPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [enrollments, setEnrollments]     = useState<any[]>([]);
  const [fees, setFees]                   = useState<any[]>([]);
  const [notices, setNotices]             = useState<any[]>([]);
  const [messages, setMessages]           = useState<any[]>([]);
  const [filter, setFilter]               = useState("All");
  const studentId = localStorage.getItem("profileId") ?? "";

  useEffect(() => {
    fetch(`${API}/notifications`,  { headers: h() }).then(r => r.json()).then(d => setNotifications(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/enrollment?student_id=${studentId}`, { headers: h() }).then(r => r.json()).then(d => setEnrollments(Array.isArray(d) ? d.filter((e: any) => e.student_id === studentId) : [])).catch(() => {});
    fetch(`${API}/fees/my`,        { headers: h() }).then(r => r.json()).then(d => setFees(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/notices`,        { headers: h() }).then(r => r.json()).then(d => setNotices(Array.isArray(d) ? d.slice(0, 10) : [])).catch(() => {});
    fetch(`${API}/messages/inbox`, { headers: h() }).then(r => r.json()).then(d => setMessages(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Build unified timeline
  const timeline: any[] = [
    ...notifications.map(n => ({
      type: "notification", title: n.title, desc: n.message,
      date: n.created_at, read: n.read,
    })),
    ...enrollments.map(e => ({
      type: "enrollment", title: `Enrolled in ${e.course_name}`,
      desc: `${e.semester} · Status: ${e.status}`, date: e.created_at, read: true,
    })),
    ...fees.map(f => ({
      type: "fee", title: `Fee ${f.status}: ${f.semester}`,
      desc: `PKR ${Number(f.amount).toLocaleString()} · Due: ${f.due_date?.slice(0,10)}`,
      date: f.created_at, read: true,
    })),
    ...notices.map(n => ({
      type: "notice", title: n.title, desc: n.body?.slice(0, 80) + "...",
      date: n.created_at, read: true,
    })),
    ...messages.map(m => ({
      type: "message", title: `Message from ${m.sender_name}`,
      desc: m.body?.slice(0, 80), date: m.created_at, read: m.read,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = filter === "All" ? timeline : timeline.filter(t => t.type === filter.toLowerCase());
  const unread   = timeline.filter(t => !t.read).length;

  const FILTERS = ["All", "Notification", "Enrollment", "Fee", "Notice", "Message"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Activity</h1>
          <p className="mt-1 text-sm text-slate-400">Your personal activity history — view only.</p>
        </div>
        {unread > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center">
            <p className="text-xl font-bold text-amber-400">{unread}</p>
            <p className="text-xs text-slate-500">Unread</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Activities", val: timeline.length,  color: "sky" },
          { label: "Enrollments",      val: enrollments.length, color: "emerald" },
          { label: "Messages",         val: messages.length,    color: "violet" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-${s.color}-500/20 bg-${s.color}-500/5 p-4 text-center`}>
            <p className={`text-3xl font-bold text-${s.color}-400`}>{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${filter === f ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <Clock className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const s    = SECTION_ICONS[item.type] ?? SECTION_ICONS.notification;
            const Icon = s.icon;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 transition ${!item.read ? `${s.color} opacity-100` : "border-white/5 bg-white/[0.02]"}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!item.read ? "text-white" : "text-slate-300"}`}>{item.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${s.color}`}>{s.label}</span>
                  </div>
                  {item.desc && <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>}
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(item.date).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-slate-700">This is a read-only view of your activity history.</p>
    </div>
  );
}
