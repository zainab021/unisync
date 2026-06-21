import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminCourses, adminTeachers } from "@/data/data";

export const Route = createFileRoute("/admin/timetable")({ component: AdminTimetablePage });

const API = "http://localhost:5000/api/timetable";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Slot = { id: number; slot_name: string; start_time: string; end_time: string };
type Room = { id: number; room_name: string; type_name: string };
type Entry = { id: number; day: string; slot_id: number; course_code: string; course_name: string; teacher_name: string; room_name: string };

function getToken() { return localStorage.getItem("token") ?? ""; }

function AdminTimetablePage() {
  const [slots, setSlots]     = useState<Slot[]>([]);
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selecting, setSelecting] = useState<{ day: string; slot_id: number } | null>(null);
  const [form, setForm] = useState({ course_code: "", teacher_id: "", room_id: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/slots`).then(r => r.json()).then(setSlots).catch(() => {});
    fetch(`${API}/rooms`).then(r => r.json()).then(setRooms).catch(() => {});
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
  }

  function getCell(day: string, slot_id: number) {
    return entries.find(e => e.day === day && e.slot_id === slot_id) ?? null;
  }

  function handleCellClick(day: string, slot_id: number) {
    const cell = getCell(day, slot_id);
    setSelecting({ day, slot_id });
    if (cell) {
      const course = adminCourses.find(c => c.name === cell.course_name);
      const teacher = adminTeachers.find(t => t.name === cell.teacher_name);
      const room = rooms.find(r => r.room_name === cell.room_name);
      setForm({
        course_code: course?.code ?? cell.course_code,
        teacher_id: teacher?.id ?? "",
        room_id: room?.id?.toString() ?? "",
      });
    } else {
      setForm({ course_code: adminCourses[0]?.code ?? "", teacher_id: adminTeachers[0]?.id ?? "", room_id: rooms[0]?.id?.toString() ?? "" });
    }
  }

  async function handleAssign() {
    if (!selecting) return;
    setLoading(true);
    const existing = getCell(selecting.day, selecting.slot_id);
    const body = { ...form, room_id: Number(form.room_id), day: selecting.day, slot_id: selecting.slot_id };
    try {
      if (existing) {
        await fetch(`${API}/${existing.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) });
        toast.success("Slot updated");
      } else {
        await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) });
        toast.success("Slot assigned");
      }
      await fetchEntries();
      setSelecting(null);
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  async function handleClear() {
    if (!selecting) return;
    const existing = getCell(selecting.day, selecting.slot_id);
    if (!existing) { setSelecting(null); return; }
    setLoading(true);
    try {
      await fetch(`${API}/${existing.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success("Slot cleared");
      await fetchEntries();
      setSelecting(null);
    } catch { toast.error("Failed to clear"); }
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
      </div>
      <p className="mb-4 text-xs text-slate-500">Click any cell to assign or modify a slot.</p>

      <div className="overflow-x-auto rounded-xl bg-slate-900/50">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Time</th>
              {DAYS.map(d => (
                <th key={d} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {slot.start_time} – {slot.end_time}
                </td>
                {DAYS.map(day => {
                  const cell = getCell(day, slot.id);
                  const isSelected = selecting?.day === day && selecting?.slot_id === slot.id;
                  return (
                    <td key={day} className="px-2 py-2" onClick={() => handleCellClick(day, slot.id)}>
                      <div className={`min-h-[60px] cursor-pointer rounded-lg border p-2 transition ${isSelected ? "border-amber-500 bg-amber-500/20" : cell ? "border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15" : "border-dashed border-white/10 hover:border-white/20"}`}>
                        {cell ? (
                          <>
                            <p className="text-[11px] font-semibold text-amber-300 leading-tight">{cell.course_name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{cell.room_name}</p>
                            <p className="text-[10px] text-slate-500">{cell.teacher_name}</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-slate-600 text-center pt-2">+ Add</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecting && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-4 text-sm font-semibold text-white">
            Assign: {selecting.day} — {slots.find(s => s.id === selecting.slot_id)?.start_time}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course</label>
              <select value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {adminCourses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {adminTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Room</label>
              <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name} ({r.type_name})</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAssign} disabled={loading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition disabled:opacity-50">
              {loading ? "Saving..." : "Assign"}
            </button>
            <button onClick={handleClear} disabled={loading} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition">Clear Slot</button>
            <button onClick={() => setSelecting(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
