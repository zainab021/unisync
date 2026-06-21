import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import { adminCalendarEvents, calendarCategories } from "@/data/data";

export const Route = createFileRoute("/admin/academic-calendar")({ component: AdminAcademicCalendarPage });

const COLOR_CLASSES: Record<string, string> = {
  amber: "bg-amber-500/20 border-amber-500/40 text-amber-300",
  emerald: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  sky: "bg-sky-500/20 border-sky-500/40 text-sky-300",
  rose: "bg-rose-500/20 border-rose-500/40 text-rose-300",
  violet: "bg-violet-500/20 border-violet-500/40 text-violet-300",
};

function AdminAcademicCalendarPage() {
  const [events, setEvents] = useState(adminCalendarEvents);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // June = 6
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", endDate: "", category: "Academic", color: "amber" });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthName = new Date(year, month - 1, 1).toLocaleString("default", { month: "long" });

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date <= dateStr && e.endDate >= dateStr);
  };

  const handleSave = () => {
    if (!form.title || !form.date) { toast.error("Title and date required"); return; }
    setEvents((p) => [...p, { id: Date.now(), ...form, endDate: form.endDate || form.date }]);
    toast.success("Event added to calendar");
    setModalOpen(false);
    setForm({ title: "", date: "", endDate: "", category: "Academic", color: "amber" });
  };

  const handleDelete = (id: number) => { setEvents((p) => p.filter((e) => e.id !== id)); toast.success("Event removed"); };

  const dayEvents = selectedDay ? events.filter((e) => e.date <= selectedDay && e.endDate >= selectedDay) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Academic Calendar</h1>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {/* Month Navigator */}
      <div className="mb-4 flex items-center gap-4">
        <button onClick={prevMonth} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"><ChevronLeft className="h-4 w-4" /></button>
        <h2 className="text-lg font-bold text-white min-w-[160px] text-center">{monthName} {year}</h2>
        <button onClick={nextMonth} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-white/5" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvs = getEventsForDay(day);
            const isToday = dateStr === "2026-06-20";
            const isSelected = dateStr === selectedDay;
            return (
              <div key={day} onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`min-h-[80px] cursor-pointer border-b border-r border-white/5 p-1.5 transition hover:bg-white/[0.03] ${isSelected ? "bg-amber-500/10" : ""}`}>
                <span className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-amber-500 text-slate-900" : "text-slate-400"}`}>{day}</span>
                <div className="space-y-0.5">
                  {dayEvs.slice(0, 2).map((e) => (
                    <div key={e.id} className={`truncate rounded border px-1 py-0.5 text-[10px] font-medium ${COLOR_CLASSES[e.color] || COLOR_CLASSES.amber}`}>{e.title}</div>
                  ))}
                  {dayEvs.length > 2 && <div className="text-[10px] text-slate-500">+{dayEvs.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDay && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-3 text-sm font-semibold text-white">Events on {selectedDay}</p>
          {dayEvents.length === 0 ? <p className="text-sm text-slate-500">No events on this day.</p> : (
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2.5">
                  <div>
                    <p className="font-medium text-white">{e.title}</p>
                    <p className="text-xs text-slate-400">{e.category} · {e.date}{e.endDate !== e.date ? ` → ${e.endDate}` : ""}</p>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events List */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">All Events</p>
      <div className="space-y-2">
        {events.sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${e.color === "amber" ? "bg-amber-400" : e.color === "emerald" ? "bg-emerald-400" : e.color === "sky" ? "bg-sky-400" : e.color === "rose" ? "bg-rose-400" : "bg-violet-400"}`} />
              <div>
                <p className="font-medium text-white">{e.title}</p>
                <p className="text-xs text-slate-400">{e.category} · {e.date}{e.endDate !== e.date ? ` → ${e.endDate}` : ""}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(e.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Calendar Event">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Start Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {calendarCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Color</label>
              <select value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {Object.keys(COLOR_CLASSES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
            <button onClick={handleSave} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">Add Event</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
