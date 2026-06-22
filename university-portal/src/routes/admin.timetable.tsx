import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/timetable")({ component: AdminTimetablePage });

const API        = "http://localhost:5000/api/timetable";
const COURSES_API = "http://localhost:5000/api/courses";
const TEACHERS_API = "http://localhost:5000/api/teachers";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Slot    = { id: number; slot_name: string; start_time: string; end_time: string };
type Room    = { id: number; room_name: string; type_name: string; capacity: number };
type Entry   = { id: number; day: string; slot_id: number; course_code: string; course_name: string; teacher_name: string; room_name: string };
type Course  = { code: string; name: string; teacher_name?: string };
type Teacher = { id: string; name: string; department: string };
type Clash   = { message: string; clash: string };

function getToken() { return localStorage.getItem("token") ?? ""; }
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

function AdminTimetablePage() {
  const [slots, setSlots]       = useState<Slot[]>([]);
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [courses, setCourses]   = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [entries, setEntries]   = useState<Entry[]>([]);
  const [clashes, setClashes]   = useState<{ roomClashes: any[]; teacherClashes: any[]; totalClashes: number }>({ roomClashes: [], teacherClashes: [], totalClashes: 0 });
  const [selecting, setSelecting] = useState<{ day: string; slot_id: number } | null>(null);
  const [form, setForm]         = useState({ course_code: "", teacher_id: "", room_id: "" });
  const [loading, setLoading]   = useState(false);
  const [view, setView]         = useState<"assign" | "room">("assign");
  const [selectedRoom, setSelectedRoom] = useState("");

  useEffect(() => {
    fetch(`${API}/slots`).then(r => r.json()).then(setSlots).catch(() => {});
    fetch(`${API}/rooms`).then(r => r.json()).then(setRooms).catch(() => {});
    fetch(COURSES_API,  { headers: h() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(TEACHERS_API, { headers: h() }).then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => {});
    fetchEntries();
    fetchClashes();
  }, []);

  async function fetchEntries() {
    try {
      const res  = await fetch(API, { headers: h() });
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
  }

  async function fetchClashes() {
    try {
      const res  = await fetch(`${API}/clashes`, { headers: h() });
      const data = await res.json();
      setClashes(data);
    } catch {}
  }

  function getCell(day: string, slot_id: number) {
    return entries.find(e => e.day === day && e.slot_id === slot_id) ?? null;
  }

  function handleCellClick(day: string, slot_id: number) {
    const cell = getCell(day, slot_id);
    setSelecting({ day, slot_id });
    if (cell) {
      const teacher = teachers.find(t => t.name === cell.teacher_name);
      const room    = rooms.find(r => r.room_name === cell.room_name);
      setForm({
        course_code: cell.course_code,
        teacher_id:  teacher?.id ?? "",
        room_id:     room?.id?.toString() ?? "",
      });
    } else {
      setForm({
        course_code: courses[0]?.code ?? "",
        teacher_id:  teachers[0]?.id ?? "",
        room_id:     rooms[0]?.id?.toString() ?? "",
      });
    }
  }

  async function handleAssign() {
    if (!selecting) return;
    setLoading(true);
    const existing = getCell(selecting.day, selecting.slot_id);
    const body = { ...form, room_id: Number(form.room_id), day: selecting.day, slot_id: selecting.slot_id };
    try {
      let res;
      if (existing) {
        res = await fetch(`${API}/${existing.id}`, { method: "PUT", headers: h(), body: JSON.stringify(body) });
      } else {
        res = await fetch(API, { method: "POST", headers: h(), body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (!res.ok) {
        if (data.clash === "room")    toast.error(`Room Clash: ${data.message}`, { icon: "🏫" });
        else if (data.clash === "teacher") toast.error(`Teacher Clash: ${data.message}`, { icon: "👨‍🏫" });
        else toast.error(data.message);
      } else {
        toast.success(existing ? "Slot updated" : "Slot assigned");
        await fetchEntries();
        await fetchClashes();
        setSelecting(null);
      }
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  async function handleClear() {
    if (!selecting) return;
    const existing = getCell(selecting.day, selecting.slot_id);
    if (!existing) { setSelecting(null); return; }
    setLoading(true);
    try {
      await fetch(`${API}/${existing.id}`, { method: "DELETE", headers: h() });
      toast.success("Slot cleared");
      await fetchEntries();
      await fetchClashes();
      setSelecting(null);
    } catch { toast.error("Failed to clear"); }
    setLoading(false);
  }

  // Room view: get all entries for selected room
  const roomEntries = selectedRoom
    ? entries.filter(e => e.room_name === selectedRoom)
    : [];
  const roomInfo = rooms.find(r => r.room_name === selectedRoom);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
          <p className="mt-1 text-xs text-slate-400">
            {view === "assign" ? "Click any cell to assign course, teacher and room." : "Select a room to view its full schedule."}
          </p>
        </div>
        {clashes.totalClashes > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-300">{clashes.totalClashes} Clash{clashes.totalClashes > 1 ? "es" : ""} Detected</span>
          </div>
        ) : entries.length > 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">No Conflicts</span>
          </div>
        ) : null}
      </div>

      {/* View Tabs */}
      <div className="mb-5 flex gap-1 border-b border-white/10">
        <button onClick={() => setView("assign")}
          className={`px-4 py-2.5 text-sm font-medium transition ${view === "assign" ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
          Assign Timetable
        </button>
        <button onClick={() => setView("room")}
          className={`px-4 py-2.5 text-sm font-medium transition ${view === "room" ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
          Room Schedule
        </button>
      </div>

      {/* ── ROOM VIEW ──────────────────────────────────────────── */}
      {view === "room" && (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 min-w-48">
              <option value="">— Select Room —</option>
              {rooms.map(r => (
                <option key={r.id} value={r.room_name}>
                  {r.room_name} ({r.type_name}, Cap: {r.capacity})
                </option>
              ))}
            </select>
            {roomInfo && (
              <div className="flex gap-3 text-sm">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
                  Type: <span className="text-white font-medium">{roomInfo.type_name}</span>
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
                  Capacity: <span className="text-amber-400 font-bold">{roomInfo.capacity}</span>
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
                  Booked: <span className="text-emerald-400 font-bold">{roomEntries.length}</span> slots
                </span>
              </div>
            )}
          </div>

          {!selectedRoom ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <p className="text-slate-400">Select a room to view its timetable.</p>
            </div>
          ) : roomEntries.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <p className="text-slate-400">No classes scheduled in <strong className="text-white">{selectedRoom}</strong> yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-400">Time Slot</th>
                    {DAYS.map(d => (
                      <th key={d} className="px-3 py-3 text-left text-xs uppercase tracking-wider text-slate-400">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id} className="border-b border-white/5">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-slate-400">{slot.slot_name}</p>
                        <p className="text-[10px] text-slate-600">{slot.start_time}–{slot.end_time}</p>
                      </td>
                      {DAYS.map(day => {
                        const entry = roomEntries.find(e => e.day === day && e.slot_id === slot.id);
                        return (
                          <td key={day} className="px-2 py-2">
                            {entry ? (
                              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                                <p className="text-xs font-bold text-amber-300 truncate">{entry.course_name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">👤 {entry.teacher_name}</p>
                                <p className="text-[10px] text-slate-500">{entry.course_code}</p>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-white/5 h-14 flex items-center justify-center">
                                <span className="text-[10px] text-slate-700">Free</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ASSIGN VIEW ────────────────────────────────────────── */}
      {view === "assign" && <>

      {/* Clash Warnings */}
      {clashes.roomClashes.length > 0 && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-rose-400">Room Clashes</p>
          {clashes.roomClashes.map((c, i) => (
            <p key={i} className="text-xs text-rose-300">• {c.room_name} — {c.day}: "{c.course1}" and "{c.course2}" both assigned</p>
          ))}
        </div>
      )}
      {clashes.teacherClashes.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-amber-400">Teacher Clashes</p>
          {clashes.teacherClashes.map((c, i) => (
            <p key={i} className="text-xs text-amber-300">• {c.teacher_name} — {c.day}: "{c.course1}" and "{c.course2}" overlap</p>
          ))}
        </div>
      )}

      {/* Timetable Grid */}
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
            {slots.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">Loading slots...</td></tr>
            )}
            {slots.map(slot => (
              <tr key={slot.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  <span className="font-semibold text-slate-400">{slot.slot_name}</span>
                  <br />{slot.start_time} – {slot.end_time}
                </td>
                {DAYS.map(day => {
                  const cell       = getCell(day, slot.id);
                  const isSelected = selecting?.day === day && selecting?.slot_id === slot.id;
                  return (
                    <td key={day} className="px-2 py-2" onClick={() => handleCellClick(day, slot.id)}>
                      <div className={`min-h-[64px] cursor-pointer rounded-lg border p-2 transition ${
                        isSelected ? "border-amber-500 bg-amber-500/20" :
                        cell ? "border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15" :
                        "border-dashed border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5"
                      }`}>
                        {cell ? (
                          <>
                            <p className="text-[11px] font-bold text-amber-300 leading-tight">{cell.course_name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">🏫 {cell.room_name}</p>
                            <p className="text-[10px] text-slate-500">👤 {cell.teacher_name}</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-slate-600 text-center pt-3">+ Add</p>
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

      {/* Assignment Panel */}
      {selecting && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-4 text-sm font-semibold text-white">
            Assign: <span className="text-amber-400">{selecting.day}</span> —{" "}
            {slots.find(s => s.id === selecting.slot_id)?.start_time} – {slots.find(s => s.id === selecting.slot_id)?.end_time}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course</label>
              <select value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
                <option value="">— Select Course —</option>
                {courses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
                <option value="">— Select Teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Room</label>
              <select value={form.room_id} onChange={e => setForm(f => ({ ...f, room_id: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50">
                <option value="">— Select Room —</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name} ({r.type_name}, cap: {r.capacity})</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleAssign} disabled={loading || !form.course_code || !form.teacher_id || !form.room_id}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition disabled:opacity-50">
              {loading ? "Saving..." : "Assign"}
            </button>
            <button onClick={handleClear} disabled={loading}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition">
              Clear Slot
            </button>
            <button onClick={() => setSelecting(null)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Room Status */}
      {rooms.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Room Status Dashboard</p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rooms.map(r => {
              const bookings = entries.filter(e => e.room_name === r.room_name).length;
              const pct = Math.round((bookings / (DAYS.length * slots.length)) * 100);
              return (
                <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-white">{r.room_name}</p>
                    <span className="text-[10px] text-slate-500">{r.type_name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Capacity: {r.capacity} · Booked: {bookings} slots</p>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${pct > 70 ? "bg-rose-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="mt-1 text-right text-[10px] text-slate-500">{pct}% utilized</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </> }
    </div>
  );
}
