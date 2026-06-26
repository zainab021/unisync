import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/admin/timetable")({ component: AdminTimetablePage });

const API         = "https://unisync-4ovf.onrender.com/api/timetable";
const COURSES_API = "https://unisync-4ovf.onrender.com/api/courses";
const TEACHERS_API = "https://unisync-4ovf.onrender.com/api/teachers";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Slot    = { id: number; slot_name: string; start_time: string; end_time: string };
type Room    = { id: number; room_name: string; type_name: string; capacity: number };
type Entry   = { id: number; day: string; slot_id: number; course_code: string; course_name: string; teacher_name: string; room_name: string };
type Course  = { code: string; name: string; teacher_name?: string };
type Teacher = { id: string; name: string; department: string };

function getToken() { return localStorage.getItem("token") ?? ""; }
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const TYPE_COLORS: Record<string, string> = {
  Classroom: "border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10",
  Lab:       "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
  Hall:      "border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10",
};

function AdminTimetablePage() {
  const [slots, setSlots]       = useState<Slot[]>([]);
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [courses, setCourses]   = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [entries, setEntries]   = useState<Entry[]>([]);
  const [clashes, setClashes]   = useState({ roomClashes: [] as any[], teacherClashes: [] as any[], totalClashes: 0 });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selecting, setSelecting] = useState<{ day: string; slot_id: number } | null>(null);
  const [form, setForm]         = useState({ course_code: "", teacher_id: "" });
  const [loading, setLoading]   = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    fetch(`${API}/slots`).then(r => r.json()).then(setSlots).catch(() => {});
    fetch(`${API}/rooms`).then(r => r.json()).then(setRooms).catch(() => {});
    fetch(COURSES_API,   { headers: h() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(TEACHERS_API,  { headers: h() }).then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => {});
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

  function getCell(day: string, slot_id: number, roomName: string) {
    return entries.find(e => e.day === day && e.slot_id === slot_id && e.room_name === roomName) ?? null;
  }

  function handleCellClick(day: string, slot_id: number) {
    if (!selectedRoom) return;
    const cell = getCell(day, slot_id, selectedRoom.room_name);
    setSelecting({ day, slot_id });
    if (cell) {
      const teacher = teachers.find(t => t.name === cell.teacher_name);
      setForm({ course_code: cell.course_code, teacher_id: teacher?.id ?? "" });
    } else {
      setForm({ course_code: courses[0]?.code ?? "", teacher_id: teachers[0]?.id ?? "" });
    }
  }

  async function handleAssign() {
    if (!selecting || !selectedRoom) return;
    setLoading(true);
    const existing = getCell(selecting.day, selecting.slot_id, selectedRoom.room_name);
    const body = { ...form, room_id: selectedRoom.id, day: selecting.day, slot_id: selecting.slot_id };
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
    if (!selecting || !selectedRoom) return;
    const existing = getCell(selecting.day, selecting.slot_id, selectedRoom.room_name);
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

  // Rooms filter
  const filteredRooms = rooms.filter(r => {
    const q = roomSearch.toLowerCase();
    return (!roomSearch || r.room_name.toLowerCase().includes(q)) &&
           (typeFilter === "All" || r.type_name === typeFilter);
  });

  // Room utilization
  function getRoomUtil(roomName: string) {
    const booked = entries.filter(e => e.room_name === roomName).length;
    const total  = DAYS.length * slots.length;
    return { booked, pct: total > 0 ? Math.round((booked / total) * 100) : 0 };
  }

  const roomEntries = selectedRoom
    ? entries.filter(e => e.room_name === selectedRoom.room_name)
    : [];

  // ── ROOM TIMETABLE VIEW ──────────────────────────────────────────
  if (selectedRoom) {
    const util = getRoomUtil(selectedRoom.room_name);
    return (
      <div>
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => { setSelectedRoom(null); setSelecting(null); }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white transition">
            <ChevronLeft className="h-4 w-4" /> All Rooms
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedRoom.room_name}</h1>
            <p className="text-xs text-slate-400">{selectedRoom.type_name} · Capacity: {selectedRoom.capacity} students · {util.booked} slots booked ({util.pct}% utilized)</p>
          </div>
          {clashes.totalClashes > 0 && (
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-semibold text-rose-300">{clashes.totalClashes} Conflict{clashes.totalClashes > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        <p className="mb-3 text-xs text-slate-500">Click any empty slot to assign a class · Click filled slot to edit or clear</p>

        {/* Timetable Grid */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-400 w-28">Time</th>
                {DAYS.map(d => (
                  <th key={d} className="px-3 py-3 text-center text-xs uppercase tracking-wider text-slate-400">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-400">{slot.slot_name}</p>
                    <p className="text-[10px] text-slate-600 tabular-nums">{slot.start_time}–{slot.end_time}</p>
                  </td>
                  {DAYS.map(day => {
                    const cell       = getCell(day, slot.id, selectedRoom.room_name);
                    const isSelected = selecting?.day === day && selecting?.slot_id === slot.id;
                    return (
                      <td key={day} className="px-2 py-2" onClick={() => handleCellClick(day, slot.id)}>
                        <div className={`min-h-[70px] cursor-pointer rounded-xl border p-2.5 transition ${
                          isSelected ? "border-amber-500 bg-amber-500/20" :
                          cell ? "border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/15" :
                          "border-dashed border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5"
                        }`}>
                          {cell ? (
                            <>
                              <p className="text-[11px] font-bold text-amber-300 leading-tight">{cell.course_name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">👤 {cell.teacher_name}</p>
                              <p className="text-[10px] text-slate-600">{cell.course_code}</p>
                            </>
                          ) : (
                            <p className="text-[10px] text-slate-700 text-center pt-3">+ Add Class</p>
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
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                {selectedRoom.room_name}
              </div>
              <p className="text-sm font-semibold text-white">
                {selecting.day} — {slots.find(s => s.id === selecting.slot_id)?.start_time} – {slots.find(s => s.id === selecting.slot_id)?.end_time}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.department})</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleAssign} disabled={loading || !form.course_code || !form.teacher_id}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition">
                {loading ? "Saving..." : getCell(selecting.day, selecting.slot_id, selectedRoom.room_name) ? "Update" : "Assign"}
              </button>
              {getCell(selecting.day, selecting.slot_id, selectedRoom.room_name) && (
                <button onClick={handleClear} disabled={loading}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition">
                  Clear Slot
                </button>
              )}
              <button onClick={() => setSelecting(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ROOM SELECTION VIEW ──────────────────────────────────────────
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
          <p className="mt-1 text-xs text-slate-400">Select a room to view and manage its timetable.</p>
        </div>
        {clashes.totalClashes > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-300">{clashes.totalClashes} Conflict{clashes.totalClashes > 1 ? "s" : ""} Detected</span>
          </div>
        )}
      </div>

      {/* Search + Filter */}
      <div className="mb-5 flex gap-3">
        <input value={roomSearch} onChange={e => setRoomSearch(e.target.value)} placeholder="Search room..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 placeholder:text-slate-600" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50">
          <option value="All">All Types</option>
          <option value="Classroom">Classrooms</option>
          <option value="Lab">Labs</option>
          <option value="Hall">Halls</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {[
          { label: "Total Rooms",    val: rooms.length,                             color: "sky" },
          { label: "Slots Assigned", val: entries.length,                           color: "amber" },
          { label: "Conflicts",      val: clashes.totalClashes,                     color: clashes.totalClashes > 0 ? "rose" : "emerald" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-${s.color}-500/20 bg-${s.color}-500/5 p-4 text-center`}>
            <p className={`text-3xl font-bold text-${s.color}-400`}>{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRooms.map(r => {
          const { booked, pct } = getRoomUtil(r.room_name);
          const clsColor = TYPE_COLORS[r.type_name] ?? TYPE_COLORS.Classroom;
          return (
            <button key={r.id} onClick={() => setSelectedRoom(r)}
              className={`rounded-2xl border p-4 text-left transition cursor-pointer ${clsColor}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-white text-base">{r.room_name}</p>
                  <p className="text-xs text-slate-500">{r.type_name}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  r.type_name === "Lab" ? "border-emerald-500/30 text-emerald-400" :
                  r.type_name === "Hall" ? "border-violet-500/30 text-violet-400" :
                  "border-sky-500/30 text-sky-400"
                }`}>{r.type_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Capacity: <strong className="text-white">{r.capacity}</strong></span>
                <span>Booked: <strong className="text-amber-400">{booked}</strong> slots</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div className={`h-full rounded-full transition-all ${pct > 70 ? "bg-rose-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className="mt-1 text-right text-[10px] text-slate-600">{pct}% utilized</p>
            </button>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">No rooms found.</p>
      )}
    </div>
  );
}
