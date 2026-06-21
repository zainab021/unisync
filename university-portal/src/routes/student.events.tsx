import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { events } from "@/data/data";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/student/events")({
  head: () => ({ meta: [{ title: "Events — Student Portal" }] }),
  component: EventsPage,
});

function EventsPage() {
  // Calendar state
  const initial = new Date(events[0]?.date ?? Date.now());
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [selected, setSelected] = useState<typeof events[number] | null>(null);

  const monthLabel = new Date(year, month).toLocaleString("en", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, typeof events>();
    for (const e of events) {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(e);
      }
    }
    return map;
  }, [year, month]);

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Campus Events</h1>
        <p className="mt-1 text-sm text-slate-400">Click any highlighted date to view details.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
              }}
              className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
              }}
              className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const dayEvents = eventsByDay.get(d) ?? [];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
            return (
              <button
                key={i}
                onClick={() => dayEvents[0] && setSelected(dayEvents[0])}
                className={`relative h-20 rounded-lg border p-2 text-left transition ${
                  dayEvents.length
                    ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                } ${isToday ? "ring-1 ring-amber-400" : ""}`}
              >
                <p className={`text-xs font-semibold ${dayEvents.length ? "text-amber-300" : "text-slate-400"}`}>{d}</p>
                {dayEvents[0] && (
                  <p className="mt-1 text-[10px] text-amber-200/90 truncate">{dayEvents[0].title}</p>
                )}
                {dayEvents.length > 1 && (
                  <p className="text-[10px] text-amber-400">+{dayEvents.length - 1} more</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" /> {selected.date} · {selected.time}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> {selected.venue}</p>
            <p className="text-slate-400">{selected.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
