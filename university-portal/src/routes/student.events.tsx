import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/student/events")({
  head: () => ({ meta: [{ title: "Events — Student Portal" }] }),
  component: EventsPage,
});

const API = "https://unisync-4ovf.onrender.com/api/events";
const getToken = () => localStorage.getItem("token") ?? "";

type Event = { id: number; title: string; date: string; end_date?: string; category: string; color: string; created_by_name?: string };

const COLOR_MAP: Record<string, string> = {
  amber:   "border-amber-500/30 bg-amber-500/10 text-amber-300",
  blue:    "border-blue-500/30 bg-blue-500/10 text-blue-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rose:    "border-rose-500/30 bg-rose-500/10 text-rose-300",
  violet:  "border-violet-500/30 bg-violet-500/10 text-violet-300",
  sky:     "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

const CATEGORIES = ["All", "Academic", "Cultural", "Sports", "Holiday", "Exam", "General"];

function EventsPage() {
  const [events, setEvents]   = useState<Event[]>([]);
  const [filter, setFilter]   = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today);
  const past     = events.filter(e => e.date < today);
  const filtered = filter === "All" ? upcoming : upcoming.filter(e => e.category === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Events & Calendar</h1>
        <p className="mt-1 text-sm text-slate-400">University events, holidays and academic dates.</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${filter === c ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading events...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <Calendar className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">No upcoming events.</p>
          <p className="mt-1 text-xs text-slate-600">Admin will post events here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(e => {
            const cls = COLOR_MAP[e.color] ?? COLOR_MAP.amber;
            return (
              <div key={e.id} className={`rounded-2xl border p-5 ${cls}`}>
                <div className="mb-3 flex items-start justify-between">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${cls}`}>
                    {e.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg leading-tight">{e.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  {e.end_date && e.end_date !== e.date && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Until {new Date(e.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  )}
                  {e.created_by_name && (
                    <p className="text-xs text-slate-600">Posted by {e.created_by_name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-600">Past Events</p>
          <div className="space-y-2">
            {past.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 opacity-60">
                <Calendar className="h-4 w-4 text-slate-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400">{e.title}</p>
                  <p className="text-xs text-slate-600">{new Date(e.date).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-slate-600">{e.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
